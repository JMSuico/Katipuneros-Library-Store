# ==============================================================================
# KATIPUNEROS LIBRARY STORE - CHALLENGED SECURITY & EDGE-CASE VERIFICATION
# Focused Adversarial Suite:
# 1. Physical Book Copy QR Resolution & Accession Lookup (Edge Cases & Security)
# 2. Once-Only Triage Guard & Concurrency Stress Test
# 3. Condition Assessment & Fine Computation Integrity
# ==============================================================================

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:5000/api"

$global:passCount = 0
$global:failCount = 0

function Assert-Check {
    param(
        [string]$TestName,
        [bool]$Condition,
        [string]$Details = ""
    )
    if ($Condition) {
        $global:passCount++
        Write-Host "  [PASS] $TestName" -ForegroundColor Green
        if ($Details) { Write-Host "         $Details" -ForegroundColor DarkGray }
    } else {
        $global:failCount++
        Write-Host "  [FAIL] $TestName" -ForegroundColor Red
        if ($Details) { Write-Host "         $Details" -ForegroundColor Red }
    }
}

function New-TestPatron {
    param([string]$Prefix = "patron")
    $id = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds().ToString() + (Get-Random -Minimum 100 -Maximum 999).ToString()
    $regBody = @{
        firstName = "Patron"
        lastName = "Tester"
        username = "${Prefix}_$id"
        email = "${Prefix}_$id@test.edu.ph"
        password = "Password123!"
        employmentStatus = "Student"
        currentAddress = "Katipunan Avenue"
        permanentAddress = "Quezon City"
        department = "Circulation Studies"
        phoneNumber = "+639123456789"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body $regBody
    return @{
        Id = [Guid]$res.data.userId
        Token = $res.data.token
        FullName = $res.data.fullName
        Headers = @{ "Authorization" = "Bearer $($res.data.token)"; "Content-Type" = "application/json" }
    }
}

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "KATIPUNEROS LIBRARY STORE - ADVERSARIAL AND EDGE-CASE VERIFICATION" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# STEP 0: AUTHENTICATION SETUP
# ------------------------------------------------------------------------------
Write-Host "`n[AUTH] Initializing Test Security Credentials..." -ForegroundColor Yellow

# Admin Login
$adminRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"testadmin","password":"Password123!"}'
$adminToken = $adminRes.data.token
$adminHeaders = @{ "Authorization" = "Bearer $adminToken"; "Content-Type" = "application/json" }
Assert-Check "Admin Authentication" ($adminRes.success -and $adminToken) "Admin: $($adminRes.data.fullName)"

# Cashier Login
$cashierRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"testcashier","password":"Password123!"}'
$cashierToken = $cashierRes.data.token
$cashierHeaders = @{ "Authorization" = "Bearer $cashierToken"; "Content-Type" = "application/json" }
Assert-Check "Cashier Authentication" ($cashierRes.success -and $cashierToken) "Cashier: $($cashierRes.data.fullName)"

# Ensure at least one book exists
$booksRes = Invoke-RestMethod -Uri "$baseUrl/books" -Method Get
$testBook = $booksRes.data | Where-Object { $_.availableCopies -gt 0 } | Select-Object -First 1
if (-not $testBook) { $testBook = $booksRes.data[0] }
$bookId = $testBook.id

# Create dedicated physical copy for deterministic tests
$createdCopyRes = Invoke-RestMethod -Uri "$baseUrl/books/$bookId/copies" -Method Post -Headers $adminHeaders -Body (@{
    bayLocation = "Bay Sec-QA"
    condition = "Pristine"
    conditionNotes = "Adversarial verification fixture"
} | ConvertTo-Json)
$targetCopy = $createdCopyRes.data
$realAccession = $targetCopy.accessionNumber
$realQrPayload = $targetCopy.qrCodeData

Write-Host "  [FIXTURE] Target Book: $($testBook.title)" -ForegroundColor DarkGray
Write-Host "  [FIXTURE] Target Copy Accession: $realAccession" -ForegroundColor DarkGray
Write-Host "  [FIXTURE] Target Copy QR: $realQrPayload" -ForegroundColor DarkGray

# ------------------------------------------------------------------------------
# SUITE 1: PHYSICAL BOOK COPY QR RESOLUTION & ACCESSION LOOKUP
# ------------------------------------------------------------------------------
Write-Host "`n====================================================================" -ForegroundColor Yellow
Write-Host "SUITE 1: PHYSICAL BOOK COPY QR RESOLUTION AND ACCESSION LOOKUP" -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Yellow

