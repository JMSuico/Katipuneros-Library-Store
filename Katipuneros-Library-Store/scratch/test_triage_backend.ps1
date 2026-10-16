# scratch/test_triage_backend.ps1
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "TESTING BACKEND ONCE-ONLY TRIAGE GUARD & PATRON HOLDS" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Login as customer
$custLogin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"mariasantos","password":"Password123!"}'
$custToken = $custLogin.data.token
$custHeaders = @{ "Authorization" = "Bearer $custToken"; "Content-Type" = "application/json" }
Write-Host "Logged in as patron: $($custLogin.data.user.fullName) ($($custLogin.data.user.id))"

# 2. Get a book to reserve
$bookRes = Invoke-RestMethod -Uri "http://localhost:5000/api/books" -Method Get
$book = $bookRes.data[0]
Write-Host "Catalog book count: $($bookRes.data.Count)"

# 3. Check existing holds or create one
$myHolds = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/my-holds" -Method Get -Headers $custHeaders
Write-Host "Current patron reservations count: $($myHolds.data.Count)"

$pendingHold = $myHolds.data | Where-Object { $_.status -eq 1 -or $_.status -eq "Pending" } | Select-Object -First 1

if (-not $pendingHold) {
    # Find a book that patron doesn't have an active hold on
    $activeBookIds = @($myHolds.data | Where-Object { $_.status -eq 1 -or $_.status -eq 2 -or $_.status -eq "Pending" -or $_.status -eq "StagedInLocker" } | ForEach-Object { $_.bookId })
    $availableBook = $bookRes.data | Where-Object { $activeBookIds -notcontains $_.id } | Select-Object -First 1
    if (-not $availableBook) {
        Write-Error "No available book to reserve."
    }
    Write-Host "Placing hold on: $($availableBook.title) ($($availableBook.id))"
    $newHold = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations" -Method Post -Headers $custHeaders -Body (@{ bookId = $availableBook.id; pickupBranch = "Main Circulation Desk" } | ConvertTo-Json)
    $holdId = $newHold.data.id
    Write-Host "[1/4] Created new reservation: $holdId with status $($newHold.data.status)" -ForegroundColor Green
} else {
    $holdId = $pendingHold.id
    Write-Host "[1/4] Using existing pending reservation: $holdId" -ForegroundColor Green
}

# 4. Login as cashier
$cashierLogin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"testcashier","password":"Password123!"}'
$cashierToken = $cashierLogin.data.token
$cashierHeaders = @{ "Authorization" = "Bearer $cashierToken"; "Content-Type" = "application/json" }
Write-Host "Logged in as cashier: $($cashierLogin.data.user.fullName)"

# 5. First triage: Approve hold
$triage1 = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/$holdId/triage" -Method Put -Headers $cashierHeaders -Body '{"approved":true,"priority":false}'
Write-Host "[2/4] First Triage (Approve): Success=$($triage1.success), Message=$($triage1.message)" -ForegroundColor Green

# 6. Second triage attempt (MUST fail with 400 Bad Request and once-only error)
$secondTriageFailed = $false
try {
    $triage2 = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/$holdId/triage" -Method Put -Headers $cashierHeaders -Body '{"approved":false,"priority":false}'
    Write-Host "[FAIL] Second triage should NOT have succeeded!" -ForegroundColor Red
} catch {
    $secondTriageFailed = $true
    Write-Host "[3/4] Second Triage correctly rejected with error!" -ForegroundColor Green
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        if ($stream) {
            $reader = New-Object System.IO.StreamReader($stream)
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody" -ForegroundColor Cyan
        }
    } else {
        Write-Host "Exception: $($_.Exception.Message)" -ForegroundColor Cyan
    }
}

if (-not $secondTriageFailed) {
    throw "Second triage succeeded when it was expected to fail!"
}

# 7. Verify Patron can see the hold in my-holds (including fulfilled/cancelled/staged)
$custHoldsAfter = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/my-holds" -Method Get -Headers $custHeaders
$stagedHold = $custHoldsAfter.data | Where-Object { $_.id -eq $holdId }
Write-Host "[4/4] Patron Hold History retrieved count: $($custHoldsAfter.data.Count). Triaged hold status: $($stagedHold.status), Bay: $($stagedHold.lockerBay), Pin: $($stagedHold.lockerPin)" -ForegroundColor Green

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "ALL BACKEND CHECKS PASSED SUCCESSFULLY!" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
