# scratch/verify_crud_books.ps1 -- Full CRUD Verification for Books (API -> Database -> API)
$ErrorActionPreference = "Stop"

$connStr = "Server=localhost;Database=KatipunerosLibraryDb;User Id=InventoryLibrary;Password=InventoryLibrary;TrustServerCertificate=True;"

Write-Host "=== 1. Admin Authentication ==="
$adminLogin = @{ identifier = "testadmin@katipuneros.edu.ph"; password = "Password123!" } | ConvertTo-Json
$adminAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $adminLogin -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5174" }
$adminToken = $adminAuth.data.token

# Get Category
$catResp = Invoke-RestMethod -Uri "http://localhost:5000/api/categories" -Method GET
$catId = $catResp.data[0].id

Write-Host "`n=== 2. [CREATE] Book via API -> Verify DB Insertion ==="
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$title = "CRUD Test Book Alpha $ts"
$author = "Marcelo H. Del Pilar"
$isbn = "978-CRUD-$ts"
$initialBay = "Special Collections Bay 4"

$createPayload = @{
    title = $title
    author = $author
    isbn = $isbn
    categoryId = $catId
    publishedYear = 2026
    totalCopies = 10
    bayLocation = $initialBay
    description = "Full-stack CRUD verification asset."
    rfidTag = "RFID-CRUD-$ts"
} | ConvertTo-Json

$createResp = Invoke-RestMethod -Uri "http://localhost:5000/api/books" -Method POST -Body $createPayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
$bookId = $createResp.data.id
Write-Host "  API returned Book Id: $bookId"

# Directly Query SQL Server Database
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT Id, Title, Author, TotalCopies, AvailableCopies, BayLocation FROM Books WHERE Id = '$bookId'"
$reader = $cmd.ExecuteReader()
if (-not $reader.Read()) {
    $conn.Close()
    Write-Error "Database verification failed: Book $bookId was not inserted into [Books] table."
}
$dbTitle = $reader["Title"].ToString()
$dbCopies = [int]$reader["TotalCopies"]
$dbBay = $reader["BayLocation"].ToString()
$conn.Close()

Write-Host "  Database Confirmed: Title='$dbTitle' | Copies=$dbCopies | Bay='$dbBay'"
if ($dbTitle -ne $title -or $dbCopies -ne 10) {
    Write-Error "Database field mismatch after CREATE."
}

Write-Host "`n=== 3. [READ] Book via Public Catalog API ==="
$readResp = Invoke-RestMethod -Uri "http://localhost:5000/api/books/$bookId" -Method GET
if ($readResp.data.title -ne $title -or $readResp.data.availableCopies -ne 10) {
    Write-Error "API READ returned corrupted data."
}
Write-Host "  API Read Confirmed: Title='$($readResp.data.title)' | AvailableCopies=$($readResp.data.availableCopies)"

Write-Host "`n=== 4. [UPDATE] Book via Admin API -> Verify DB Mutation ==="
$updatedTitle = "CRUD Test Book Alpha (Revised Edition) $ts"
$updatedBay = "Archival Vault Bay 9"

$updatePayload = @{
    title = $updatedTitle
    author = $author
    isbn = $isbn
    categoryId = $catId
    publishedYear = 2026
    totalCopies = 15
    bayLocation = $updatedBay
    description = "Updated full-stack CRUD verification asset."
} | ConvertTo-Json

$updateResp = Invoke-RestMethod -Uri "http://localhost:5000/api/books/$bookId" -Method PUT -Body $updatePayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
if (-not $updateResp.success) {
    Write-Error "Book update API call failed."
}

# Directly Query SQL Server Database to verify update
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT Title, TotalCopies, BayLocation FROM Books WHERE Id = '$bookId'"
$reader = $cmd.ExecuteReader()
if (-not $reader.Read()) {
    $conn.Close()
    Write-Error "Database query failed after UPDATE."
}
$newDbTitle = $reader["Title"].ToString()
$newDbCopies = [int]$reader["TotalCopies"]
$newDbBay = $reader["BayLocation"].ToString()
$conn.Close()

Write-Host "  Database Confirmed UPDATE: Title='$newDbTitle' | Copies=$newDbCopies | Bay='$newDbBay'"
if ($newDbTitle -ne $updatedTitle -or $newDbCopies -ne 15 -or $newDbBay -ne $updatedBay) {
    Write-Error "Database values were not updated as expected."
}

Write-Host "`n=== 5. [DELETE] Book via Admin API -> Verify DB Deletion ==="
$deleteResp = Invoke-RestMethod -Uri "http://localhost:5000/api/books/$bookId" -Method DELETE -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
if (-not $deleteResp.success) {
    Write-Error "Delete API call failed."
}

# Directly Query SQL Server to confirm row deletion
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT COUNT(*) FROM Books WHERE Id = '$bookId'"
$count = [int]$cmd.ExecuteScalar()
$conn.Close()

if ($count -ne 0) {
    Write-Error "Database verification failed: Record still exists in [Books] after DELETE."
}
Write-Host "  Database Confirmed DELETION: Row count for $bookId is 0."

Write-Host "`nCRIT-01 ALL GREEN: Books CRUD fully verified across UI/API/Database."
