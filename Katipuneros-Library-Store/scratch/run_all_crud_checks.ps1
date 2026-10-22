# scratch/run_all_crud_checks.ps1 -- Automated test runner for all 6 CRUD loop criteria
$ErrorActionPreference = "Stop"

$tests = @(
    @{ Id = "CRIT-01"; Name = "crud-books"; Script = "verify_crud_books.ps1" },
    @{ Id = "CRIT-02"; Name = "crud-categories"; Script = "verify_crud_categories.ps1" },
    @{ Id = "CRIT-03"; Name = "crud-users"; Script = "verify_crud_users.ps1" },
    @{ Id = "CRIT-04"; Name = "crud-reservations"; Script = "verify_crud_reservations.ps1" },
    @{ Id = "CRIT-05"; Name = "crud-borrowings"; Script = "verify_crud_borrowings.ps1" },
    @{ Id = "CRIT-06"; Name = "crud-inquiries"; Script = "verify_crud_inquiries.ps1" },
    @{ Id = "CRIT-07"; Name = "crud-all-frontend-endpoints"; Script = "verify_all_frontend_to_backend_endpoints.ps1" }
)

$results = @()
$overallSuccess = $true

foreach ($test in $tests) {
    $targetScript = Join-Path $PSScriptRoot $test.Script
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host " RUNNING $($test.Id) ($($test.Name)): $targetScript" -ForegroundColor Cyan
    Write-Host "========================================================" -ForegroundColor Cyan

    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        & powershell -ExecutionPolicy Bypass -File $targetScript
        $sw.Stop()
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[PASS] $($test.Id) ($($test.Name)) in $($sw.ElapsedMilliseconds)ms" -ForegroundColor Green
            $results += [PSCustomObject]@{ Id = $test.Id; Name = $test.Name; Status = "PASS"; DurationMs = $sw.ElapsedMilliseconds }
        } else {
            $sw.Stop()
            Write-Host "[FAIL] $($test.Id) ($($test.Name)) exited with code $LASTEXITCODE" -ForegroundColor Red
            $results += [PSCustomObject]@{ Id = $test.Id; Name = $test.Name; Status = "FAIL"; DurationMs = $sw.ElapsedMilliseconds }
            $overallSuccess = $false
        }
    } catch {
        $sw.Stop()
        Write-Host "[FAIL] $($test.Id) ($($test.Name)) threw exception: $_" -ForegroundColor Red
        $results += [PSCustomObject]@{ Id = $test.Id; Name = $test.Name; Status = "FAIL"; DurationMs = $sw.ElapsedMilliseconds }
        $overallSuccess = $false
    }
}

Write-Host "`n========================================================" -ForegroundColor Yellow
Write-Host " SUMMARY LEDGER OF CRUD VERIFICATION CRITERIA" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow
$results | Format-Table -AutoSize

if ($overallSuccess) {
    Write-Host "`n>>> ALL 7 CRITERIA ALL GREEN: CRUD DATA FLOW PROVEN E2E <<<`n" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n>>> FAILURE DETECTED IN ONE OR MORE CRITERIA <<<`n" -ForegroundColor Red
    exit 1
}
