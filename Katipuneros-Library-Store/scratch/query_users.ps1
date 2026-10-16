$connStr = "Server=localhost;Database=KatipunerosLibraryDb;User Id=InventoryLibrary;Password=InventoryLibrary;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT Id, Username, Email, Role, FullName, IsActive, PasswordHash FROM [Users];"
$reader = $cmd.ExecuteReader()
while ($reader.Read()) {
    Write-Host "User: ID=$($reader['Id']), Username=$($reader['Username']), Email=$($reader['Email']), Role=$($reader['Role']), Hash=$($reader['PasswordHash'].ToString().Substring(0, [Math]::Min(20, $reader['PasswordHash'].ToString().Length)))..."
}
$reader.Close()
$conn.Close()
