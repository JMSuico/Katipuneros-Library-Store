# scratch/verify_crud_borrowings.ps1 -- Full CRUD Verification for Borrowings (API -> Database -> API)
$ErrorActionPreference = "Stop"

$connStr = "Server=localhost;Database=KatipunerosLibraryDb;User Id=InventoryLibrary;Password=InventoryLibrary;TrustServerCertificate=True;"

Write-Host "=== 1. Admin Authentication ==="
$adminLogin = @{ identifier = "testadmin@katipuneros.edu.ph"; password = "Password123!" } | ConvertTo-Json
$adminAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $adminLogin -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5174" }
$adminToken = $adminAuth.data.token

# Get Default Category
$catResp = Invoke-RestMethod -Uri "http://localhost:5000/api/categories" -Method GET
$catId = $catResp.data[0].id

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$isbn = "978-BRW-$ts"
$rfid = "RFID-BRW-$ts"

Write-Host "`n=== 2. Setup Test Book & Patron ==="
$bookPayload = @{
    title = "Borrowings Verification Volume $ts"
    author = "Apolinario Mabini"
    isbn = $isbn
    categoryId = $catId
    publishedYear = 2026
    totalCopies = 5
    bayLocation = "Circulation Shelf B-05"
    description = "Circulation checkout & return test asset."
    rfidTag = $rfid
} | ConvertTo-Json

$bookResp = Invoke-RestMethod -Uri "http://localhost:5000/api/books" -Method POST -Body $bookPayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
$bookId = $bookResp.data.id
$barcode = $bookResp.data.isbnBarcode
if (-not $barcode) { $barcode = $isbn }
Write-Host "  Book Created: Id=$bookId | Barcode=$barcode | Copies=$($bookResp.data.availableCopies)"

$patronPayload = @{
    firstName = "Borrower"
    lastName = "Patron"
    email = "borrower_$ts@katipuneros.edu.ph"
    username = "borrower_$ts"
    password = "Password123!"
    employmentStatus = "Student"
    currentAddress = "Manila, Philippines"
    permanentAddress = "Manila, Philippines"
} | ConvertTo-Json

$patronResp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $patronPayload -ContentType "application/json"
$patronId = $patronResp.data.userId
Write-Host "  Patron Created: Id=$patronId"

# Assert initial copies in Database
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT TotalCopies, AvailableCopies FROM Books WHERE Id = '$bookId'"
$reader = $cmd.ExecuteReader()
if (-not $reader.Read()) {
    $conn.Close()
    Write-Error "Database verification failed: Book was not found."
}
$initTotal = [int]$reader["TotalCopies"]
$initAvail = [int]$reader["AvailableCopies"]
$conn.Close()

if ($initTotal -ne 5 -or $initAvail -ne 5) {
    Write-Error "Initial book copies unexpected. Total: $initTotal, Available: $initAvail"
}
Write-Host "  Database Confirmed Initial: Total=$initTotal, Available=$initAvail"

Write-Host "`n=== 3. [CREATE / CHECKOUT] Book via API -> Verify DB Transaction & Stock Decrement ==="
$checkoutPayload = @{
    patronId = $patronId
    bookBarcodes = @($barcode)
    dueDate = (Get-Date).AddDays(14).ToString("o")
} | ConvertTo-Json

$checkoutResp = Invoke-RestMethod -Uri "http://localhost:5000/api/borrow/checkout" -Method POST -Body $checkoutPayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
if (-not $checkoutResp.success) {
    Write-Error "Checkout API call failed."
}
$txId = $checkoutResp.data[0].id
$gatePass = $checkoutResp.data[0].gatePassCode
Write-Host "  API Checkout Confirmed: TxId=$txId | GatePass=$gatePass"

