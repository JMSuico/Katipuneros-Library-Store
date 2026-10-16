$connStr = "Server=localhost;Database=KatipunerosLibraryDb;User Id=InventoryLibrary;Password=InventoryLibrary;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT Id, Name FROM [Categories];"
$reader = $cmd.ExecuteReader()
while ($reader.Read()) {
    Write-Host "Category: Id=$($reader['Id']), Name=$($reader['Name'])"
}
$reader.Close()
$conn.Close()
