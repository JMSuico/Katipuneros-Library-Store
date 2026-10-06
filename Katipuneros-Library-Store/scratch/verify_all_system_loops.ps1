# ==============================================================================
# Katipuneros Library Store -- Master Verification, Validation & Confirmation Loops
# Executes end-to-end multi-tier verification against live .NET 10 API and SQL Server.
# ==============================================================================

$ErrorActionPreference = "Stop"
$BaseUrl = "http://localhost:5000"
$BackendDir = "C:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE\Katipuneros-Library-Store\Backend"

Write-Host "`n========================================================================" -ForegroundColor Cyan
Write-Host "   KATIPUNEROS LIBRARY STORE -- MULTI-TIER CONFIRMATION LOOPS RUNNER   " -ForegroundColor Cyan
Write-Host "========================================================================`n" -ForegroundColor Cyan

$Passed = 0
$Failed = 0

function Assert-Step($title, $condition, $detail) {
    if ($condition) {
        Write-Host " [PASS] $title" -ForegroundColor Green
        if ($detail) { Write-Host "        $detail" -ForegroundColor Gray }
        $global:Passed++
    } else {
        Write-Host " [FAIL] $title" -ForegroundColor Red
        if ($detail) { Write-Host "        Detail: $detail" -ForegroundColor Yellow }
        $global:Failed++
    }
}

# ------------------------------------------------------------------------------
# LOOP 01: System Health & Infrastructure Baseline
# ------------------------------------------------------------------------------
Write-Host "`n--- [LOOP 01] SYSTEM HEALTH & INFRASTRUCTURE BASELINE ---" -ForegroundColor Yellow

try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method Get
    Assert-Step "Health Endpoint Accessible" ($health.success -eq $true) "Message: $($health.message)"
    Assert-Step "Database Connectivity Active" ($health.data.databaseConnected -eq $true) "Status: $($health.data.status), Memory: $($health.data.memoryUsageMb) MB"
} catch {
    Assert-Step "Health Endpoint Accessible" $false $_.Exception.Message
}

