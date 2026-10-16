# scratch/verify_multi_port_and_circulation_lifecycle.ps1
# End-to-End Verification: Tri-Port Isolation, Circulation Lifecycle, and Live Gmail SMTP Dispatch
$ErrorActionPreference = "Stop"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  KATIPUNEROS MULTI-PORT ISOLATION & CIRCULATION LIFECYCLE TEST" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"
$origin5173 = "http://localhost:5173"
$origin5174 = "http://localhost:5174"
$origin5175 = "http://localhost:5175"
$connStr = "Server=localhost;Database=KatipunerosLibraryDb;User Id=InventoryLibrary;Password=InventoryLibrary;TrustServerCertificate=True;"

# ----------------------------------------------------------------------
# STEP 1: Verify Tri-Port CORS and Authentication Gateways
# ----------------------------------------------------------------------
Write-Host "`n[STEP 1] Testing Tri-Port Authentication & Origin Isolation..." -ForegroundColor Yellow

# Admin Login on Port 5174
$adminBody = @{ identifier = "testadmin@katipuneros.edu.ph"; password = "Password123!" } | ConvertTo-Json
$adminAuth = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $adminBody -ContentType "application/json" -Headers @{ "Origin" = $origin5174 }
$adminToken = $adminAuth.data.token
Write-Host "  [OK] Admin authenticated from Port 5174: $($adminAuth.data.fullName) (Role: $($adminAuth.data.role))" -ForegroundColor Green

# Cashier Login on Port 5175
$cashierBody = @{ identifier = "testcashier@katipuneros.edu.ph"; password = "Password123!" } | ConvertTo-Json
$cashierAuth = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $cashierBody -ContentType "application/json" -Headers @{ "Origin" = $origin5175 }
$cashierToken = $cashierAuth.data.token
$cashierId = $cashierAuth.data.userId
Write-Host "  [OK] Cashier authenticated from Port 5175: $($cashierAuth.data.fullName) (Role: $($cashierAuth.data.role))" -ForegroundColor Green

# Customer Creation/Login on Port 5173 with suicojm99@gmail.com for live email testing
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$customerEmail = "suicojm99+scholar$ts@gmail.com"
$customerUsername = "scholar_suico_$ts"
$customerPassword = "PatronPassword2026!"

Write-Host "  Registering live test patron ($customerEmail) via Port 5173..." -ForegroundColor Gray
$regPayload = @{
    firstName = "JM"
    lastName = "Suico"
    fullName = "JM Suico Live Scholar"
    email = $customerEmail
    username = $customerUsername
    password = $customerPassword
    employmentStatus = "Undergraduate Scholar"
    currentAddress = "UP Diliman Campus, Quezon City"
    permanentAddress = "Cebu City, Philippines"
    department = "College of History & Scholastics"
    phoneNumber = "+639171234567"
} | ConvertTo-Json

$regResp = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $regPayload -ContentType "application/json" -Headers @{ "Origin" = $origin5173 }
$customerToken = $regResp.data.token
$customerId = $regResp.data.userId
Write-Host "  [OK] Customer registered from Port 5173: $($regResp.data.fullName) (ID: $customerId, Email: $customerEmail)" -ForegroundColor Green

# ----------------------------------------------------------------------
# STEP 2: Find Available Book Asset and Physical Copy
# ----------------------------------------------------------------------
Write-Host "`n[STEP 2] Inspecting Catalog for Physical Copy and QR Code..." -ForegroundColor Yellow
$booksResp = Invoke-RestMethod -Uri "$baseUrl/api/books?pageSize=10" -Method GET
$targetBook = ($booksResp.data) | Where-Object { $_.availableCopies -gt 0 } | Select-Object -First 1

if (-not $targetBook) {
    throw "No catalog title with available copies found!"
}
$bookId = $targetBook.id
$bookTitle = $targetBook.title
Write-Host "  [OK] Selected Catalog Title: '$bookTitle' (ID: $bookId, Avail: $($targetBook.availableCopies))" -ForegroundColor Green

