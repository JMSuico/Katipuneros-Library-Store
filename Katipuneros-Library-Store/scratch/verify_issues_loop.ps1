Write-Output "========================================================================"
Write-Output " KATIPUNEROS LIBRARY STORE -- COMPREHENSIVE E2E VERIFICATION LOOPS RUNNER"
Write-Output "========================================================================"

$baseUrl = "http://localhost:5000/api"
$passes = 0
$fails = 0

function Assert-Step($title, $condition, $detail = "") {
    if ($condition) {
        Write-Output " [PASS] $title"
        if ($detail) { Write-Output "        $detail" }
        $global:passes++
    } else {
        Write-Output " [FAIL] $title"
        if ($detail) { Write-Output "        ERROR: $detail" }
        $global:fails++
    }
}

# --- 1. AUTHENTICATION OF ALL THREE ROLES ---
Write-Output "`n--- [LOOP 1] MULTI-ROLE AUTHENTICATION ---"
$adminToken = ""
$cashierToken = ""
$patronToken = ""
$patronId = ""

try {
    $a = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"testadmin","password":"Password123!"}'
    $adminToken = $a.data.token
    Assert-Step "Admin Authentication (Port 5174)" ($a.success -and $a.data.role -eq "Admin") "Admin: $($a.data.fullName)"
} catch {
    Assert-Step "Admin Authentication (Port 5174)" $false $_.Exception.Message
}

try {
    $c = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"testcashier","password":"Password123!"}'
    $cashierToken = $c.data.token
    Assert-Step "Cashier Authentication (Port 5173 Desk)" ($c.success -and $c.data.role -eq "Cashier") "Cashier: $($c.data.fullName)"
} catch {
    Assert-Step "Cashier Authentication (Port 5173 Desk)" $false $_.Exception.Message
}

try {
    $p = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"mariaclara_live","password":"Password123!"}'
    $patronToken = $p.data.token
    $patronId = $p.data.userId
    Assert-Step "Patron Authentication (Port 5173 Customer)" ($p.success -and $p.data.role -eq "Customer") "Patron: $($p.data.fullName) (Card: $($p.data.libraryCardNumber))"
} catch {
    Assert-Step "Patron Authentication (Port 5173 Customer)" $false $_.Exception.Message
}

# --- 2. ADMIN ACCESSIONS BOOK INTO CATALOG ---
Write-Output "`n--- [LOOP 2] ADMIN BOOK ACCESSION & CATALOG PROPAGATION ---"
$testIsbn = "978-971-8888-" + (Get-Random -Minimum 1000 -Maximum 9999).ToString()
$newBookId = ""
$newBookBarcode = ""

try {
    $adminHeaders = @{ Authorization = "Bearer $adminToken" }
    $bookPayload = @{
        title = "Distributed Systems & Cloud Architecture 2026"
        author = "Prof. Antonio Luna"
        isbn = $testIsbn
        deweyCode = "004.36"
        publishedYear = 2026
        totalCopies = 4
        bayLocation = "Bay D-04"
        description = "Advanced distributed computing, microservices, and consensus algorithms."
    } | ConvertTo-Json
    
    $createdBookRes = Invoke-RestMethod -Uri "$baseUrl/books" -Method Post -Headers $adminHeaders -ContentType "application/json" -Body $bookPayload
    $newBookId = $createdBookRes.data.id
    $newBookBarcode = $createdBookRes.data.isbnBarcode
    Assert-Step "Admin Accessions New Book Asset" ($createdBookRes.success -and $newBookId) "Book: '$($createdBookRes.data.title)', ID: $newBookId, Barcode: $newBookBarcode"
} catch {
    Assert-Step "Admin Accessions New Book Asset" $false $_.Exception.Message
}

# Verify book shows in customer catalog
try {
    $catBooks = Invoke-RestMethod -Uri "$baseUrl/books" -Method Get
    $foundInCatalog = $catBooks.data | Where-Object { $_.id -eq $newBookId }
    Assert-Step "New Book Appears in Customer Catalog" ($foundInCatalog -ne $null -and $foundInCatalog.availableCopies -eq 4) "Title: $($foundInCatalog.title), Stock: $($foundInCatalog.availableCopies)/$($foundInCatalog.totalCopies)"
} catch {
    Assert-Step "New Book Appears in Customer Catalog" $false $_.Exception.Message
}

