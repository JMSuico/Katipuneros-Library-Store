$connStr = "Server=localhost;Database=KatipunerosLibraryDb;User Id=InventoryLibrary;Password=InventoryLibrary;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Reservations';"
$reader = $cmd.ExecuteReader()
while ($reader.Read()) {
    Write-Host "$($reader['COLUMN_NAME']) : $($reader['DATA_TYPE'])"
}
$reader.Close()
$conn.Close()
