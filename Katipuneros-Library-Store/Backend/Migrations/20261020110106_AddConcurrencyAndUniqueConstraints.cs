using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddConcurrencyAndUniqueConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookCopies_Books_BookId",
                table: "BookCopies");

            migrationBuilder.DropIndex(
                name: "IX_Users_LibraryCardNumber",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_Username",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Books_Isbn",
                table: "Books");

            migrationBuilder.AddColumn<Guid>(
                name: "CashierId",
                table: "FineTransactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "FineTransactions",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Books",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_LibraryCardNumber",
                table: "Users",
                column: "LibraryCardNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true,
                filter: "[Username] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_FineTransactions_CashierId",
                table: "FineTransactions",
                column: "CashierId");

            migrationBuilder.CreateIndex(
                name: "IX_Books_Isbn",
                table: "Books",
                column: "Isbn",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BookCopies_Books_BookId",
                table: "BookCopies",
                column: "BookId",
                principalTable: "Books",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FineTransactions_Users_CashierId",
                table: "FineTransactions",
                column: "CashierId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookCopies_Books_BookId",
                table: "BookCopies");

            migrationBuilder.DropForeignKey(
                name: "FK_FineTransactions_Users_CashierId",
                table: "FineTransactions");

            migrationBuilder.DropIndex(
                name: "IX_Users_LibraryCardNumber",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_Username",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_FineTransactions_CashierId",
                table: "FineTransactions");

            migrationBuilder.DropIndex(
                name: "IX_Books_Isbn",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "CashierId",
                table: "FineTransactions");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "FineTransactions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Books");

            migrationBuilder.CreateIndex(
                name: "IX_Users_LibraryCardNumber",
                table: "Users",
                column: "LibraryCardNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username");

            migrationBuilder.CreateIndex(
                name: "IX_Books_Isbn",
                table: "Books",
                column: "Isbn");

            migrationBuilder.AddForeignKey(
                name: "FK_BookCopies_Books_BookId",
                table: "BookCopies",
                column: "BookId",
                principalTable: "Books",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