# --- 3. CUSTOMER RESERVES THE NEWLY ADDED BOOK ---
Write-Output "`n--- [LOOP 3] CUSTOMER RESERVATION (ISSUE 1 VALIDATION) ---"
$holdId = ""
try {
    $patronHeaders = @{ Authorization = "Bearer $patronToken" }
    $reservePayload = @{
        bookId = $newBookId
        pickupBranch = "Main Circulation Desk"
    } | ConvertTo-Json

    $resHold = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $patronHeaders -ContentType "application/json" -Body $reservePayload
    $holdId = $resHold.data.id
    Assert-Step "Customer Successfully Reserves Newly Added Book" ($resHold.success -and $holdId) "Hold ID: $holdId, Status: $($resHold.data.status), QueuePos: $($resHold.data.queuePosition)"
} catch {
    Assert-Step "Customer Successfully Reserves Newly Added Book" $false $_.Exception.Message
}

# Verify duplicate hold prevention
try {
    $dupRes = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $patronHeaders -ContentType "application/json" -Body $reservePayload
    Assert-Step "Duplicate Hold Correctly Blocked" $false "Should have failed with 400"
} catch {
    Assert-Step "Duplicate Hold Correctly Blocked" $true "Server rejected duplicate hold as expected."
}

# --- 4. APPROVE AND DECLINE TRIAGE (ISSUE 2 VALIDATION) ---
Write-Output "`n--- [LOOP 4] RESERVATION APPROVAL & DECLINE TRIAGE (ISSUE 2 VALIDATION) ---"
$cashierHeaders = @{ Authorization = "Bearer $cashierToken" }

# Test 4A: Approve Hold
try {
    $approvePayload = @{
        approved = $true
        priority = $false
        reason = "Shelf stock confirmed by cashier."
    } | ConvertTo-Json

    $appRes = Invoke-RestMethod -Uri "$baseUrl/reservations/$holdId/triage" -Method Put -Headers $cashierHeaders -ContentType "application/json" -Body $approvePayload
    Assert-Step "Cashier Triage: Approve Hold API Call" ($appRes.success) $appRes.message

    # Verify hold is now StagedInLocker with LockerPin and Bay
    $myHolds = Invoke-RestMethod -Uri "$baseUrl/reservations/my-holds" -Method Get -Headers $patronHeaders
    $stagedHold = $myHolds.data | Where-Object { $_.id -eq $holdId }
    $isStaged = ($stagedHold.status -eq "StagedInLocker" -or $stagedHold.status -eq 2)
    Assert-Step "Approved Hold Transitions to 'StagedInLocker'" $isStaged "Status: $($stagedHold.status), Bay: $($stagedHold.lockerBay), PIN: $($stagedHold.lockerPin)"
} catch {
    Assert-Step "Cashier Triage: Approve Hold API Call" $false $_.Exception.Message
}

# Test 4B: Create second book hold and Decline it
try {
    $declineBookPayload = @{
        title = "Temporary Volume for Decline Test"
        author = "Test Author"
        isbn = "978-971-9999-" + (Get-Random -Minimum 1000 -Maximum 9999).ToString()
        deweyCode = "000.01"
        publishedYear = 2026
        totalCopies = 2
        bayLocation = "Bay T-01"
    } | ConvertTo-Json
    $tempBook = Invoke-RestMethod -Uri "$baseUrl/books" -Method Post -Headers $adminHeaders -ContentType "application/json" -Body $declineBookPayload
    $tempBookId = $tempBook.data.id

    # Patron places hold
    $tempHold = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $patronHeaders -ContentType "application/json" -Body (@{ bookId = $tempBookId } | ConvertTo-Json)
    $tempHoldId = $tempHold.data.id

    # Cashier declines hold
    $declinePayload = @{
        approved = $false
        reason = "Damaged copy unreadable"
    } | ConvertTo-Json
    $decRes = Invoke-RestMethod -Uri "$baseUrl/reservations/$tempHoldId/triage" -Method Put -Headers $cashierHeaders -ContentType "application/json" -Body $declinePayload
    Assert-Step "Cashier Triage: Decline Hold API Call" ($decRes.success) $decRes.message

    # Verify declined hold is no longer in pending queue
    $pendingQ = Invoke-RestMethod -Uri "$baseUrl/reservations/pending" -Method Get -Headers $cashierHeaders
    $stillPending = $pendingQ.data | Where-Object { $_.id -eq $tempHoldId }
    Assert-Step "Declined Hold Evicted from Active Pending Queue" ($stillPending -eq $null) "Verified hold is Cancelled and purged from pending queue."
} catch {
    Assert-Step "Cashier Triage: Decline Hold" $false $_.Exception.Message
}