function Invoke-ScanEndpoint {
    param([string]$QueryString)
    $url = "$baseUrl/copies/scan$QueryString"
    try {
        $res = Invoke-RestMethod -Uri $url -Method Get -Headers $cashierHeaders
        return @{ StatusCode = 200; Data = $res.data; Success = $res.success; Body = ($res | ConvertTo-Json -Compress) }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        return @{ StatusCode = $statusCode; Data = $null; Success = $false; Body = $body }
    }
}

# 1.1 Missing query parameter
$resMissing = Invoke-ScanEndpoint ""
Assert-Check "1.1 Missing 'code' parameter returns HTTP 400" ($resMissing.StatusCode -eq 400) "HTTP $($resMissing.StatusCode): $($resMissing.Body)"

# 1.2 Empty code parameter
$resEmpty = Invoke-ScanEndpoint "?code="
Assert-Check "1.2 Empty 'code' parameter returns HTTP 400" ($resEmpty.StatusCode -eq 400) "HTTP $($resEmpty.StatusCode): $($resEmpty.Body)"

# 1.3 Whitespace-only code parameter
$resWhitespace = Invoke-ScanEndpoint "?code=%20%20%20"
Assert-Check "1.3 Whitespace-only 'code' parameter returns HTTP 400" ($resWhitespace.StatusCode -eq 400) "HTTP $($resWhitespace.StatusCode): $($resWhitespace.Body)"

# 1.4 Malformed QR format (colon delimiters without valid components)
$resMalformed = Invoke-ScanEndpoint "?code=KP:INVALID:FORMAT:::XYZ:999"
Assert-Check "1.4 Malformed QR format returns HTTP 404 (No 500 error)" ($resMalformed.StatusCode -eq 404) "HTTP $($resMalformed.StatusCode): $($resMalformed.Body)"

# 1.5 Non-existent accession code
$resNonExistent = Invoke-ScanEndpoint "?code=ACC-DOES-NOT-EXIST-99999"
Assert-Check "1.5 Non-existent Accession Number returns HTTP 404 (No 500 error)" ($resNonExistent.StatusCode -eq 404) "HTTP $($resNonExistent.StatusCode): $($resNonExistent.Body)"

# 1.6 URL-encoded XSS injection payload
$xssPayload = [System.Uri]::EscapeDataString("<script>alert('xss')</script>")
$resXss = Invoke-ScanEndpoint "?code=$xssPayload"
Assert-Check "1.6 XSS injection payload returns HTTP 404 safely (No 500 error)" ($resXss.StatusCode -eq 404) "HTTP $($resXss.StatusCode)"

# 1.7 URL-encoded SQL injection payload
$sqliPayload = [System.Uri]::EscapeDataString("' OR 1=1; DROP TABLE BookCopies; --")
$resSqli = Invoke-ScanEndpoint "?code=$sqliPayload"
Assert-Check "1.7 SQLi payload handled safely by parameterized query -> HTTP 404" ($resSqli.StatusCode -eq 404) "HTTP $($resSqli.StatusCode)"

# 1.8 Special characters and punctuation
$specialPayload = [System.Uri]::EscapeDataString("~!@#$%^&*()_+{}|:<>?=[]\;',./")
$resSpecial = Invoke-ScanEndpoint "?code=$specialPayload"
Assert-Check "1.8 Special characters string handled gracefully -> HTTP 404" ($resSpecial.StatusCode -eq 404) "HTTP $($resSpecial.StatusCode)"

# 1.9 Extremely long string buffer (500 chars)
$longPayload = [System.Uri]::EscapeDataString("A" * 500)
$resLong = Invoke-ScanEndpoint "?code=$longPayload"
Assert-Check "1.9 Large buffer 500 chars handled safely -> HTTP 404" ($resLong.StatusCode -eq 404) "HTTP $($resLong.StatusCode)"

# 1.10 Case Insensitivity - Lowercase Accession
$lowerAccession = [System.Uri]::EscapeDataString($realAccession.ToLowerInvariant())
$resLower = Invoke-ScanEndpoint "?code=$lowerAccession"
Assert-Check "1.10 Accession number lookup is case-insensitive (lowercase)" ($resLower.StatusCode -eq 200 -and $resLower.Data.copy.accessionNumber -eq $realAccession) "Matched: $($resLower.Data.copy.accessionNumber)"