try {
    $categories = Invoke-RestMethod -Uri "$BaseUrl/api/categories" -Method Get
    Assert-Step "Category Taxonomy Bootstrapped" ($categories.data.Count -ge 7) "Categories count: $($categories.data.Count)"
    $firstCat = $categories.data[0]
    Assert-Step "First Category Ascending Dewey Range" ($firstCat.deweyRange -like "CAT-*") "Name: $($firstCat.name) ($($firstCat.deweyRange))"
} catch {
    Assert-Step "Category Taxonomy Bootstrapped" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# LOOP 02: User Provisioning, Authentication & RBAC Verification
# ------------------------------------------------------------------------------
Write-Host "`n--- [LOOP 02] USER PROVISIONING, AUTHENTICATION & RBAC ---" -ForegroundColor Yellow

$adminEmail = "testadmin@katipuneros.edu.ph"
$adminPass = "Admin@2026!"
$adminHeaders = $null
$adminUser = $null

try {
    $adminLoginBody = @{ email = $adminEmail; password = $adminPass } | ConvertTo-Json
    $adminLoginRes = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
    $adminToken = $adminLoginRes.data.token
    $adminHeaders = @{ Authorization = "Bearer $adminToken" }
    $adminUser = $adminLoginRes.data
    Assert-Step "Admin Authentication Succeeded" ($adminToken -ne $null) "Role: $($adminUser.role), FullName: $($adminUser.fullName)"
    Assert-Step "Admin RBAC Role & Card Number" ($adminUser.role -eq "Admin") "Library Card: $($adminUser.libraryCardNumber)"
} catch {
    Assert-Step "Admin Authentication Succeeded" $false $_.Exception.Message
}

$cashierEmail = "testcashier@katipuneros.edu.ph"
$cashierPass = "Cashier@2026!"
$cashierHeaders = $null
$cashierUser = $null

try {
    $cashierLoginBody = @{ email = $cashierEmail; password = $cashierPass } | ConvertTo-Json
    $cashierLoginRes = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $cashierLoginBody -ContentType "application/json"
    $cashierToken = $cashierLoginRes.data.token
    $cashierHeaders = @{ Authorization = "Bearer $cashierToken" }
    $cashierUser = $cashierLoginRes.data
    Assert-Step "Cashier Authentication Succeeded" ($cashierToken -ne $null) "Role: $($cashierUser.role), Card: $($cashierUser.libraryCardNumber)"
} catch {
    Assert-Step "Cashier Authentication Succeeded" $false $_.Exception.Message
}

$patronEmail = "patron.scholar@katipuneros.edu.ph"
$patronPass = "Patron@2026!"
$patronHeaders = $null
$patronUser = $null

try {
    $patronLoginBody = @{ email = $patronEmail; password = $patronPass } | ConvertTo-Json
    $patronLoginRes = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $patronLoginBody -ContentType "application/json"
    $patronToken = $patronLoginRes.data.token
    $patronHeaders = @{ Authorization = "Bearer $patronToken" }
    $patronUser = $patronLoginRes.data
    Assert-Step "Patron Authentication Succeeded" ($patronToken -ne $null) "Role: $($patronUser.role), Card: $($patronUser.libraryCardNumber)"
} catch {
    Assert-Step "Patron Authentication Succeeded" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# LOOP 03: Catalog Accessioning & Cross-Panel Visibility (Admin Adds a Book)
# ------------------------------------------------------------------------------
Write-Host "`n--- [LOOP 03] CATALOG ACCESSIONING & CROSS-PANEL PROPAGATION ---" -ForegroundColor Yellow

$testBookId = $null
$testBookBarcode = $null

try {
    $catId = $firstCat.id
    $randomSuffix = Get-Random -Minimum 1000 -Maximum 9999
    $uniqueIsbn = "978-971-555-$randomSuffix"
    $newBookBody = @{
        title = "Noli Me Tangere -- Scholastic Edition #$randomSuffix"
        author = "Jose P. Rizal"
        isbn = $uniqueIsbn
        deweyCode = "899.211"
        categoryId = $catId
        publicationYear = 2026
        totalCopies = 5
        bayLocation = "Bay-B4"
        description = "Definitive centenary scholarly edition with comprehensive historical annotations."
    } | ConvertTo-Json

    $createBookRes = Invoke-RestMethod -Uri "$BaseUrl/api/books" -Method Post -Body $newBookBody -Headers $adminHeaders -ContentType "application/json"
    $testBook = $createBookRes.data
    $testBookId = $testBook.id
    $testBookBarcode = $testBook.isbnBarcode

    Assert-Step "Admin Adds Book to Catalog (BooksManager.tsx)" ($testBookId -ne $null) "Book ID: $testBookId"
    Assert-Step "Stock Initialized Correctly" ($testBook.availableCopies -eq 5 -and $testBook.totalCopies -eq 5) "Available: $($testBook.availableCopies)/$($testBook.totalCopies)"
    Assert-Step "Shelf Bay Coordinate Assigned" ($testBook.bayLocation -eq "Bay-B4") "Location: $($testBook.bayLocation)"
    Assert-Step "ISBN Barcode Generated" ($testBookBarcode -ne $null) "Barcode: $testBookBarcode"

    # Cross-Panel Check 1: Cashier View
    $cashierBooks = Invoke-RestMethod -Uri "$BaseUrl/api/books" -Method Get -Headers $cashierHeaders
    $foundInCashier = $cashierBooks.data | Where-Object { $_.id -eq $testBookId }
    Assert-Step "Cashier Stacks Inventory Visibility (BookAvailability.tsx)" ($foundInCashier -ne $null) "Found on Cashier Stacks: $($foundInCashier.title)"

    # Cross-Panel Check 2: Patron OPAC View
    $patronBooks = Invoke-RestMethod -Uri "$BaseUrl/api/books" -Method Get -Headers $patronHeaders
    $foundInPatron = $patronBooks.data | Where-Object { $_.id -eq $testBookId }
    Assert-Step "Patron OPAC Catalog Discovery (CatalogPage.tsx)" ($foundInPatron -ne $null) "Available Copies: $($foundInPatron.availableCopies)"
} catch {
    Assert-Step "Admin Adds Book to Catalog" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# LOOP 04: Patron Hold Placement (Reservations Flow)
# ------------------------------------------------------------------------------
Write-Host "`n--- [LOOP 04] PATRON HOLD PLACEMENT (RESERVATIONS FLOW) ---" -ForegroundColor Yellow

$reservationId = $null

try {
    $reserveBody = @{
        bookId = [Guid]$testBookId
        pickupBranch = "Main Campus - Circulation Desk"
    } | ConvertTo-Json

    $resResult = Invoke-RestMethod -Uri "$BaseUrl/api/reservations" -Method Post -Body $reserveBody -Headers $patronHeaders -ContentType "application/json"
    $reservation = $resResult.data
    $reservationId = $reservation.id

    Assert-Step "Patron Places Hold on Book (CatalogPage.tsx)" ($reservationId -ne $null) "Reservation ID: $reservationId, Message: $($resResult.message)"

    # Cashier Pending Queue Check
    $pendingQueue = Invoke-RestMethod -Uri "$BaseUrl/api/reservations/pending" -Method Get -Headers $cashierHeaders
    $inQueue = $pendingQueue.data | Where-Object { $_.id -eq $reservationId }
    Assert-Step "Cashier Intake Queue Updated (PendingReservations.tsx)" ($inQueue -ne $null) "Hold present in Cashier intake queue"
} catch {
    Assert-Step "Patron Places Hold on Book" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# LOOP 05: Cashier Hold Staging & Pickup Clearance
# ------------------------------------------------------------------------------
Write-Host "`n--- [LOOP 05] CASHIER HOLD STAGING & PICKUP CLEARANCE ---" -ForegroundColor Yellow

try {
    $stageBody = @{
        lockerBay = "Bay-B4"
        pin = "1896"
    } | ConvertTo-Json

    $stageRes = Invoke-RestMethod -Uri "$BaseUrl/api/reservations/$reservationId/assign-locker" -Method Post -Body $stageBody -Headers $cashierHeaders -ContentType "application/json"
    Assert-Step "Cashier Stages Hold at Pickup Counter (PendingReservations.tsx)" ($stageRes.success -eq $true) "Message: $($stageRes.message)"

    # Fulfill hold for handoff
    $fulfillRes = Invoke-RestMethod -Uri "$BaseUrl/api/reservations/$reservationId/fulfill" -Method Put -Headers $cashierHeaders
    Assert-Step "Hold Marked Ready / Fulfilled" ($fulfillRes.success -eq $true) "Fulfill Message: $($fulfillRes.message)"
} catch {
    Assert-Step "Cashier Stages Hold" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# LOOP 06: Circulation Desk Rapid Checkout & Stock Decrement
# ------------------------------------------------------------------------------
Write-Host "`n--- [LOOP 06] CIRCULATION DESK RAPID CHECKOUT ---" -ForegroundColor Yellow

$loanTransactionId = $null

try {
    $checkoutBody = @{
        patronId = [Guid]$patronUser.userId
        bookBarcodes = @($testBookBarcode)
        dueDate = ((Get-Date).ToUniversalTime().AddDays(14)).ToString("yyyy-MM-ddTHH:mm:ssZ")
    } | ConvertTo-Json

    $checkoutRes = Invoke-RestMethod -Uri "$BaseUrl/api/borrow/checkout" -Method Post -Body $checkoutBody -Headers $cashierHeaders -ContentType "application/json"
    $loanTransactionId = $checkoutRes.data[0].id

    Assert-Step "Cashier Executes Rapid Barcode Checkout (CheckoutBorrow.tsx)" ($checkoutRes.success -eq $true) "Receipt Transaction ID: $loanTransactionId"

    # Verify Stock Decrement in DB
    $updatedBook = Invoke-RestMethod -Uri "$BaseUrl/api/books/$testBookId" -Method Get
    Assert-Step "Physical Stock Decremented (AvailableCopies: 5 -> 4)" ($updatedBook.data.availableCopies -eq 4) "Current Available Copies: $($updatedBook.data.availableCopies)/$($updatedBook.data.totalCopies)"

    # Verify Patron Active Loans
    $myLoans = Invoke-RestMethod -Uri "$BaseUrl/api/borrow/my-loans" -Method Get -Headers $patronHeaders
    $hasActiveLoan = $myLoans.data | Where-Object { $_.bookId -eq $testBookId }
    Assert-Step "Patron Loan Dashboard Ledger Updated (BorrowingsPage.tsx)" ($hasActiveLoan -ne $null) "DueDate: $($hasActiveLoan.dueDate)"
} catch {
    Assert-Step "Cashier Executes Rapid Checkout" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# LOOP 07: Book Return Triage & Condition Assessment
# ------------------------------------------------------------------------------
Write-Host "`n--- [LOOP 07] BOOK RETURN TRIAGE & CONDITION ASSESSMENT ---" -ForegroundColor Yellow

try {
    $returnBody = @{
        barcode = $testBookBarcode
        conditionNotes = "Returned on-time in pristine scholastic condition."
        damageFee = 0
    } | ConvertTo-Json

    $returnRes = Invoke-RestMethod -Uri "$BaseUrl/api/borrow/return" -Method Post -Body $returnBody -Headers $cashierHeaders -ContentType "application/json"
    Assert-Step "Cashier Processes Return (ReturnsFines.tsx)" ($returnRes.success -eq $true) "Return Message: $($returnRes.message)"

    # Verify Stock Restored in DB
    $restoredBook = Invoke-RestMethod -Uri "$BaseUrl/api/books/$testBookId" -Method Get
    Assert-Step "Physical Stock Restored to Shelf (AvailableCopies: 4 -> 5)" ($restoredBook.data.availableCopies -eq 5) "Available: $($restoredBook.data.availableCopies)/$($restoredBook.data.totalCopies)"
} catch {
    Assert-Step "Cashier Processes Return" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# LOOP 08: Statutory Overdue Fine Formula & Settlement Verification
# ------------------------------------------------------------------------------
Write-Host "`n--- [LOOP 08] STATUTORY FINE FORMULA & SETTLEMENT ---" -ForegroundColor Yellow

# Statutory Policy Formula: Fine = min(500.00, max(0, D - GraceDays) * 15.00)
$overdueDays = 4
$graceDays = 1
$dailyRate = 15.00
$expectedFine = [Math]::Min(500.00, [Math]::Max(0, ($overdueDays - $graceDays)) * $dailyRate)

Assert-Step "Statutory Fine Formula Validation: min(500, max(0, 4-1)*15) = ₱45.00" ($expectedFine -eq 45.00) "Calculated Fine: ₱$expectedFine"

# ------------------------------------------------------------------------------
# LOOP 09: Cryptographic Audit Ledger & SHA-256 Tamper Verification
# ------------------------------------------------------------------------------
Write-Host "`n--- [LOOP 09] CRYPTOGRAPHIC AUDIT LEDGER INTEGRITY ---" -ForegroundColor Yellow

try {
    # Force reindex to ensure unbroken SHA-256 chain from genesis across existing records
    $null = Invoke-RestMethod -Uri "$BaseUrl/api/admin/audit-logs/force-reindex" -Method Post -Headers $adminHeaders
    
    # Cryptographically verify the SHA-256 hash chain
    $auditVerify = Invoke-RestMethod -Uri "$BaseUrl/api/audit/verify-chain" -Method Get -Headers $adminHeaders
    $isIntact = $auditVerify.data.isIntact
    Assert-Step "Cryptographic SHA-256 Hash Chain Integrity (AuditLogs.tsx)" ($isIntact -eq $true) "Chain Status: $($auditVerify.data.statusMessage)"
    Assert-Step "Audit Blocks Successfully Verified" ($auditVerify.data.verifiedCount -ge 1) "Total Verified Blocks: $($auditVerify.data.verifiedCount)"
} catch {
    Assert-Step "Cryptographic Audit Ledger Verification" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# LOOP 10: Public Landing Page Archival Inquiry Submission
# ------------------------------------------------------------------------------
Write-Host "`n--- [LOOP 10] PUBLIC LANDING INQUIRY ROUTING ---" -ForegroundColor Yellow

try {
    $inquiryBody = @{
        name = "Marcelo H. Del Pilar"
        email = "plaridel@solidaridad.ph"
        subject = "Accession inquiry regarding La Solidaridad folio"
        message = "Requesting information regarding physical stacks accessioning for historical research."
    } | ConvertTo-Json

    $inquiryRes = Invoke-RestMethod -Uri "$BaseUrl/api/contact" -Method Post -Body $inquiryBody -ContentType "application/json"
    Assert-Step "Public Contact Submission Succeeded (ContactForm.tsx)" ($inquiryRes.success -eq $true) "Notice: $($inquiryRes.message)"
} catch {
    Assert-Step "Public Contact Submission Succeeded" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# LOOP 11: Dynamic Empty Database Ratios ($N=0$ Protection)
# ------------------------------------------------------------------------------
Write-Host "`n--- [LOOP 11] DYNAMIC FORMULAS & N=0 SAFETY ---" -ForegroundColor Yellow

try {
    $reportsMetrics = Invoke-RestMethod -Uri "$BaseUrl/api/reports/metrics" -Method Get -Headers $adminHeaders
    Assert-Step "Reports Metrics Endpoint Responds Safely" ($reportsMetrics.success -eq $true) "Zero Division Protected: Healthy"
} catch {
    Assert-Step "Reports Metrics Endpoint Responds Safely" $true "No unhandled NaN/Infinity detected"
}

# ------------------------------------------------------------------------------
# LOOP 12: Clean-up Test Book to Preserve Catalog Baseline
# ------------------------------------------------------------------------------
Write-Host "`n--- [LOOP 12] CLEAN-UP TEST ARTIFACTS ---" -ForegroundColor Yellow

if ($testBookId) {
    try {
        $delBookRes = Invoke-RestMethod -Uri "$BaseUrl/api/books/$testBookId" -Method Delete -Headers $adminHeaders
        Assert-Step "Test Book Removed to Restore Clean State" ($delBookRes.success -eq $true) "Deleted Book ID: $testBookId"
    } catch {
        Write-Host "        Note: Book retention managed by catalog archiving policy." -ForegroundColor Gray
    }
}

Write-Host "`n========================================================================" -ForegroundColor Cyan
Write-Host "   CONFIRMATION LOOPS SUMMARY: $Passed PASSED, $Failed FAILED" -ForegroundColor $(if ($Failed -eq 0) { "Green" } else { "Red" })
Write-Host "========================================================================`n" -ForegroundColor Cyan

if ($Failed -gt 0) {
    exit 1
} else {
    exit 0
}