# --- 5. BOOK RETURNING WORKFLOW (ISSUE 3 VALIDATION) ---
Write-Output "`n--- [LOOP 5] CIRCULATION CHECKOUT & BOOK RETURN (ISSUE 3 VALIDATION) ---"
try {
    # 5A: Checkout book
    $checkoutPayload = @{
        patronId = $patronId
        bookBarcodes = @($newBookBarcode)
    } | ConvertTo-Json

    $checkoutRes = Invoke-RestMethod -Uri "$baseUrl/borrow/checkout" -Method Post -Headers $cashierHeaders -ContentType "application/json" -Body $checkoutPayload
    $loan = $checkoutRes.data[0]
    $loanId = $loan.id
    $gatePass = $loan.gatePassCode
    Assert-Step "Cashier Issues Physical Checkout" ($checkoutRes.success -and $loanId) "Loan ID: $loanId, GatePass: $gatePass, Status: $($loan.status)"

    # Verify book availableCopies decremented
    $bookAfterCheckout = Invoke-RestMethod -Uri "$baseUrl/books/$newBookId" -Method Get
    Assert-Step "Available Copies Decremented on Checkout" ($bookAfterCheckout.data.availableCopies -eq 3) "Available copies: $($bookAfterCheckout.data.availableCopies)/$($bookAfterCheckout.data.totalCopies)"

    # 5B: Process Book Return
    $returnPayload = @{
        barcode = $newBookBarcode
        conditionNotes = "Desk return inspected -- pristine condition."
        damageFee = 0
    } | ConvertTo-Json

    $returnRes = Invoke-RestMethod -Uri "$baseUrl/borrow/return" -Method Post -Headers $cashierHeaders -ContentType "application/json" -Body $returnPayload
    Assert-Step "Cashier Processes Book Return" ($returnRes.success) "Status: $($returnRes.data.clearanceStatus), Assessed Fine: ₱$($returnRes.data.assessedFine)"

    # Verify book availableCopies incremented back
    $bookAfterReturn = Invoke-RestMethod -Uri "$baseUrl/books/$newBookId" -Method Get
    Assert-Step "Available Copies Incremented Back to Stacks on Return" ($bookAfterReturn.data.availableCopies -eq 4) "Available copies: $($bookAfterReturn.data.availableCopies)/$($bookAfterReturn.data.totalCopies)"
} catch {
    Assert-Step "Circulation Checkout & Return" $false $_.Exception.Message
}

# --- 6. SERVER & CLIENT BUILD STATUS ---
Write-Output "`n--- [LOOP 6] LIVE PORTS & ENVIRONMENT STATUS ---"
$p5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
$p5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
$p5174 = Get-NetTCPConnection -LocalPort 5174 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }

Assert-Step "Port 5000 (Backend API) Listening" ($p5000 -ne $null) "PID: $($p5000[0].OwningProcess)"
Assert-Step "Port 5173 (Patron/Cashier Portal) Listening" ($p5173 -ne $null) "PID: $($p5173[0].OwningProcess)"
Assert-Step "Port 5174 (Chief Admin Terminal) Listening" ($p5174 -ne $null) "PID: $($p5174[0].OwningProcess)"

Write-Output "`n========================================================================"
Write-Output " VERIFICATION SUMMARY: $global:passes PASSED, $global:fails FAILED"
Write-Output "========================================================================"