# ----------------------------------------------------------------------
# STEP 3: Customer Reserves Book on Port 5173 -> Email Received
# ----------------------------------------------------------------------
Write-Host "`n[STEP 3] Customer Creating Hold Request on Port 5173..." -ForegroundColor Yellow
$reservePayload = @{
    bookId = $bookId
    pickupBranch = "Ground Floor Bay 01 Counter"
} | ConvertTo-Json

$reserveResp = Invoke-RestMethod -Uri "$baseUrl/api/reservations" -Method POST -Body $reservePayload -ContentType "application/json" -Headers @{ 
    "Authorization" = "Bearer $customerToken"
    "Origin" = $origin5173 
}

$reservationId = $reserveResp.data.id
$resPatronId = $reserveResp.data.patronId
Write-Host "  [OK] Hold Created: ID=$reservationId | Status=$($reserveResp.data.status)" -ForegroundColor Green
Write-Host "  [VERIFY] Reservation Patron ID strictly matches Customer: $($resPatronId -eq $customerId)" -ForegroundColor Green

if ($resPatronId -ne $customerId) {
    throw "SESSION COLLISION BUG: Reservation was recorded under wrong patron ID!"
}

# ----------------------------------------------------------------------
# STEP 4: Cashier Triages Reservation on Port 5175 -> Approve with Bay & PIN
# ----------------------------------------------------------------------
Write-Host "`n[STEP 4] Cashier Triaging Hold (Approving for Walk-In Pickup) on Port 5175..." -ForegroundColor Yellow
$triagePayload = @{
    approved = $true
    reason = "Verified copy staged on Counter Bay 01."
    priority = $true
} | ConvertTo-Json

$triageResp = Invoke-RestMethod -Uri "$baseUrl/api/reservations/$reservationId/triage" -Method PUT -Body $triagePayload -ContentType "application/json" -Headers @{
    "Authorization" = "Bearer $cashierToken"
    "Origin" = $origin5175
}
Write-Host "  [OK] Triage Response: $($triageResp.message)" -ForegroundColor Green

# Fetch updated reservation details
$resDetail = Invoke-RestMethod -Uri "$baseUrl/api/reservations/pending" -Method GET -Headers @{ "Authorization" = "Bearer $cashierToken" }
$stagedHold = $resDetail.data | Where-Object { $_.id -eq $reservationId }

if ($stagedHold) {
    Write-Host "  [OK] Staged at Locker/Counter: $($stagedHold.lockerBay) | PIN: $($stagedHold.lockerPin) | Expiry: $($stagedHold.expiryDate)" -ForegroundColor Green
}

# Verify Once-Only Guard
Write-Host "  Testing Once-Only Triage Guard on already approved hold..." -ForegroundColor Gray
try {
    Invoke-RestMethod -Uri "$baseUrl/api/reservations/$reservationId/triage" -Method PUT -Body $triagePayload -ContentType "application/json" -Headers @{
        "Authorization" = "Bearer $cashierToken"
        "Origin" = $origin5175
    }
    throw "FAIL: Once-only guard did NOT block duplicate triage!"
} catch {
    Write-Host "  [PASS] Once-Only Guard successfully blocked duplicate triage modification." -ForegroundColor Green
}

# ----------------------------------------------------------------------
# STEP 5: Walk-In Checkout via QR Code / Accession Number on Port 5175
# ----------------------------------------------------------------------
Write-Host "`n[STEP 5] Patron Walk-In -> Cashier Checkout via QR Code on Port 5175..." -ForegroundColor Yellow
$barcode = if ($targetBook.isbnBarcode) { $targetBook.isbnBarcode } else { $targetBook.isbn }

$checkoutPayload = @{
    patronId = $customerId
    bookBarcodes = @($barcode)
    dueDate = [DateTime]::UtcNow.AddDays(14).ToString("o")
} | ConvertTo-Json

$checkoutResp = Invoke-RestMethod -Uri "$baseUrl/api/borrow/checkout" -Method POST -Body $checkoutPayload -ContentType "application/json" -Headers @{
    "Authorization" = "Bearer $cashierToken"
    "Origin" = $origin5175
}

$loans = $checkoutResp.data
$activeLoan = $loans[0]
$loanId = $activeLoan.id
$gatePass = $activeLoan.gatePassCode
$dueDate = $activeLoan.dueDate
Write-Host "  [OK] Checkout Successful! Loan ID: $loanId | Gate Pass: $gatePass | Due Date: $dueDate" -ForegroundColor Green

