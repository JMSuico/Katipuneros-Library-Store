# [Verification Script]
# verify_multi_browser_rate_limit_and_icons.ps1
# Validates multi-browser concurrent logins (Customer, Cashier, Admin), rate limiting resilience, and Katipunan icon branding.

$ErrorActionPreference = "Stop"
$BaseUrl = "http://localhost:5000"
$Results = @()

function Assert-Check {
    param(
        [string]$Name,
        [bool]$Passed,
        [string]$Details = ""
    )
    $script:Results += [PSCustomObject]@{
        Test = $Name
        Status = if ($Passed) { "PASS" } else { "FAIL" }
        Details = $Details
    }
    $color = if ($Passed) { "Green" } else { "Red" }
    Write-Host "$icon $Name - $Details" -ForegroundColor $color
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " STARTING MULTI-BROWSER RATE LIMIT & ICON VERIFICATION     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# -----------------------------------------------------------------------------
# Test 1: Verify Rate Limit Quota Headers on Local / Private Network
# -----------------------------------------------------------------------------
Write-Host "`n>>> Check 1: Rate Limit Headers on Local IP / Host..." -ForegroundColor Yellow
$healthRes = Invoke-WebRequest -Uri "$BaseUrl/api/health" -UseBasicParsing
$generalLimit = [int]$healthRes.Headers["X-RateLimit-Limit"]
Assert-Check "General Catalog Rate Limit Quota >= 10000" ($generalLimit -ge 10000) "Actual Limit: $generalLimit"

# Test auth limit header
$authProbeBody = '{"usernameOrEmail":"probe@katipuneros.edu.ph","password":"dummy"}'
try {
    $probeRes = Invoke-WebRequest -Uri "$BaseUrl/api/auth/login" -Method Post -Body $authProbeBody -ContentType "application/json" -UseBasicParsing
} catch {
    $probeRes = $_.Exception.Response
}
$authLimit = [int]$probeRes.Headers["X-RateLimit-Limit"]
Assert-Check "Authentication Rate Limit Quota >= 2000" ($authLimit -ge 2000) "Actual Auth Limit: $authLimit"

# -----------------------------------------------------------------------------
# Test 2: Multi-Browser & Multi-Account Simultaneous Logins
# -----------------------------------------------------------------------------
Write-Host "`n>>> Check 2: Multi-Role Concurrent Authentication (Customer + Cashier + Admin)..." -ForegroundColor Yellow

# Browser 1 / Tab 1: Customer Authentication
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$customerReg = @{
    fullName = "MultiBrowser Customer $ts"
    firstName = "Multi"
    lastName = "Customer"
    email = "multicust_$ts@katipuneros.edu.ph"
    username = "multicust_$ts"
    password = "Password123!"
    employmentStatus = "Student"
    currentAddress = "123 Katipunan Ave"
    permanentAddress = "123 Katipunan Ave"
} | ConvertTo-Json

$custRes = Invoke-RestMethod -Uri "$BaseUrl/api/auth/register" -Method Post -Body $customerReg -ContentType "application/json"
$customerToken = $custRes.Data.Token
Assert-Check "Customer Login / Registration (Browser 1/Tab 1)" ($custRes.Success -and !([string]::IsNullOrEmpty($customerToken))) "Role: $($custRes.Data.Role), Token acquired"

# Browser 2 / Tab 2: Cashier Authentication
$cashierLogin = @{
    identifier = "testcashier@katipuneros.edu.ph"
    password = "Password123!"
} | ConvertTo-Json

$cashierRes = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $cashierLogin -ContentType "application/json"
$cashierToken = $cashierRes.Data.Token
Assert-Check "Cashier Login (Browser 2/Tab 2)" ($cashierRes.Success -and $cashierRes.Data.Role -eq "Cashier") "Role: $($cashierRes.Data.Role), Token acquired"

# Browser 3 / Tab 3: Admin Authentication
$adminLogin = @{
    identifier = "testadmin@katipuneros.edu.ph"
    password = "Password123!"
} | ConvertTo-Json

$adminRes = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $adminLogin -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5174" }
$adminToken = $adminRes.Data.Token
Assert-Check "Admin Login (Browser 3/Tab 3)" ($adminRes.Success -and $adminRes.Data.Role -eq "Admin") "Role: $($adminRes.Data.Role), Token acquired"

# -----------------------------------------------------------------------------
# Test 3: Rapid Window / Tab Switch Burst Stress Test (No HTTP 429)
# -----------------------------------------------------------------------------
Write-Host "`n>>> Check 3: Multi-Session Rapid Burst Concurrency (Simulating Tab Switching)..." -ForegroundColor Yellow

$burstFailures = 0
$burstCount = 30
for ($i = 1; $i -le $burstCount; $i++) {
    try {
        # Alternate between Customer, Cashier, and Admin calls
        if ($i % 3 -eq 1) {
            $r = Invoke-WebRequest -Uri "$BaseUrl/api/auth/me" -Headers @{ "Authorization" = "Bearer $customerToken" } -UseBasicParsing
        } elseif ($i % 3 -eq 2) {
            $r = Invoke-WebRequest -Uri "$BaseUrl/api/auth/me" -Headers @{ "Authorization" = "Bearer $cashierToken" } -UseBasicParsing
        } else {
            $r = Invoke-WebRequest -Uri "$BaseUrl/api/admin/metrics" -Headers @{ "Authorization" = "Bearer $adminToken" } -UseBasicParsing
        }

        if ([int]$r.StatusCode -eq 429) {
            $burstFailures++
        }
    } catch {
        if ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 429) {
            $burstFailures++
        }
    }
}

Assert-Check "Rapid Burst ($burstCount calls): Zero HTTP 429 Rejections" ($burstFailures -eq 0) "Failures count: $burstFailures out of $burstCount"

# -----------------------------------------------------------------------------
# Test 4: Static Verification of Katipunan Icon Branding
# -----------------------------------------------------------------------------
Write-Host "`n>>> Check 4: Katipunan Brand Icon Standardization in UI Components..." -ForegroundColor Yellow

$filesToCheck = @(
    "Frontend\src\LayoutBars\LandingHeader.tsx",
    "Frontend\src\LayoutBars\CustomerHeader.tsx",
    "Frontend\src\LayoutBars\CashierSidebar.tsx",
    "Frontend\src\LayoutBars\AdminSidebar.tsx",
    "Frontend\src\LayoutBars\Footer.tsx"
)

foreach ($f in $filesToCheck) {
    $content = Get-Content -Path $f -Raw
    $hasKatipunanLogo = $content -match "KatipunanLogo"
    $hasFragileUrl = $content -match "lh3\.googleusercontent\.com"
    $passed = $hasKatipunanLogo -and (-not $hasFragileUrl)
    Assert-Check "Standardized Icon in $f" $passed "Uses KatipunanLogo: $hasKatipunanLogo, Fragile URL: $hasFragileUrl"
}

# -----------------------------------------------------------------------------
# Summary Report
# -----------------------------------------------------------------------------
Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " VERIFICATION SUMMARY REPORT                              " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
$Results | Format-Table -AutoSize

$allPassed = ($Results | Where-Object { $_.Status -eq "FAIL" }).Count -eq 0
if ($allPassed) {
    Write-Host "`n>>> ALL CHECKS PASSED: 100% GREEN <<<`n" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n>>> SOME CHECKS FAILED <<<`n" -ForegroundColor Red
    exit 1
}