# 1.11 Case Insensitivity - Mixed case Accession
$mixedChars = $realAccession.ToCharArray()
for ($i = 0; $i -lt $mixedChars.Length; $i += 2) {
    $mixedChars[$i] = [char]::ToLowerInvariant($mixedChars[$i])
}
$mixedAccession = [System.Uri]::EscapeDataString((New-Object string (,$mixedChars)))
$resMixed = Invoke-ScanEndpoint "?code=$mixedAccession"
Assert-Check "1.11 Accession number lookup is case-insensitive (mixed case)" ($resMixed.StatusCode -eq 200 -and $resMixed.Data.copy.accessionNumber -eq $realAccession) "Matched: $($resMixed.Data.copy.accessionNumber)"

# 1.12 Valid Full QR Code Data Lookup
$encodedQr = [System.Uri]::EscapeDataString($realQrPayload)
$resQr = Invoke-ScanEndpoint "?code=$encodedQr"
Assert-Check "1.12 Full QR code payload resolved successfully" ($resQr.StatusCode -eq 200 -and $resQr.Data.copy.id -eq $targetCopy.id) "Resolved Copy ID: $($resQr.Data.copy.id)"


# ------------------------------------------------------------------------------
# SUITE 2: ONCE-ONLY TRIAGE GUARD & CONCURRENCY STRESS
# ------------------------------------------------------------------------------
Write-Host "`n====================================================================" -ForegroundColor Yellow
Write-Host "SUITE 2: ONCE-ONLY TRIAGE GUARD AND CONCURRENCY STRESS" -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Yellow

function Invoke-TriageEndpoint {
    param(
        [Guid]$HoldId,
        [bool]$Approved,
        [string]$Reason = $null,
        [bool]$Priority = $false
    )
    $url = "$baseUrl/reservations/$HoldId/triage"
    $body = @{
        approved = $Approved
        reason = $Reason
        priority = $Priority
    } | ConvertTo-Json
    try {
        $res = Invoke-RestMethod -Uri $url -Method Put -Headers $cashierHeaders -Body $body
        return @{ StatusCode = 200; Success = $res.success; Message = $res.message }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $bodyText = $reader.ReadToEnd()
        $msg = try { ($bodyText | ConvertFrom-Json).message } catch { $bodyText }
        return @{ StatusCode = $statusCode; Success = $false; Message = $msg }
    }
}

# --- Part A: Approved Hold Guard ---
$patron1 = New-TestPatron "h1"
$hold1Res = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $patron1.Headers -Body (@{ bookId = $bookId; pickupBranch = "Main Circulation" } | ConvertTo-Json)
$hold1Id = [Guid]$hold1Res.data.id
Assert-Check "2.1 Hold 1 Created (Status: Pending)" ($hold1Res.success -and $hold1Res.data.status -eq "Pending") "Hold ID: $hold1Id"

# 2.2 First Triage -> Approve
$triage1Approve = Invoke-TriageEndpoint -HoldId $hold1Id -Approved $true -Priority $false
Assert-Check "2.2 Initial Triage: Approve Hold 1 -> HTTP 200" ($triage1Approve.StatusCode -eq 200 -and $triage1Approve.Success) "Msg: $($triage1Approve.Message)"

# 2.3 Attempt to Change Approved Hold to Declined
$triage1Decline = Invoke-TriageEndpoint -HoldId $hold1Id -Approved $false -Reason "Adversarial switch to decline"
Assert-Check "2.3 Once-Only Guard: Changing Approved to Declined is strictly blocked -> HTTP 400" `
    ($triage1Decline.StatusCode -eq 400 -and $triage1Decline.Message -like "*already been processed*") `
    "Blocked with message: $($triage1Decline.Message)"

# 2.4 Attempt to Re-Approve an already Approved Hold
$triage1ReApprove = Invoke-TriageEndpoint -HoldId $hold1Id -Approved $true -Priority $true
Assert-Check "2.4 Once-Only Guard: Re-approving already Approved hold is strictly blocked -> HTTP 400" `
    ($triage1ReApprove.StatusCode -eq 400 -and $triage1ReApprove.Message -like "*already been processed*") `
    "Blocked with message: $($triage1ReApprove.Message)"


# --- Part B: Declined Hold Guard ---
$patron2 = New-TestPatron "h2"
$hold2Res = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $patron2.Headers -Body (@{ bookId = $bookId; pickupBranch = "Main Circulation" } | ConvertTo-Json)
$hold2Id = [Guid]$hold2Res.data.id
Assert-Check "2.5 Hold 2 Created (Status: Pending)" ($hold2Res.success -and $hold2Res.data.status -eq "Pending") "Hold ID: $hold2Id"

