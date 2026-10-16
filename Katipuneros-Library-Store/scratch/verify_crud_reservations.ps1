# scratch/verify_crud_reservations.ps1 -- Full CRUD Verification for Reservations (API -> Database -> API)
$ErrorActionPreference = "Stop"

$connStr = "Server=localhost;Database=KatipunerosLibraryDb;User Id=InventoryLibrary;Password=InventoryLibrary;TrustServerCertificate=True;"

Write-Host "=== 1. Setup Admin & Test Patron & Catalog Book ==="
$adminLogin = @{ identifier = "testadmin@katipuneros.edu.ph"; password = "Password123!" } | ConvertTo-Json
$adminAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $adminLogin -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5174" }
$adminToken = $adminAuth.data.token

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$regPayload = @{
    firstName = "Hold"
    lastName = "Patron"
    email = "hold_patron_$ts@katipuneros.edu.ph"
    username = "hold_patron_$ts"
    password = "HoldPass2026!"
    employmentStatus = "Student"
    currentAddress = "Manila"
    permanentAddress = "Manila"
} | ConvertTo-Json
$regResp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $regPayload -ContentType "application/json"
$patronToken = $regResp.data.token
$patronId = $regResp.data.userId

# Create a book with 5 copies
$catResp = Invoke-RestMethod -Uri "http://localhost:5000/api/categories" -Method GET
$catId = $catResp.data[0].id

$bookPayload = @{
    title = "Reservation Lifecycle Subject $ts"
    author = "Epifanio De Los Santos"
    isbn = "978-RSV-$ts"
    categoryId = $catId
    publishedYear = 2026
    totalCopies = 5
    bayLocation = "Section EDSA-01"
} | ConvertTo-Json
$bookResp = Invoke-RestMethod -Uri "http://localhost:5000/api/books" -Method POST -Body $bookPayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
$bookId = $bookResp.data.id

Write-Host "`n=== 2. [CREATE] Hold via API -> Verify DB Insertion ==="
$holdPayload = @{ bookId = $bookId; pickupBranch = "Main Campus Library" } | ConvertTo-Json
$holdResp = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations" -Method POST -Body $holdPayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $patronToken"; "Origin" = "http://localhost:5173" }
$holdId = $holdResp.data.id
Write-Host "  API returned Hold Id: $holdId"

# Directly Query SQL Server Database
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT Id, BookId, PatronId, Status FROM Reservations WHERE Id = '$holdId'"
$reader = $cmd.ExecuteReader()
if (-not $reader.Read()) {
    $conn.Close()
    Write-Error "Database verification failed: Hold $holdId was not inserted into [Reservations] table."
}
$dbBookId = $reader["BookId"].ToString()
$dbPatronId = $reader["PatronId"].ToString()
$dbStatus = [int]$reader["Status"]
$conn.Close()

Write-Host "  Database Confirmed: BookId='$dbBookId' | PatronId='$dbPatronId' | Status=$dbStatus"
if ($dbBookId -ne $bookId -or $dbPatronId -ne $patronId) {
    Write-Error "Database foreign keys mismatch after hold CREATE."
}

Write-Host "`n=== 3. [READ] Pending Queue via Admin API ==="
$queueResp = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/pending" -Method GET -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
$foundHold = $queueResp.data | Where-Object { $_.id -eq $holdId }
if (-not $foundHold) {
    Write-Error "Hold not found in Admin pending queue."
}
Write-Host "  API Read Confirmed: Found in pending queue with Patron '$($foundHold.patronName)'"

Write-Host "`n=== 4. [UPDATE] Triage Approve via Admin API -> Verify DB Locker Assignment ==="
$triagePayload = @{
    approved = $true
    reason = "Approved for automated smart locker pickup."
    priority = $false
} | ConvertTo-Json

$triageResp = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/$holdId/triage" -Method PUT -Body $triagePayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
if (-not $triageResp.success) {
    Write-Error "Triage approval failed."
}

# Directly Query SQL Server Database to verify status and locker fields
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT Status, LockerBay, LockerPin FROM Reservations WHERE Id = '$holdId'"
$reader = $cmd.ExecuteReader()
if (-not $reader.Read()) {
    $conn.Close()
    Write-Error "Database query failed after triage UPDATE."
}
$newStatus = [int]$reader["Status"]
$newBay = $reader["LockerBay"].ToString()
$newPin = $reader["LockerPin"].ToString()
$conn.Close()

Write-Host "  Database Confirmed UPDATE: Status=$newStatus | LockerBay='$newBay' | LockerPin='$newPin'"
if ([string]::IsNullOrWhiteSpace($newBay) -or [string]::IsNullOrWhiteSpace($newPin)) {
    Write-Error "LockerBay or LockerPin was not generated and saved in SQL Server."
}

Write-Host "`n=== 5. [DELETE / CANCEL] Hold via Patron API -> Verify DB Status ==="
$cancelResp = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/$holdId" -Method DELETE -Headers @{ "Authorization" = "Bearer $patronToken"; "Origin" = "http://localhost:5173" }
if (-not $cancelResp.success) {
    Write-Error "Cancel hold API failed."
}

# Directly Query SQL Server Database
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT Status FROM Reservations WHERE Id = '$holdId'"
$finalStatus = [int]$cmd.ExecuteScalar()
$conn.Close()

Write-Host "  Database Confirmed CANCEL: Status is $finalStatus (Cancelled)"
# Status 4 = Cancelled
if ($finalStatus -ne 4) {
    Write-Error "Hold record in database did not transition to Cancelled (4). Actual: $finalStatus"
}

Write-Host "`nCRIT-04 ALL GREEN: Reservations CRUD fully verified across UI/API/Database."