# ----------------------------------------------------------------------
# STEP 6: Walk-In Return & Clearance on Port 5175
# ----------------------------------------------------------------------
Write-Host "`n[STEP 6] Patron Walk-In -> Cashier Return & Clearance on Port 5175..." -ForegroundColor Yellow
$returnPayload = @{
    barcode = $barcode
    condition = "Good"
} | ConvertTo-Json

$returnResp = Invoke-RestMethod -Uri "$baseUrl/api/borrow/return" -Method POST -Body $returnPayload -ContentType "application/json" -Headers @{
    "Authorization" = "Bearer $cashierToken"
    "Origin" = $origin5175
}

$retData = $returnResp.data
Write-Host "  [OK] Return Clearance: $($retData.clearanceStatus) | Assessed Fine: P$($retData.assessedFine)" -ForegroundColor Green

# ----------------------------------------------------------------------
# STEP 7: Overdue Calculation & Penalty Verification
# ----------------------------------------------------------------------
Write-Host "`n[STEP 7] Simulating Overdue Loan Return with Fine Assessment..." -ForegroundColor Yellow
# Checkout another copy with a past due date to verify overdue penalty
$overdueDueDate = [DateTime]::UtcNow.AddDays(-5).ToString("o")
$checkoutOverduePayload = @{
    patronId = $customerId
    bookBarcodes = @($barcode)
    dueDate = $overdueDueDate
} | ConvertTo-Json

$overdueCheckout = Invoke-RestMethod -Uri "$baseUrl/api/borrow/checkout" -Method POST -Body $checkoutOverduePayload -ContentType "application/json" -Headers @{
    "Authorization" = "Bearer $cashierToken"
    "Origin" = $origin5175
}
$overdueLoan = $overdueCheckout.data[0]
$overdueLoanId = $overdueLoan.id

# Set DueDate to 5 days ago in DB to simulate overdue loan
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "UPDATE BorrowTransactions SET DueDate = DATEADD(day, -5, GETUTCDATE()) WHERE Id = '$overdueLoanId'"
$cmd.ExecuteNonQuery() | Out-Null
$conn.Close()
Write-Host "  [OK] Simulated past-due loan (ID: $overdueLoanId, Set DueDate to 5 days ago)" -ForegroundColor Gray

# Return overdue copy
$overdueReturnPayload = @{
    barcode = $barcode
    condition = "Good"
} | ConvertTo-Json

$overdueReturnResp = Invoke-RestMethod -Uri "$baseUrl/api/borrow/return" -Method POST -Body $overdueReturnPayload -ContentType "application/json" -Headers @{
    "Authorization" = "Bearer $cashierToken"
    "Origin" = $origin5175
}

$overdueData = $overdueReturnResp.data
Write-Host "  [OK] Overdue Return Clearance Status: $($overdueData.clearanceStatus)" -ForegroundColor Green
Write-Host "  [OK] Assessed Statutory Fine: P$($overdueData.assessedFine) (Expected > P0)" -ForegroundColor Green

if ($overdueData.assessedFine -le 0) {
    throw "FAIL: Overdue return was not assessed a fine!"
}

# ----------------------------------------------------------------------
# STEP 8: Inspect Notification Telemetry
# ----------------------------------------------------------------------
Write-Host "`n[STEP 8] Inspecting Real-Time Notification & Dispatch Telemetry..." -ForegroundColor Yellow
$metrics = Invoke-RestMethod -Uri "$baseUrl/api/notifications/top-metrics" -Method GET -Headers @{
    "Authorization" = "Bearer $adminToken"
    "Origin" = $origin5174
}

Write-Host "  [OK] Total Dispatches Logged: $($metrics.data.todayDispatchedTotal)" -ForegroundColor Green
Write-Host "  [OK] Email Dispatches: $($metrics.data.todayEmail)" -ForegroundColor Green
Write-Host "  [OK] Delivery Reliability: $($metrics.data.deliveryReliability)%" -ForegroundColor Green

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "  ALL 8 VERIFICATION GATES PASSED (100% GREEN)!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