# 2.6 First Triage -> Decline
$triage2Decline = Invoke-TriageEndpoint -HoldId $hold2Id -Approved $false -Reason "Physical copy damaged during pull"
Assert-Check "2.6 Initial Triage: Decline Hold 2 -> HTTP 200" ($triage2Decline.StatusCode -eq 200 -and $triage2Decline.Success) "Msg: $($triage2Decline.Message)"

# 2.7 Attempt to Change Declined Hold to Approved
$triage2Approve = Invoke-TriageEndpoint -HoldId $hold2Id -Approved $true -Priority $false
Assert-Check "2.7 Once-Only Guard: Changing Declined to Approved is strictly blocked -> HTTP 400" `
    ($triage2Approve.StatusCode -eq 400 -and $triage2Approve.Message -like "*already been processed*") `
    "Blocked with message: $($triage2Approve.Message)"

# 2.8 Attempt to Re-Decline an already Declined Hold
$triage2ReDecline = Invoke-TriageEndpoint -HoldId $hold2Id -Approved $false -Reason "Second decline attempt"
Assert-Check "2.8 Once-Only Guard: Re-declining already Declined hold is strictly blocked -> HTTP 400" `
    ($triage2ReDecline.StatusCode -eq 400 -and $triage2ReDecline.Message -like "*already been processed*") `
    "Blocked with message: $($triage2ReDecline.Message)"


# --- Part C: Concurrency Stress Test on Single Hold ---
Write-Host "`n  [CONCURRENCY STRESS] Dispatching 10 concurrent triage requests against single pending hold..." -ForegroundColor Cyan

$patron3 = New-TestPatron "h3"
$hold3Res = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $patron3.Headers -Body (@{ bookId = $bookId; pickupBranch = "Express Locker" } | ConvertTo-Json)
$hold3Id = [Guid]$hold3Res.data.id
Assert-Check "2.9 Hold 3 Created for Concurrency Race" ($hold3Res.success) "Hold ID: $hold3Id"

Add-Type -AssemblyName System.Net.Http
$httpClientHandler = New-Object System.Net.Http.HttpClientHandler
$httpClient = New-Object System.Net.Http.HttpClient($httpClientHandler)
$httpClient.DefaultRequestHeaders.Authorization = New-Object System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", $cashierToken)

$tasks = [System.Collections.Generic.List[System.Threading.Tasks.Task[System.Net.Http.HttpResponseMessage]]]::new()
$concurrentUrl = "$baseUrl/reservations/$hold3Id/triage"

# 5 Approve requests and 5 Decline requests launched at the exact same moment
for ($i = 1; $i -le 10; $i++) {
    $shouldApprove = ($i % 2 -eq 1)
    $payloadJson = @{ approved = $shouldApprove; reason = "Concurrent race iteration $i" } | ConvertTo-Json
    $content = New-Object System.Net.Http.StringContent($payloadJson, [System.Text.Encoding]::UTF8, "application/json")
    $tasks.Add($httpClient.PutAsync($concurrentUrl, $content))
}

[System.Threading.Tasks.Task]::WaitAll($tasks.ToArray())

$status200Count = 0
$status400Count = 0
$otherStatusCount = 0

foreach ($t in $tasks) {
    $resp = $t.Result
    $code = [int]$resp.StatusCode
    if ($code -eq 200) {
        $status200Count++
    } elseif ($code -eq 400) {
        $status400Count++
    } else {
        $otherStatusCount++
    }
}
$httpClient.Dispose()

Write-Host "         Concurrency Results: 200 OK = $status200Count, 400 Bad Request = $status400Count, Other = $otherStatusCount" -ForegroundColor DarkGray
Assert-Check "2.10 Concurrency Guard: Exactly ONE request succeeded (200 OK) and 9 failed (400 Bad Request)" `
    ($status200Count -eq 1 -and $status400Count -eq 9 -and $otherStatusCount -eq 0) `
    "Strict 1-winner atomicity verified under race conditions."


# ------------------------------------------------------------------------------
# SUITE 3: CONDITION ASSESSMENT & FINE COMPUTATION INTEGRITY
# ------------------------------------------------------------------------------
Write-Host "`n====================================================================" -ForegroundColor Yellow
Write-Host "SUITE 3: CONDITION ASSESSMENT AND FINE COMPUTATION INTEGRITY" -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Yellow