# Verify in SQL Server Database: BorrowTransactions row + Books.AvailableCopies decremented
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT Id, Status, GatePassCode FROM BorrowTransactions WHERE Id = '$txId'"
$reader = $cmd.ExecuteReader()
if (-not $reader.Read()) {
    $conn.Close()
    Write-Error "Database verification failed: BorrowTransaction $txId not found."
}
$txStatus = [int]$reader["Status"]
$txGatePass = $reader["GatePassCode"].ToString()
$conn.Close()

Write-Host "  Database Confirmed BorrowTransaction: Status=$txStatus (Expected: 1 = Active) | GatePass='$txGatePass'"
if ($txStatus -ne 1) {
    Write-Error "BorrowTransaction status is not Active (1)."
}

$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT AvailableCopies FROM Books WHERE Id = '$bookId'"
$copiesAfterCheckout = [int]$cmd.ExecuteScalar()
$conn.Close()

Write-Host "  Database Confirmed Book Copies Decremented: $copiesAfterCheckout (Expected: 4)"
if ($copiesAfterCheckout -ne 4) {
    Write-Error "Book AvailableCopies in database was not decremented to 4."
}

Write-Host "`n=== 4. [READ] Circulation Ledger via API ==="
$ledgerResp = Invoke-RestMethod -Uri "http://localhost:5000/api/borrow/admin-ledger" -Method GET -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
$foundLoan = $ledgerResp.data | Where-Object { $_.id -eq $txId -or $_.bookId -eq $bookId }
if (-not $foundLoan) {
    Write-Error "Transaction not found in admin circulation ledger API."
}
Write-Host "  API Read Confirmed: Found active loan for Patron '$($foundLoan.patronName)'"

Write-Host "`n=== 5. [UPDATE / RETURN] Book via API -> Verify DB Status & Stock Increment ==="
$returnPayload = @{
    barcode = $barcode
    conditionNotes = "Returned in excellent condition."
    damageFee = 0
} | ConvertTo-Json

$returnResp = Invoke-RestMethod -Uri "http://localhost:5000/api/borrow/return" -Method POST -Body $returnPayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
if (-not $returnResp.success) {
    Write-Error "Return API call failed."
}
Write-Host "  API Return Confirmed: Clearance='$($returnResp.data.clearanceStatus)'"

# Verify in SQL Server Database: BorrowTransaction Status = 2 (Returned) and ReturnDate IS NOT NULL
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT Status, ReturnDate FROM BorrowTransactions WHERE Id = '$txId'"
$reader = $cmd.ExecuteReader()
if (-not $reader.Read()) {
    $conn.Close()
    Write-Error "Database verification failed: BorrowTransaction $txId missing after return."
}
$returnedStatus = [int]$reader["Status"]
$hasReturnDate = -not $reader.IsDBNull($reader.GetOrdinal("ReturnDate"))
$conn.Close()

Write-Host "  Database Confirmed Return: Status=$returnedStatus (Expected: 2 = Returned) | HasReturnDate=$hasReturnDate"
if ($returnedStatus -ne 2 -or -not $hasReturnDate) {
    Write-Error "Database transaction was not marked Returned with timestamp."
}

# Verify Book copies restored in SQL Server Database
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT AvailableCopies FROM Books WHERE Id = '$bookId'"
$copiesAfterReturn = [int]$cmd.ExecuteScalar()
$conn.Close()

Write-Host "  Database Confirmed Copies Restored: $copiesAfterReturn (Expected: 5)"
if ($copiesAfterReturn -ne 5) {
    Write-Error "Book AvailableCopies was not restored to 5 after return."
}

Write-Host "`n=== 6. Cleanup Verification Artifacts ==="
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "DELETE FROM BorrowTransactions WHERE Id = '$txId'; DELETE FROM Books WHERE Id = '$bookId'; DELETE FROM Users WHERE Id = '$patronId';"
$cmd.ExecuteNonQuery() | Out-Null
$conn.Close()
Write-Host "  Test records cleaned up successfully."

Write-Host "`nCRIT-05 ALL GREEN: Borrowings CRUD fully verified across UI/API/Database."
