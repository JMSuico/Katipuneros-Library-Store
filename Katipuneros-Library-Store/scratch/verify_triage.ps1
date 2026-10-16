# scratch/verify_triage.ps1 -- Automated test for Admin Approve and Decline Pending Reservations
$ErrorActionPreference = "Stop"

Write-Host "1. Authenticating Admin and Creating Test Patron & Book..."
$adminLogin = @{ identifier = "testadmin@katipuneros.edu.ph"; password = "Password123!" } | ConvertTo-Json
$adminAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $adminLogin -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5174" }
$adminToken = $adminAuth.data.token

# Create fresh test patron
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$regPayload = @{
    firstName = "Triage"
    lastName = "Patron"
    email = "triage_patron_$ts@katipuneros.edu.ph"
    username = "triage_patron_$ts"
    password = "TriagePass2026!"
    employmentStatus = "Student"
    currentAddress = "Quezon City"
    permanentAddress = "Quezon City"
} | ConvertTo-Json
$regResp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $regPayload -ContentType "application/json"
$patronToken = $regResp.data.token

# Get category and add test book with 5 copies
$catResp = Invoke-RestMethod -Uri "http://localhost:5000/api/categories" -Method GET
$catId = $catResp.data[0].id

$bookPayload = @{
    title = "Triage Verification Manual $ts"
    author = "National Library Commission"
    isbn = "978-000-$ts"
    categoryId = $catId
    publishedYear = 2026
    totalCopies = 5
    bayLocation = "Archive Section A-1"
} | ConvertTo-Json
$bookResp = Invoke-RestMethod -Uri "http://localhost:5000/api/books" -Method POST -Body $bookPayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
$bookId = $bookResp.data.id

Write-Host "2. Creating Two Pending Reservations..."
$hold1Payload = @{ bookId = $bookId; pickupBranch = "Main Campus Library" } | ConvertTo-Json
$hold1 = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations" -Method POST -Body $hold1Payload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $patronToken"; "Origin" = "http://localhost:5173" }
$hold1Id = $hold1.data.id
Write-Host "   -> Hold 1 created: $hold1Id"

# Create second patron for hold 2 (one hold per book per patron)
$patron2Payload = @{
    firstName = "Triage2"
    lastName = "Patron2"
    email = "triage_patron2_$ts@katipuneros.edu.ph"
    username = "triage_patron2_$ts"
    password = "TriagePass2026!"
    employmentStatus = "Student"
    currentAddress = "Quezon City"
    permanentAddress = "Quezon City"
} | ConvertTo-Json
$patron2Resp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $patron2Payload -ContentType "application/json"
$patron2Token = $patron2Resp.data.token

$hold2 = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations" -Method POST -Body $hold1Payload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $patron2Token"; "Origin" = "http://localhost:5173" }
$hold2Id = $hold2.data.id
Write-Host "   -> Hold 2 created: $hold2Id"

Write-Host "3. Admin Approving Hold 1 via Triage..."
$approvePayload = @{
    approved = $true
    reason = "Approved for automated smart locker staging."
    priority = $false
} | ConvertTo-Json

$approveResp = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/$hold1Id/triage" -Method PUT -Body $approvePayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
if (-not $approveResp.success) {
    Write-Error "Hold 1 approval failed."
}
Write-Host "   -> Hold 1 successfully approved!"

Write-Host "4. Admin Declining Hold 2 via Triage..."
$declinePayload = @{
    approved = $false
    reason = "Declined per user circulation quota review."
    priority = $false
} | ConvertTo-Json

$declineResp = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/$hold2Id/triage" -Method PUT -Body $declinePayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
if (-not $declineResp.success) {
    Write-Error "Hold 2 decline failed."
}
Write-Host "   -> Hold 2 successfully declined!"

Write-Host "5. Verifying Final Status Transitions in Admin Queue..."
$allHoldsResp = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations" -Method GET -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
$h1Record = $allHoldsResp.data | Where-Object { $_.id -eq $hold1Id }
$h2Record = $allHoldsResp.data | Where-Object { $_.id -eq $hold2Id }

Write-Host "   -> Hold 1 Status: $($h1Record.status) (Locker Bay: $($h1Record.lockerBay), Pin: $($h1Record.lockerPin))"
Write-Host "   -> Hold 2 Status: $($h2Record.status)"

if ($h1Record.status -ne "StagedInLocker" -and $h1Record.status -ne "ReadyForPickup" -and $h1Record.status -ne "Approved") {
    Write-Error "Hold 1 did not transition to approved state. Actual: $($h1Record.status)"
}

if ($h2Record.status -ne "Cancelled" -and $h2Record.status -ne "Rejected" -and $h2Record.status -ne "Declined") {
    Write-Error "Hold 2 did not transition to cancelled/declined state. Actual: $($h2Record.status)"
}

Write-Host "`nCRIT-04 ALL GREEN: Admin approve and decline triage verified."
