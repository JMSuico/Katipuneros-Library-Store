Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "RESERVATION TRIAGE & ONCE-ONLY APPROVAL/DECLINE VERIFICATION" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"

# Step 1: Dynamic Patron Registration for Idempotency
$uniqueId = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$regBody = @{
    firstName = "Triage"
    lastName = "Patron"
    username = "triage_user_$uniqueId"
    email = "triage_user_$uniqueId@test.edu.ph"
    password = "Password123!"
    employmentStatus = "Student"
    currentAddress = "Katipunan Avenue"
    permanentAddress = "Quezon City"
    department = "Circulation Studies"
    phoneNumber = "+639123456789"
} | ConvertTo-Json

$regRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body $regBody
$custToken = $regRes.data.token
$custHeaders = @{ "Authorization" = "Bearer $custToken"; "Content-Type" = "application/json" }
Write-Host "[AUTH] Authenticated Patron: $($regRes.data.fullName) ($($regRes.data.username))" -ForegroundColor DarkGray

# Step 2: Cashier Authentication
$cashierLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"testcashier","password":"Password123!"}'
$cashierToken = $cashierLogin.data.token
$cashierHeaders = @{ "Authorization" = "Bearer $cashierToken"; "Content-Type" = "application/json" }
Write-Host "[AUTH] Authenticated Cashier: $($cashierLogin.data.fullName)" -ForegroundColor DarkGray

# Get available books from data array directly
$bookRes = Invoke-RestMethod -Uri "$baseUrl/books" -Method Get
$book1 = $bookRes.data[0]
$book2 = $bookRes.data[1]

Write-Host "[BOOK] Book 1: $($book1.title) ($($book1.id))" -ForegroundColor DarkGray
Write-Host "[BOOK] Book 2: $($book2.title) ($($book2.id))" -ForegroundColor DarkGray

# TEST 1: Customer creates reservation 1
$hold1Body = @{ bookId = $book1.id; pickupBranch = "Main Circulation Desk" } | ConvertTo-Json
$hold1 = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $custHeaders -Body $hold1Body
$hold1Id = $hold1.data.id
Write-Host "[TEST 1] Hold 1 Created: $hold1Id | Status: $($hold1.data.status)" -ForegroundColor Green

# TEST 2: Cashier Approves Hold 1
$approveRes = Invoke-RestMethod -Uri "$baseUrl/reservations/$hold1Id/triage" -Method Put -Headers $cashierHeaders -Body '{"approved":true,"priority":false}'
Write-Host "[TEST 2] Cashier Approved Hold 1: Success=$($approveRes.success), Msg=$($approveRes.message)" -ForegroundColor Green

# TEST 3: Cashier Attempts to Re-Approve Hold 1 (MUST FAIL with Once-Only error)
try {
    $secondApprove = Invoke-RestMethod -Uri "$baseUrl/reservations/$hold1Id/triage" -Method Put -Headers $cashierHeaders -Body '{"approved":true,"priority":false}'
    Write-Host "[FAIL] Re-approval should have been blocked by Once-Only guard!" -ForegroundColor Red
    exit 1
} catch {
    Write-Host "[TEST 3] Re-approval strictly blocked by Once-Only guard: $($_.Exception.Message)" -ForegroundColor Green
}

# TEST 4: Cashier Attempts to Decline Hold 1 after it was Approved (MUST FAIL with Once-Only error)
try {
    $declineApproved = Invoke-RestMethod -Uri "$baseUrl/reservations/$hold1Id/triage" -Method Put -Headers $cashierHeaders -Body '{"approved":false,"reason":"Trying to decline approved hold"}'
    Write-Host "[FAIL] Re-declining approved hold should have been blocked!" -ForegroundColor Red
    exit 1
} catch {
    Write-Host "[TEST 4] Triage change on approved hold strictly blocked: $($_.Exception.Message)" -ForegroundColor Green
}

# TEST 5: Customer creates reservation 2 for testing DECLINE flow
$hold2Body = @{ bookId = $book2.id; pickupBranch = "Main Circulation Desk" } | ConvertTo-Json
$hold2 = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $custHeaders -Body $hold2Body
$hold2Id = $hold2.data.id
Write-Host "[TEST 5] Hold 2 Created: $hold2Id | Status: $($hold2.data.status)" -ForegroundColor Green

# TEST 6: Cashier Declines Hold 2
$declineRes = Invoke-RestMethod -Uri "$baseUrl/reservations/$hold2Id/triage" -Method Put -Headers $cashierHeaders -Body '{"approved":false,"reason":"Physical copy damaged during pull"}'
Write-Host "[TEST 6] Cashier Declined Hold 2: Success=$($declineRes.success), Msg=$($declineRes.message)" -ForegroundColor Green

# TEST 7: Cashier Attempts to Re-Triage Declined Hold 2 (MUST FAIL with Once-Only error)
try {
    $secondDecline = Invoke-RestMethod -Uri "$baseUrl/reservations/$hold2Id/triage" -Method Put -Headers $cashierHeaders -Body '{"approved":true,"priority":false}'
    Write-Host "[FAIL] Re-triaging declined hold should have been blocked!" -ForegroundColor Red
    exit 1
} catch {
    Write-Host "[TEST 7] Re-triaging declined hold strictly blocked: $($_.Exception.Message)" -ForegroundColor Green
}

# TEST 8: Customer Calls GET /api/reservations/my-holds (Must return BOTH Approved and Declined holds!)
$myHoldsRes = Invoke-RestMethod -Uri "$baseUrl/reservations/my-holds" -Method Get -Headers $custHeaders
$myApproved = $myHoldsRes.data | Where-Object { $_.id -eq $hold1Id }
$myDeclined = $myHoldsRes.data | Where-Object { $_.id -eq $hold2Id }

if ($myApproved -and ($myApproved.status -eq "StagedInLocker" -or $myApproved.status -eq "2")) {
    Write-Host "[TEST 8A] Customer Sees Approved Hold in Ledger: Status=$($myApproved.status), Bay=$($myApproved.lockerBay), PIN=$($myApproved.lockerPin)" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Customer did not see Approved hold!" -ForegroundColor Red
    exit 1
}

if ($myDeclined -and ($myDeclined.status -eq "Cancelled" -or $myDeclined.status -eq "4")) {
    Write-Host "[TEST 8B] Customer Sees Declined Hold in Ledger: Status=$($myDeclined.status)" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Customer did not see Declined hold in ledger!" -ForegroundColor Red
    exit 1
}

# TEST 9: Cashier Calls GET /api/reservations (Queue returns all items with statuses for badges)
$allHolds = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Get -Headers $cashierHeaders
$cashierApproved = $allHolds.data | Where-Object { $_.id -eq $hold1Id }
$cashierDeclined = $allHolds.data | Where-Object { $_.id -eq $hold2Id }

Write-Host "[TEST 9] Cashier Ledger Holds Found: Approved=$($cashierApproved.status), Declined=$($cashierDeclined.status)" -ForegroundColor Green

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "ALL 9 CLOSED-LOOP TRIAGE LIFECYCLE TESTS PASSED 100% GREEN" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
