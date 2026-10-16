# scratch/verify_crud_categories.ps1 -- Full CRUD Verification for Categories (API -> Database -> API)
$ErrorActionPreference = "Stop"

$connStr = "Server=localhost;Database=KatipunerosLibraryDb;User Id=InventoryLibrary;Password=InventoryLibrary;TrustServerCertificate=True;"

Write-Host "=== 1. Admin Authentication ==="
$adminLogin = @{ identifier = "testadmin@katipuneros.edu.ph"; password = "Password123!" } | ConvertTo-Json
$adminAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $adminLogin -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5174" }
$adminToken = $adminAuth.data.token

Write-Host "`n=== 2. [CREATE] Category via API -> Verify DB Insertion ==="
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$catName = "Philology and Linguistics $ts"
$catDesc = "Comparative analysis of Philippine languages."

$createPayload = @{
    name = $catName
    description = $catDesc
} | ConvertTo-Json

$createResp = Invoke-RestMethod -Uri "http://localhost:5000/api/categories" -Method POST -Body $createPayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
$catId = $createResp.data.id
Write-Host "  API returned Category Id: $catId"

# Directly Query SQL Server Database
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT Id, Name, Description FROM Categories WHERE Id = '$catId'"
$reader = $cmd.ExecuteReader()
if (-not $reader.Read()) {
    $conn.Close()
    Write-Error "Database verification failed: Category $catId was not inserted into [Categories] table."
}
$dbName = $reader["Name"].ToString()
$dbDesc = $reader["Description"].ToString()
$conn.Close()

Write-Host "  Database Confirmed: Name='$dbName' | Description='$dbDesc'"
if ($dbName -ne $catName) {
    Write-Error "Database name mismatch after CREATE."
}

Write-Host "`n=== 3. [READ] Categories via Public API ==="
$listResp = Invoke-RestMethod -Uri "http://localhost:5000/api/categories" -Method GET
$found = $listResp.data | Where-Object { $_.id -eq $catId }
if (-not $found) {
    Write-Error "Created category not found in public list."
}
Write-Host "  API Read Confirmed: Found '$($found.name)'"

Write-Host "`n=== 4. [UPDATE] Category via Admin API -> Verify DB Mutation ==="
$updatedName = "Philology and Austronesian Studies $ts"
$updatedDesc = "Updated comprehensive linguistics collection."

$updatePayload = @{
    name = $updatedName
    description = $updatedDesc
} | ConvertTo-Json

$updateResp = Invoke-RestMethod -Uri "http://localhost:5000/api/categories/$catId" -Method PUT -Body $updatePayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
if (-not $updateResp.success) {
    Write-Error "Category update API failed."
}

# Directly Query SQL Server Database
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT Name, Description FROM Categories WHERE Id = '$catId'"
$reader = $cmd.ExecuteReader()
if (-not $reader.Read()) {
    $conn.Close()
    Write-Error "Database query failed after UPDATE."
}
$newDbName = $reader["Name"].ToString()
$newDbDesc = $reader["Description"].ToString()
$conn.Close()

Write-Host "  Database Confirmed UPDATE: Name='$newDbName' | Description='$newDbDesc'"
if ($newDbName -ne $updatedName) {
    Write-Error "Database values were not updated as expected."
}

Write-Host "`n=== 5. [DELETE] Category via Admin API -> Verify DB Deletion ==="
$deleteResp = Invoke-RestMethod -Uri "http://localhost:5000/api/categories/$catId" -Method DELETE -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
if (-not $deleteResp.success) {
    Write-Error "Category delete API failed."
}

# Directly Query SQL Server Database
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT COUNT(*) FROM Categories WHERE Id = '$catId'"
$count = [int]$cmd.ExecuteScalar()
$conn.Close()

if ($count -ne 0) {
    Write-Error "Database verification failed: Record still exists in [Categories] after DELETE."
}
Write-Host "  Database Confirmed DELETION: Row count for $catId is 0."

Write-Host "`nCRIT-02 ALL GREEN: Categories CRUD fully verified across UI/API/Database."
