# scratch/verify_auth.ps1 -- Automated test for Customer Registration & Multi-Identifier Login
$ErrorActionPreference = "Stop"

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$username = "loop_patron_$ts"
$email = "loop_patron_$ts@katipuneros.edu.ph"
$password = "CustomerPass2026!"

Write-Host "1. Registering customer account: $username..."
$regPayload = @{
    firstName = "Apolinario"
    middleName = "Mabini"
    lastName = "Marasigan"
    email = $email
    username = $username
    password = $password
    employmentStatus = "Faculty"
    currentAddress = "Talaga, Tanauan, Batangas"
    permanentAddress = "Talaga, Tanauan, Batangas"
} | ConvertTo-Json

$regResp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $regPayload -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5173" }
if (-not $regResp.success -or $regResp.data.role -ne "Customer") {
    Write-Error "Registration failed."
}
$cardNumber = $regResp.data.libraryCardNumber
Write-Host "   -> Registered successfully! Card Number: $cardNumber"

Write-Host "2. Immediate Login via Username ($username)..."
$loginUserPayload = @{ identifier = $username; password = $password } | ConvertTo-Json
$loginUserResp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginUserPayload -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5173" }
if (-not $loginUserResp.success -or [string]::IsNullOrEmpty($loginUserResp.data.token)) {
    Write-Error "Login via username failed."
}
Write-Host "   -> Login via username verified! Role: $($loginUserResp.data.role)"

Write-Host "3. Immediate Login via Institutional Email ($email)..."
$loginEmailPayload = @{ identifier = $email; password = $password } | ConvertTo-Json
$loginEmailResp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginEmailPayload -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5173" }
if (-not $loginEmailResp.success -or $loginEmailResp.data.userId -ne $regResp.data.userId) {
    Write-Error "Login via email failed."
}
Write-Host "   -> Login via email verified!"

Write-Host "4. Immediate Login via Library Card Number ($cardNumber)..."
$loginCardPayload = @{ identifier = $cardNumber; password = $password } | ConvertTo-Json
$loginCardResp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginCardPayload -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5173" }
if (-not $loginCardResp.success -or $loginCardResp.data.userId -ne $regResp.data.userId) {
    Write-Error "Login via library card number failed."
}
Write-Host "   -> Login via card number verified!"

Write-Host "5. Verify Existing User 'Test123' Sign In..."
$test123Payload = @{ identifier = "Test123"; password = "Password123!" } | ConvertTo-Json
$test123Resp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $test123Payload -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5173" }
if (-not $test123Resp.success -or $test123Resp.data.role -ne "Customer") {
    Write-Error "Test123 login failed."
}
Write-Host "   -> User Test123 login verified! (Full Name: $($test123Resp.data.fullName))`n"

Write-Host "CRIT-01 ALL GREEN: Customer registration and multi-identifier login verified."
