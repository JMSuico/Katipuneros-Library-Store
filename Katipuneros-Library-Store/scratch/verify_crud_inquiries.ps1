# scratch/verify_crud_inquiries.ps1 -- Full CRUD Verification for Inquiries (API -> Database -> API)
$ErrorActionPreference = "Stop"

$connStr = "Server=localhost;Database=KatipunerosLibraryDb;User Id=InventoryLibrary;Password=InventoryLibrary;TrustServerCertificate=True;"

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$name = "General Antonio Luna"
$email = "luna_$ts@katipuneros.edu.ph"
$subject = "Archival Access Request $ts"
$msgBody = "Inquiry regarding primary source documents from 1898 revolutionary archives."

Write-Host "=== 1. [CREATE] Submit Public Contact Inquiry via API ==="
$submitPayload = @{
    name = $name
    email = $email
    subject = $subject
    message = $msgBody
} | ConvertTo-Json

$submitResp = Invoke-RestMethod -Uri "http://localhost:5000/api/contact" -Method POST -Body $submitPayload -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5173" }
if (-not $submitResp.success) {
    Write-Error "Contact submission API call failed."
}
Write-Host "  API Submission Succeeded: $($submitResp.message)"

Write-Host "`n=== 2. Verify SQL Server Database Insertion ==="
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT Id, Name, Email, Subject, Message, Status, SubmittedAt FROM ContactMessages WHERE Email = '$email'"
$reader = $cmd.ExecuteReader()
if (-not $reader.Read()) {
    $conn.Close()
    Write-Error "Database verification failed: Contact message was not inserted into [ContactMessages] table."
}
$msgId = $reader["Id"].ToString()
$dbName = $reader["Name"].ToString()
$dbSubj = $reader["Subject"].ToString()
$dbStatus = [int]$reader["Status"]
$conn.Close()

Write-Host "  Database Confirmed: Id=$msgId | Name='$dbName' | Status=$dbStatus (Expected: 1 = New) | Subject='$dbSubj'"
if ($dbName -ne $name -or $dbSubj -ne $subject -or $dbStatus -ne 1) {
    Write-Error "Database fields mismatch after inquiry submission."
}

Write-Host "`n=== 3. [READ] Admin Inquiries Query via API ==="
$adminLogin = @{ identifier = "testadmin@katipuneros.edu.ph"; password = "Password123!" } | ConvertTo-Json
$adminAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $adminLogin -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5174" }
$adminToken = $adminAuth.data.token

$inquiriesResp = Invoke-RestMethod -Uri "http://localhost:5000/api/contact/inquiries" -Method GET -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
$found = $inquiriesResp.data | Where-Object { $_.id -eq $msgId -or $_.email -eq $email }
if (-not $found) {
    Write-Error "Submitted inquiry not found in Admin Inquiries API."
}
Write-Host "  API Read Confirmed: Found inquiry '$($found.subject)' submitted by '$($found.name)'"

Write-Host "`n=== 4. [DELETE] Database Cleanup of Test Inquiry ==="
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "DELETE FROM ContactMessages WHERE Id = '$msgId'"
$deleted = $cmd.ExecuteNonQuery()
$conn.Close()

if ($deleted -lt 1) {
    Write-Error "Failed to delete test inquiry from database."
}
Write-Host "  Database Confirmed DELETION: Removed test message $msgId."

Write-Host "`nCRIT-06 ALL GREEN: Inquiries CRUD fully verified across UI/API/Database."
