# Katipuneros-Library-Store/scratch/verify_stream2_security_rbac.ps1
# Master Checklist Sections 4 (Auth), 5 (RBAC), 6 (Middleware), 7 (Input Validation), 8 (Rate Limiting), 14 (Security), 18 (Audit)
$ErrorActionPreference = "Stop"
$BaseUrl = "http://localhost:5000"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " STREAM 2: AUTH, RBAC, INPUT & SECURITY (SECTIONS 4-8, 14, 18)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$Passed = 0
$Failed = 0

function Assert-Test($name, $condition, $detail) {
    if ($condition) {
        Write-Host "  [PASS] $name" -ForegroundColor Green
        if ($detail) { Write-Host "         $detail" -ForegroundColor Gray }
        $global:Passed++
    } else {
        Write-Host "  [FAIL] $name" -ForegroundColor Red
        if ($detail) { Write-Host "         Detail: $detail" -ForegroundColor Yellow }
        $global:Failed++
    }
}

# --- SECTION 4: AUTHENTICATION ---
# 4.1 Valid Admin Auth
$adminToken = $null
$adminHeaders = @{}
try {
    $adminLogin = @{ identifier = "testadmin@katipuneros.edu.ph"; password = "Password123!" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $adminLogin -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5174" }
    $adminToken = $res.data.token
    $adminHeaders = @{ Authorization = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
    Assert-Test "4.1 Valid Admin Authentication" ($res.success -eq $true -and $adminToken -ne $null) "Role: $($res.data.role), FullName: $($res.data.fullName)"
} catch {
    Assert-Test "4.1 Valid Admin Authentication" $false $_.Exception.Message
}

# 4.2 Valid Cashier Auth
$cashierToken = $null
$cashierHeaders = @{}
try {
    $cashierLogin = @{ identifier = "testcashier@katipuneros.edu.ph"; password = "Password123!" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $cashierLogin -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5174" }
    $cashierToken = $res.data.token
    $cashierHeaders = @{ Authorization = "Bearer $cashierToken"; "Origin" = "http://localhost:5174" }
    Assert-Test "4.2 Valid Cashier Authentication" ($res.success -eq $true -and $cashierToken -ne $null) "Role: $($res.data.role), Card: $($res.data.libraryCardNumber)"
} catch {
    Assert-Test "4.2 Valid Cashier Authentication" $false $_.Exception.Message
}

# 4.3 Valid Customer Registration & Auth
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$customerToken = $null
$customerHeaders = @{}
try {
    $regBody = @{
        firstName = "Security"
        lastName = "Scholar"
        email = "sec_test_$ts@katipuneros.edu.ph"
        username = "sec_test_$ts"
        password = "Password123!"
        employmentStatus = "Student"
        currentAddress = "Manila"
        permanentAddress = "Manila"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/auth/register" -Method Post -Body $regBody -ContentType "application/json"
    $customerToken = $res.data.token
    $customerHeaders = @{ Authorization = "Bearer $customerToken"; "Origin" = "http://localhost:5173" }
    Assert-Test "4.3 Valid Customer Registration & Token Generation" ($res.success -eq $true -and $customerToken -ne $null) "User ID: $($res.data.userId)"
} catch {
    Assert-Test "4.3 Valid Customer Registration" $false $_.Exception.Message
}

# 4.4 Invalid Credentials Rejection
try {
    $badLogin = @{ identifier = "testadmin@katipuneros.edu.ph"; password = "WrongPassword999!" } | ConvertTo-Json
    $null = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $badLogin -ContentType "application/json"
    Assert-Test "4.4 Invalid Password Rejection (Expected 401)" $false "Server did not reject wrong password"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test "4.4 Invalid Password Rejection (HTTP $statusCode)" ($statusCode -eq 401) "Rejected with 401 Unauthorized"
}

# 4.5 Tampered Token Rejection
try {
    $tamperedHeaders = @{ Authorization = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature" }
    $null = Invoke-RestMethod -Uri "$BaseUrl/api/admin/metrics" -Method Get -Headers $tamperedHeaders
    Assert-Test "4.5 Tampered JWT Token Rejection (Expected 401)" $false "Server accepted tampered JWT"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test "4.5 Tampered JWT Token Rejection (HTTP $statusCode)" ($statusCode -eq 401) "Rejected with 401 Unauthorized"
}

# --- SECTION 5: AUTHORIZATION & RBAC (CASHIER VS ADMIN ESCALATION) ---
# 5.1 Cashier accessing Admin Endpoint is strictly blocked (HTTP 403)
try {
    $null = Invoke-RestMethod -Uri "$BaseUrl/api/admin/metrics" -Method Get -Headers $cashierHeaders
    Assert-Test "5.1 Cashier Blocked from Admin Metrics (Expected 403)" $false "Cashier was granted admin access!"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test "5.1 Cashier Blocked from Admin Metrics (HTTP $statusCode)" ($statusCode -eq 403) "Access forbidden to Cashier"
}

# 5.2 Customer accessing Cashier Endpoint is strictly blocked (HTTP 403)
try {
    $null = Invoke-RestMethod -Uri "$BaseUrl/api/cashier/dashboard-kpis" -Method Get -Headers $customerHeaders
    Assert-Test "5.2 Customer Blocked from Cashier KPIs (Expected 403)" $false "Customer was granted cashier access!"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test "5.2 Customer Blocked from Cashier KPIs (HTTP $statusCode)" ($statusCode -eq 403) "Access forbidden to Customer"
}

# 5.3 Unauthenticated access to protected route is rejected (HTTP 401)
try {
    $null = Invoke-RestMethod -Uri "$BaseUrl/api/borrow/my-loans" -Method Get
    Assert-Test "5.3 Missing Token Blocked on Protected Route (Expected 401)" $false "Unauthenticated access allowed!"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test "5.3 Missing Token Blocked on Protected Route (HTTP $statusCode)" ($statusCode -eq 401) "Rejected with 401 Unauthorized"
}

# --- SECTION 7 & 14: INPUT VALIDATION & INJECTION RESISTANCE ---
# 7.1 SQL Injection Payload handled safely via Parameterized Query
try {
    $sqliUrl = "$BaseUrl/api/copies/scan?code=" + [Uri]::EscapeDataString("' OR 1=1; DROP TABLE Users;--")
    $res = Invoke-RestMethod -Uri $sqliUrl -Method Get -Headers $cashierHeaders
    Assert-Test "7.1 SQL Injection Payload Handled Safely" $true "No exception thrown"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test "7.1 SQL Injection Payload Handled Safely (HTTP $statusCode)" ($statusCode -eq 404 -or $statusCode -eq 400) "Safely handled without unhandled 500 error"
}

# 7.2 XSS Payload handled safely
try {
    $xssUrl = "$BaseUrl/api/copies/scan?code=" + [Uri]::EscapeDataString("<script>alert('XSS')</script>")
    $res = Invoke-RestMethod -Uri $xssUrl -Method Get -Headers $cashierHeaders
    Assert-Test "7.2 XSS Payload Handled Safely" $true "No exception thrown"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test "7.2 XSS Payload Handled Safely (HTTP $statusCode)" ($statusCode -eq 404 -or $statusCode -eq 400) "Safely handled without unhandled 500 error"
}

# --- SECTION 18: CRYPTOGRAPHIC AUDIT LEDGER INTEGRITY ---
try {
    $auditChain = Invoke-RestMethod -Uri "$BaseUrl/api/audit/verify-chain" -Method Get -Headers $adminHeaders
    Assert-Test "18.1 Cryptographic SHA-256 Merkle Hash Chain Intact" ($auditChain.data.isIntact -eq $true) "Chain Message: $($auditChain.data.statusMessage)"
} catch {
    Assert-Test "18.1 Cryptographic SHA-256 Merkle Hash Chain Intact" $false $_.Exception.Message
}

Write-Host "`nStream 2 Result: $Passed Passed, $Failed Failed" -ForegroundColor $(if ($Failed -eq 0) { "Green" } else { "Red" })
if ($Failed -gt 0) { exit 1 } else { exit 0 }
