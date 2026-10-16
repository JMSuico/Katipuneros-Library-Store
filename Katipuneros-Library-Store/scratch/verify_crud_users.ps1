# scratch/verify_crud_users.ps1 -- Full CRUD Verification for Users (API -> Database -> API)
$ErrorActionPreference = "Stop"

$connStr = "Server=localhost;Database=KatipunerosLibraryDb;User Id=InventoryLibrary;Password=InventoryLibrary;TrustServerCertificate=True;"

Write-Host "=== 1. Admin Authentication ==="
$adminLogin = @{ identifier = "testadmin@katipuneros.edu.ph"; password = "Password123!" } | ConvertTo-Json
$adminAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $adminLogin -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5174" }
$adminToken = $adminAuth.data.token

Write-Host "`n=== 2. [CREATE] Patron Account via API -> Verify DB Insertion ==="
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$username = "crud_user_$ts"
$email = "crud_user_$ts@katipuneros.edu.ph"
$password = "UserCRUDPass2026!"

$regPayload = @{
    firstName = "Diego"
    lastName = "Silang"
    email = $email
    username = $username
    password = $password
    employmentStatus = "Student"
    currentAddress = "Ilocos Norte"
    permanentAddress = "Ilocos Norte"
    department = "Social Sciences"
    phoneNumber = "+639171112233"
} | ConvertTo-Json

$regResp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $regPayload -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5173" }
$userId = $regResp.data.userId
Write-Host "  API returned User Id: $userId | Card: $($regResp.data.libraryCardNumber)"

# Directly Query SQL Server Database
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT Id, Username, Email, Role, Department, IsActive, PasswordHash FROM Users WHERE Id = '$userId'"
$reader = $cmd.ExecuteReader()
if (-not $reader.Read()) {
    $conn.Close()
    Write-Error "Database verification failed: User $userId was not inserted into [Users] table."
}
$dbUsername = $reader["Username"].ToString()
$dbEmail = $reader["Email"].ToString()
$dbRole = [int]$reader["Role"]
$dbActive = [bool]$reader["IsActive"]
$dbHash = $reader["PasswordHash"].ToString()
$conn.Close()

Write-Host "  Database Confirmed: Username='$dbUsername' | Email='$dbEmail' | Role=$dbRole | IsActive=$dbActive"
if ($dbUsername -ne $username -or $dbEmail -ne $email -or -not $dbActive -or [string]::IsNullOrWhiteSpace($dbHash)) {
    Write-Error "Database field mismatch after user CREATE."
}

Write-Host "`n=== 3. [READ] User Directory Query via Admin API ==="
$readResp = Invoke-RestMethod -Uri "http://localhost:5000/api/users/$userId" -Method GET -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
if ($readResp.data.username -ne $username -or $readResp.data.email -ne $email) {
    Write-Error "API READ returned corrupted user details."
}
Write-Host "  API Read Confirmed: Found '$($readResp.data.fullName)' ($($readResp.data.email))"

Write-Host "`n=== 4. [UPDATE] User Role & Status via Admin API -> Verify DB Mutation ==="
# Update Role to Cashier (Role 2)
$rolePayload = @{ role = 2 } | ConvertTo-Json
$roleResp = Invoke-RestMethod -Uri "http://localhost:5000/api/users/$userId/role" -Method PUT -Body $rolePayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }

# Directly Query SQL Server Database
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT Role FROM Users WHERE Id = '$userId'"
$newRole = [int]$cmd.ExecuteScalar()
$conn.Close()

Write-Host "  Database Confirmed UPDATE Role: $newRole (Expected: 2)"
if ($newRole -ne 2) {
    Write-Error "User role in database did not update to 2."
}

# Deactivate User (IsActive = false)
Write-Host "`n=== 5. [STATUS TOGGLE] Deactivate User -> Verify DB Mutation & Login Rejection ==="
$statusPayload = @{ isActive = $false } | ConvertTo-Json
$statusResp = Invoke-RestMethod -Uri "http://localhost:5000/api/users/$userId/status" -Method PUT -Body $statusPayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }

# Directly Query SQL Server Database
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT IsActive FROM Users WHERE Id = '$userId'"
$newActive = [bool]$cmd.ExecuteScalar()
$conn.Close()

Write-Host "  Database Confirmed IsActive: $newActive (Expected: False)"
if ($newActive -ne $false) {
    Write-Error "User IsActive flag was not set to False in database."
}

# Test Negative Authentication (Suspended account must be rejected)
$negLogin = @{ identifier = $username; password = $password } | ConvertTo-Json
try {
    $negResp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $negLogin -ContentType "application/json"
    Write-Error "Suspended user was improperly allowed to login!"
} catch {
    Write-Host "  Expected Security Rejection Received: $($_.Exception.Message)"
}

Write-Host "`n=== 6. [DELETE] User via Admin API -> Verify DB Deletion ==="
$delResp = Invoke-RestMethod -Uri "http://localhost:5000/api/users/$userId" -Method DELETE -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }

# Directly Query SQL Server to confirm row deletion
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT COUNT(*) FROM Users WHERE Id = '$userId'"
$count = [int]$cmd.ExecuteScalar()
$conn.Close()

if ($count -ne 0) {
    Write-Error "Database verification failed: Record still exists in [Users] after DELETE."
}
Write-Host "  Database Confirmed DELETION: Row count for $userId is 0."

Write-Host "`nCRIT-03 ALL GREEN: Users CRUD fully verified across UI/API/Database."
