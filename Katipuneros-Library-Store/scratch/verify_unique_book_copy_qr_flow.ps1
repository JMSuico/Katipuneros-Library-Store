# ==============================================================================
# KATIPUNEROS LIBRARY STORE - PHYSICAL BOOK COPY & UNIQUE QR CODE VERIFICATION
# End-to-End Closed Loop: Admin Inventory -> QR Generation -> Cashier Scan & Return
# ==============================================================================

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:5000/api"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "PHYSICAL BOOK COPY & UNIQUE QR CODE SCAN/RETURN VERIFICATION" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# STEP 1: AUTHENTICATION (Patron, Cashier, Admin)
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 1] Authenticating Role Accounts..." -ForegroundColor Yellow

# Admin Login
$adminRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"testadmin","password":"Password123!"}'
$adminToken = $adminRes.data.token
$adminHeaders = @{ "Authorization" = "Bearer $adminToken"; "Content-Type" = "application/json" }
Write-Host "  [OK] Admin Authenticated: $($adminRes.data.fullName)" -ForegroundColor Green

# Cashier Login
$cashierRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"testcashier","password":"Password123!"}'
$cashierToken = $cashierRes.data.token
$cashierHeaders = @{ "Authorization" = "Bearer $cashierToken"; "Content-Type" = "application/json" }
Write-Host "  [OK] Cashier Authenticated: $($cashierRes.data.fullName)" -ForegroundColor Green

# Patron Registration (Dynamic for idempotency)
$uId = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$patronRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body (@{
    firstName = "QR"
    lastName = "Tester"
    username = "qr_patron_$uId"
    email = "qr_patron_$uId@test.edu.ph"
    password = "Password123!"
    employmentStatus = "Student"
    currentAddress = "Katipunan Avenue"
    permanentAddress = "Quezon City"
    department = "Circulation Studies"
    phoneNumber = "+639123456789"
} | ConvertTo-Json)
$patronToken = $patronRes.data.token
$patronHeaders = @{ "Authorization" = "Bearer $patronToken"; "Content-Type" = "application/json" }
$patronId = $patronRes.data.userId
Write-Host "  [OK] Patron Authenticated: $($patronRes.data.fullName) ($patronId)" -ForegroundColor Green

# ------------------------------------------------------------------------------
# STEP 2: SYNC AND RETRIEVE PHYSICAL BOOK COPIES IN ADMIN
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 2] Synchronizing Physical Inventory & Generating Initial Copies..." -ForegroundColor Yellow

$syncRes = Invoke-RestMethod -Uri "$baseUrl/copies/sync-all" -Method Post -Headers $adminHeaders
Write-Host "  [OK] Sync All Copies: $($syncRes.message) (Seeded Copies: $($syncRes.data.seededCopies))" -ForegroundColor Green

# Fetch catalog books
$booksRes = Invoke-RestMethod -Uri "$baseUrl/books" -Method Get
$testBook = $booksRes.data | Where-Object { $_.availableCopies -gt 0 } | Select-Object -First 1
if (-not $testBook) {
    $testBook = $booksRes.data[0]
}
$bookId = $testBook.id
Write-Host "  [TARGET BOOK] '$($testBook.title)' (ID: $bookId, Total: $($testBook.totalCopies), Available: $($testBook.availableCopies))" -ForegroundColor Cyan

# Fetch existing physical copies for this book
$copiesRes = Invoke-RestMethod -Uri "$baseUrl/books/$bookId/copies" -Headers $adminHeaders
Write-Host "  [OK] Retrieved $($copiesRes.data.Count) existing physical copy records." -ForegroundColor Green

# Create an explicit new volume copy via Admin API
$newCopyPayload = @{
    bayLocation = "Bay A3-Top Shelf"
    condition = "Pristine Brand New"
    conditionNotes = "Acquired for QR validation test"
} | ConvertTo-Json

$createdCopyRes = Invoke-RestMethod -Uri "$baseUrl/books/$bookId/copies" -Method Post -Headers $adminHeaders -Body $newCopyPayload
$createdCopy = $createdCopyRes.data
Write-Host "  [OK] Created New Physical Copy Volume:" -ForegroundColor Green
Write-Host "       Copy Number: #$($createdCopy.copyNumber)" -ForegroundColor Gray
Write-Host "       Accession Number: $($createdCopy.accessionNumber)" -ForegroundColor Gray
Write-Host "       QR Code Payload: $($createdCopy.qrCodeData)" -ForegroundColor Gray
Write-Host "       Location: $($createdCopy.bayLocation)" -ForegroundColor Gray
Write-Host "       Initial Status: $($createdCopy.status)" -ForegroundColor Gray

# ------------------------------------------------------------------------------
# STEP 3: RESOLVE PHYSICAL COPY VIA SCANNER ENDPOINT (Accession & QR Payload)
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 3] Testing Cashier QR/Barcode Scanner Resolution..." -ForegroundColor Yellow

# Test 3a: Lookup by raw QR payload
$encodedQr = [System.Uri]::EscapeDataString($createdCopy.qrCodeData)
$scanByQr = Invoke-RestMethod -Uri "$baseUrl/copies/scan?code=$encodedQr" -Method Get -Headers $cashierHeaders
if ($scanByQr.success -and $scanByQr.data.copy.accessionNumber -eq $createdCopy.accessionNumber) {
    Write-Host "  [OK] Lookup by raw QR Code payload successful:" -ForegroundColor Green
    Write-Host "       Title: $($scanByQr.data.copy.bookTitle)" -ForegroundColor Gray
    Write-Host "       Accession: $($scanByQr.data.copy.accessionNumber)" -ForegroundColor Gray
    Write-Host "       Currently Borrowed: $($scanByQr.data.copy.isBorrowed)" -ForegroundColor Gray
} else {
    Write-Host "  [FAIL] Lookup by raw QR payload failed!" -ForegroundColor Red
    exit 1
}

