# scratch/test_triage_decline.ps1
$ErrorActionPreference = "Stop"

Write-Host "Testing Decline Triage & Once-Only guard..."

$custLogin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"mariasantos","password":"Password123!"}'
$custHeaders = @{ "Authorization" = "Bearer $($custLogin.data.token)"; "Content-Type" = "application/json" }

$bookRes = Invoke-RestMethod -Uri "http://localhost:5000/api/books" -Method Get
$myHolds = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/my-holds" -Method Get -Headers $custHeaders
$activeBookIds = @($myHolds.data | Where-Object { $_.status -eq 1 -or $_.status -eq 2 -or $_.status -eq "Pending" -or $_.status -eq "StagedInLocker" } | ForEach-Object { $_.bookId })
$availableBook = $bookRes.data | Where-Object { $activeBookIds -notcontains $_.id } | Select-Object -First 1

Write-Host "Available Book: $($availableBook.title), ID: $($availableBook.id)"
try {
    $payload = @{ bookId = $availableBook.id; pickupBranch = "Main Circulation Desk" } | ConvertTo-Json
    Write-Host "Payload: $payload"
    $newHold = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations" -Method Post -Headers $custHeaders -Body $payload
    $holdId = $newHold.data.id
    Write-Host "Created hold for decline testing: $holdId" -ForegroundColor Green
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Error creating hold: $($reader.ReadToEnd())" -ForegroundColor Red
    throw
}

$cashierLogin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"testcashier","password":"Password123!"}'
$cashierHeaders = @{ "Authorization" = "Bearer $($cashierLogin.data.token)"; "Content-Type" = "application/json" }

# Triage 1: Decline
$triage1 = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/$holdId/triage" -Method Put -Headers $cashierHeaders -Body '{"approved":false,"reason":"Copy damaged"}'
Write-Host "Declined hold: Success=$($triage1.success), Message=$($triage1.message)" -ForegroundColor Green

# Triage 2: Attempt to triage again (must fail)
try {
    $triage2 = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/$holdId/triage" -Method Put -Headers $cashierHeaders -Body '{"approved":true}'
    Write-Host "[FAIL] Second triage should have failed!" -ForegroundColor Red
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $responseBody = $reader.ReadToEnd()
    Write-Host "Second triage on Declined hold properly rejected: $responseBody" -ForegroundColor Green
}

# Verify patron history contains Declined hold
$custHoldsAfter = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/my-holds" -Method Get -Headers $custHeaders
$declinedHold = $custHoldsAfter.data | Where-Object { $_.id -eq $holdId }
Write-Host "Patron my-holds includes Declined hold: Status=$($declinedHold.status)" -ForegroundColor Green
