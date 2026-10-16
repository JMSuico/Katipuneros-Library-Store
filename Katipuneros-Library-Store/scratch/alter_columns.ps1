$connString = "Server=localhost;Database=KatipunerosLibraryDb;User Id=InventoryLibrary;Password=InventoryLibrary;TrustServerCertificate=True;MultipleActiveResultSets=true;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
try {
    $conn.Open()
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = @"
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Books' AND COLUMN_NAME = 'CoverImage')
BEGIN
    ALTER TABLE [Books] ALTER COLUMN [CoverImage] NVARCHAR(MAX) NULL;
END

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'ProfilePictureUrl')
BEGIN
    ALTER TABLE [Users] ALTER COLUMN [ProfilePictureUrl] NVARCHAR(MAX) NULL;
END

SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE (TABLE_NAME = 'Books' AND COLUMN_NAME = 'CoverImage') 
   OR (TABLE_NAME = 'Users' AND COLUMN_NAME = 'ProfilePictureUrl');
"@
    $reader = $cmd.ExecuteReader()
    while ($reader.Read()) {
        $t = $reader["TABLE_NAME"]
        $c = $reader["COLUMN_NAME"]
        $dt = $reader["DATA_TYPE"]
        $len = $reader["CHARACTER_MAXIMUM_LENGTH"]
        Write-Host "Table: $t, Column: $c, Type: $dt($len)"
    }
    $reader.Close()
} catch {
    Write-Host "Error: $_"
} finally {
    $conn.Close()
}