# Test 3b: Lookup by manual Accession Number string
$scanByAcc = Invoke-RestMethod -Uri "$baseUrl/copies/scan?code=$($createdCopy.accessionNumber)" -Method Get -Headers $cashierHeaders
if ($scanByAcc.success -and $scanByAcc.data.copy.id -eq $createdCopy.id) {
    Write-Host "  [OK] Lookup by manual Accession Number successful!" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Lookup by Accession Number failed!" -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# STEP 4: CHECKOUT PHYSICAL COPY TO PATRON
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 4] Checking Out Volume Copy #$($createdCopy.copyNumber) to Patron..." -ForegroundColor Yellow

$checkoutBody = @{
    patronId = $patronId
    bookBarcodes = @( $createdCopy.accessionNumber )
    dueDate = (Get-Date).AddDays(14).ToString("o")
} | ConvertTo-Json

$checkoutRes = Invoke-RestMethod -Uri "$baseUrl/borrow/checkout" -Method Post -Headers $cashierHeaders -Body $checkoutBody
Write-Host "  [OK] Checkout Successful: $($checkoutRes.message)" -ForegroundColor Green

# ------------------------------------------------------------------------------
# STEP 5: VERIFY LIVE SCANNER SHOWS ACTIVE BORROWER DETAILS
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 5] Verifying Scanner Now Detects Active Loan & Patron Details..." -ForegroundColor Yellow

$scanWhileBorrowed = Invoke-RestMethod -Uri "$baseUrl/copies/scan?code=$($createdCopy.accessionNumber)" -Method Get -Headers $cashierHeaders
if ($scanWhileBorrowed.data.copy.isBorrowed -and $scanWhileBorrowed.data.activeLoan -ne $null) {
    Write-Host "  [OK] Scanner correctly reports active loan:" -ForegroundColor Green
    Write-Host "       Patron Name: $($scanWhileBorrowed.data.activeLoan.patronName)" -ForegroundColor Gray
    Write-Host "       Gate Pass: $($scanWhileBorrowed.data.activeLoan.gatePassCode)" -ForegroundColor Gray
    Write-Host "       Transaction ID: $($scanWhileBorrowed.data.activeLoan.transactionId)" -ForegroundColor Gray
} else {
    Write-Host "  [FAIL] Scanner did not associate active borrower with physical volume!" -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# STEP 6: CASHIER RETURNS PHYSICAL COPY WITH CONDITION 'DAMAGED'
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 6] Cashier Returns Volume with Damaged Condition Assessment..." -ForegroundColor Yellow

$returnDamagedPayload = @{
    barcode = $createdCopy.accessionNumber
    condition = "Damaged"
    damageFee = 150.00
    bookCopyId = $createdCopy.id
} | ConvertTo-Json

$returnDamagedRes = Invoke-RestMethod -Uri "$baseUrl/borrow/return" -Method Post -Headers $cashierHeaders -Body $returnDamagedPayload
Write-Host "  [OK] Return Processed. Assessed Fine: P$($returnDamagedRes.data.assessedFine)" -ForegroundColor Green

# Verify in Admin that the copy status is marked Damaged (3) and NOT returned to shelf
$updatedCopyAfterDamage = Invoke-RestMethod -Uri "$baseUrl/copies/$($createdCopy.id)" -Headers $adminHeaders
if ($updatedCopyAfterDamage.data.status -eq "Damaged" -or $updatedCopyAfterDamage.data.status -eq 3) {
    Write-Host "  [OK] Admin physical inventory correctly shows status as Damaged: $($updatedCopyAfterDamage.data.status)" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Copy status expected Damaged but was: $($updatedCopyAfterDamage.data.status)" -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# STEP 7: CLEANUP & GOOD CONDITION WORKFLOW VERIFICATION
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 7] Verifying Good Condition Return Workflow with Another Volume..." -ForegroundColor Yellow

# Create a second copy
$copy2Res = Invoke-RestMethod -Uri "$baseUrl/books/$bookId/copies" -Method Post -Headers $adminHeaders -Body (@{
    bayLocation = "Bay A3-Shelf 2"
    condition = "Excellent"
} | ConvertTo-Json)
$copy2 = $copy2Res.data

# Checkout second copy
$checkout2Res = Invoke-RestMethod -Uri "$baseUrl/borrow/checkout" -Method Post -Headers $cashierHeaders -Body (@{
    patronId = $patronId
    bookBarcodes = @( $copy2.accessionNumber )
} | ConvertTo-Json)

# Return second copy in 'Good' condition
$returnGoodRes = Invoke-RestMethod -Uri "$baseUrl/borrow/return" -Method Post -Headers $cashierHeaders -Body (@{
    barcode = $copy2.accessionNumber
    condition = "Good"
    damageFee = 0.00
    bookCopyId = $copy2.id
} | ConvertTo-Json)

$updatedCopy2 = Invoke-RestMethod -Uri "$baseUrl/copies/$($copy2.id)" -Headers $adminHeaders
if ($updatedCopy2.data.status -eq "Available" -or $updatedCopy2.data.status -eq 0) {
    Write-Host "  [OK] Good condition return restored copy to Available: $($updatedCopy2.data.status)" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Copy 2 status expected Available but was: $($updatedCopy2.data.status)" -ForegroundColor Red
    exit 1
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "ALL PHYSICAL BOOK COPY & QR CODE INTEGRATION TESTS PASSED!" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