$borrowPatron = New-TestPatron "borrow"
$patronId = $borrowPatron.Id

# Fetch fresh book state
$bookBeforeAudit = (Invoke-RestMethod -Uri "$baseUrl/books" -Method Get).data | Where-Object { $_.id -eq $bookId }
$initialAvail = $bookBeforeAudit.availableCopies
Write-Host "  [BASELINE] Book '$($bookBeforeAudit.title)' Available Copies: $initialAvail" -ForegroundColor DarkGray

# --- Part 3A: Return with condition 'Damaged' ---
Write-Host "`n  [TEST 3A] Testing Return with Condition Damaged..." -ForegroundColor Cyan

# 3.1 Create fresh physical copy for Damaged workflow
$damagedCopyRes = Invoke-RestMethod -Uri "$baseUrl/books/$bookId/copies" -Method Post -Headers $adminHeaders -Body (@{
    bayLocation = "Bay Damaged-Test"
    condition = "Good"
} | ConvertTo-Json)
$damagedCopy = $damagedCopyRes.data
$damagedCopyId = [Guid]$damagedCopy.id
$damagedAcc = $damagedCopy.accessionNumber
Assert-Check "3.1 Dedicated Physical Copy Created for Damaged Return" ($damagedCopyRes.success) "Accession: $damagedAcc"

# Check available copies right after adding copy
$bookAfterAdd = (Invoke-RestMethod -Uri "$baseUrl/books" -Method Get).data | Where-Object { $_.id -eq $bookId }
$availBeforeCheckout = $bookAfterAdd.availableCopies
Write-Host "         Available Copies before Checkout: $availBeforeCheckout" -ForegroundColor DarkGray

# 3.2 Check out copy to patron
$checkoutDamagedRes = Invoke-RestMethod -Uri "$baseUrl/borrow/checkout" -Method Post -Headers $cashierHeaders -Body (@{
    patronId = $patronId
    bookBarcodes = @( $damagedAcc )
} | ConvertTo-Json)
Assert-Check "3.2 Checkout Volume to Patron Succeeded" ($checkoutDamagedRes.success) "Loan Created"

# Check available copies right after checkout (must be decremented by 1)
$bookAfterCheckout = (Invoke-RestMethod -Uri "$baseUrl/books" -Method Get).data | Where-Object { $_.id -eq $bookId }
$availAfterCheckout = $bookAfterCheckout.availableCopies
Assert-Check "3.3 Checkout decremented AvailableCopies by 1" ($availAfterCheckout -eq ($availBeforeCheckout - 1)) "Was $availBeforeCheckout, now $availAfterCheckout"

# 3.4 Cashier Returns Volume with Damaged condition assessment
$returnDamagedPayload = @{
    barcode = $damagedAcc
    condition = "Damaged"
    damageFee = 150.00
    bookCopyId = $damagedCopyId
} | ConvertTo-Json

$returnDamagedRes = Invoke-RestMethod -Uri "$baseUrl/borrow/return" -Method Post -Headers $cashierHeaders -Body $returnDamagedPayload
$assessedFine = $returnDamagedRes.data.assessedFine
Assert-Check "3.4 Return with Damaged condition processed successfully" ($returnDamagedRes.success) "Clearance: $($returnDamagedRes.data.clearanceStatus)"
Assert-Check "3.5 Damage fine properly assessed (Expected >= 150.00)" ($assessedFine -ge 150.00) "Assessed Fine: P$assessedFine"

# 3.6 Verify physical copy status in database transitioned to Damaged
$copyAfterDamagedReturn = (Invoke-RestMethod -Uri "$baseUrl/copies/$damagedCopyId" -Headers $adminHeaders).data
Assert-Check "3.6 BookCopy.Status transitioned to Damaged" ($copyAfterDamagedReturn.status -eq "Damaged" -or $copyAfterDamagedReturn.status -eq 3) "Copy Status: $($copyAfterDamagedReturn.status)"

# 3.7 Verify Book.AvailableCopies was PRESERVED and NOT restored to shelf!
$bookAfterDamagedReturn = (Invoke-RestMethod -Uri "$baseUrl/books" -Method Get).data | Where-Object { $_.id -eq $bookId }
Assert-Check "3.7 Book.AvailableCopies preserved without incrementing (Damaged volume not shelved)" `
    ($bookAfterDamagedReturn.availableCopies -eq $availAfterCheckout) `
    "AvailableCopies remains $availAfterCheckout (Shelf copies not artificially restored)"


