using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddIsProtectedToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT 1 
                    FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[Users]') 
                      AND name = 'IsProtected'
                )
                BEGIN
                    ALTER TABLE [Users] ADD [IsProtected] bit NOT NULL DEFAULT CAST(0 AS bit);
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (
                    SELECT 1 
                    FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[Users]') 
                      AND name = 'IsProtected'
                )
                BEGIN
                    ALTER TABLE [Users] DROP COLUMN [IsProtected];
                END
            ");
        }
    }
}
