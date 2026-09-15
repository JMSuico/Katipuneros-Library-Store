$body = @{
    email = "admin@katipuneros.edu.ph"
    password = "Admin@2026!"
} | ConvertTo-Json

Write-Host "Testing Auth Login..."
$authResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
Write-Host "Login successful! Token:" ($authResponse.data.token.Substring(0, 30) + "...")
Write-Host "Role:" $authResponse.data.user.role
Write-Host "User:" $authResponse.data.user.fullName

Write-Host "`nTesting Protected Endpoint (GET /api/users with Bearer token)..."
$headers = @{
    Authorization = "Bearer " + $authResponse.data.token
}
$usersResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Method Get -Headers $headers
Write-Host "Retrieved" $usersResponse.data.Count "users from database!"

Write-Host "`nTesting Cryptographic Audit Verify-Chain..."
$auditResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/audit/verify-chain" -Method Get -Headers $headers
Write-Host "Audit chain intact:" $auditResponse.data.isIntact
Write-Host "Verified entries:" $auditResponse.data.verifiedCount