# --- Part 3B: Return with condition 'Good' ---
Write-Host "`n  [TEST 3B] Testing Return with Condition Good..." -ForegroundColor Cyan

# 3.8 Create fresh physical copy for Good workflow
$goodCopyRes = Invoke-RestMethod -Uri "$baseUrl/books/$bookId/copies" -Method Post -Headers $adminHeaders -Body (@{
    bayLocation = "Bay Good-Test"
    condition = "Good"
} | ConvertTo-Json)
$goodCopy = $goodCopyRes.data
$goodCopyId = [Guid]$goodCopy.id
$goodAcc = $goodCopy.accessionNumber
Assert-Check "3.8 Dedicated Physical Copy Created for Good Return" ($goodCopyRes.success) "Accession: $goodAcc"

$bookBeforeGoodCheckout = (Invoke-RestMethod -Uri "$baseUrl/books" -Method Get).data | Where-Object { $_.id -eq $bookId }
$availBeforeGoodCheckout = $bookBeforeGoodCheckout.availableCopies

# 3.9 Check out good copy to patron
$checkoutGoodRes = Invoke-RestMethod -Uri "$baseUrl/borrow/checkout" -Method Post -Headers $cashierHeaders -Body (@{
    patronId = $patronId
    bookBarcodes = @( $goodAcc )
} | ConvertTo-Json)
Assert-Check "3.9 Checkout Good Volume to Patron Succeeded" ($checkoutGoodRes.success) "Loan Created"

$bookDuringGoodLoan = (Invoke-RestMethod -Uri "$baseUrl/books" -Method Get).data | Where-Object { $_.id -eq $bookId }
$availDuringGoodLoan = $bookDuringGoodLoan.availableCopies
Assert-Check "3.10 AvailableCopies decremented during loan" ($availDuringGoodLoan -eq ($availBeforeGoodCheckout - 1)) "Now $availDuringGoodLoan"

# 3.11 Cashier Returns Volume in Good condition
$returnGoodPayload = @{
    barcode = $goodAcc
    condition = "Good"
    damageFee = 0.00
    bookCopyId = $goodCopyId
} | ConvertTo-Json

$returnGoodRes = Invoke-RestMethod -Uri "$baseUrl/borrow/return" -Method Post -Headers $cashierHeaders -Body $returnGoodPayload
Assert-Check "3.11 Return in Good condition processed successfully" ($returnGoodRes.success) "Clearance: $($returnGoodRes.data.clearanceStatus)"
Assert-Check "3.12 No damage fine assessed for Good condition (0.00)" ($returnGoodRes.data.assessedFine -eq 0.00) "Fine: P$($returnGoodRes.data.assessedFine)"

# 3.13 Verify physical copy status in database transitioned to Available
$copyAfterGoodReturn = (Invoke-RestMethod -Uri "$baseUrl/copies/$goodCopyId" -Headers $adminHeaders).data
Assert-Check "3.13 BookCopy.Status transitioned to Available" ($copyAfterGoodReturn.status -eq "Available" -or $copyAfterGoodReturn.status -eq 0) "Copy Status: $($copyAfterGoodReturn.status)"

# 3.14 Verify Book.AvailableCopies INCREMENTED by 1 back to active shelf!
$bookAfterGoodReturn = (Invoke-RestMethod -Uri "$baseUrl/books" -Method Get).data | Where-Object { $_.id -eq $bookId }
Assert-Check "3.14 Book.AvailableCopies restored and incremented (+1) to active stacks" `
    ($bookAfterGoodReturn.availableCopies -eq $availBeforeGoodCheckout) `
    "AvailableCopies restored to $availBeforeGoodCheckout"


# ------------------------------------------------------------------------------
# FINAL REPORT
# ------------------------------------------------------------------------------
Write-Host "`n====================================================================" -ForegroundColor Cyan
Write-Host "VERIFICATION TELEMETRY SUMMARY" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "Total Checks Run : $($global:passCount + $global:failCount)" -ForegroundColor White
Write-Host "Total Passed     : $($global:passCount)" -ForegroundColor Green
Write-Host "Total Failed     : $($global:failCount)" -ForegroundColor $(if ($global:failCount -eq 0) { "Green" } else { "Red" })

if ($global:failCount -eq 0) {
    Write-Host "`n>> ALL CHALLENGED SECURITY AND EDGE-CASE SUITES PASSED 100% GREEN! <<" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n>> VERIFICATION DETECTED FAILURES <<" -ForegroundColor Red
    exit 1
}
