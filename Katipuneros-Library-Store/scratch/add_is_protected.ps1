$connStr = "Server=localhost;Database=KatipunerosLibraryDb;User Id=InventoryLibrary;Password=InventoryLibrary;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = @"
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Users') AND name = 'IsProtected'
)
BEGIN
    ALTER TABLE Users ADD IsProtected BIT NOT NULL CONSTRAINT DF_Users_IsProtected DEFAULT 0;
    PRINT 'Added IsProtected column to Users table.';
END
ELSE
BEGIN
    PRINT 'IsProtected column already exists in Users table.';
END
"@
$cmd.ExecuteNonQuery()

# Also ensure existing CLI admin accounts (customadmin1, testcliadmin) are marked IsProtected = 1
$cmd2 = $conn.CreateCommand()
$cmd2.CommandText = "UPDATE Users SET IsProtected = 1 WHERE Username IN ('customadmin1', 'testcliadmin') OR Email IN ('customadmin1@katipuneros.edu.ph', 'testcliadmin@katipuneros.edu.ph')"
$updated = $cmd2.ExecuteNonQuery()
Write-Output "Marked existing root CLI admin accounts as IsProtected: $updated"

$conn.Close()
