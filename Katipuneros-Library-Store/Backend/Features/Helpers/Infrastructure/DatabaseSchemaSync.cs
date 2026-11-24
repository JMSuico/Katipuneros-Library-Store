// [Layer: Features/Helpers/Infrastructure]
// DatabaseSchemaSync.cs -- Idempotent PostgreSQL schema reconciliation for pre-existing Supabase databases.
// Runs EnsureCreated and reconciles missing tables, columns, indexes, and foreign keys cleanly.
// DO NOT put domain business logic here.

using Backend.Features.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Backend.Features.Helpers.Infrastructure;

public static class DatabaseSchemaSync
{
    /// <summary>
    /// Ensures all required tables, columns, unique indexes, and foreign key constraints
    /// exist on a PostgreSQL database (safe to run repeatedly on pre-existing Supabase instances).
    /// </summary>
    public static async Task EnsurePostgresSchemaAsync(AppDbContext db, ILogger logger)
    {
        ArgumentNullException.ThrowIfNull(db);
        ArgumentNullException.ThrowIfNull(logger);

        try
        {
            await db.Database.EnsureCreatedAsync();

            const string sql = @"
-- 1. Missing tables (for databases initialized before newer models were added)
CREATE TABLE IF NOT EXISTS ""Personnel"" (
    ""Id"" uuid NOT NULL,
    ""FullName"" character varying(150) NOT NULL,
    ""Position"" character varying(100) NOT NULL,
    ""Department"" character varying(100) NOT NULL DEFAULT '',
    ""ImageUrl"" character varying(500) NULL,
    ""DisplayOrder"" integer NOT NULL DEFAULT 1,
    ""IsActive"" boolean NOT NULL DEFAULT TRUE,
    ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT ""PK_Personnel"" PRIMARY KEY (""Id"")
);

CREATE TABLE IF NOT EXISTS ""CidrSubnets"" (
    ""Id"" uuid NOT NULL,
    ""CidrRange"" character varying(50) NOT NULL,
    ""NetworkClassification"" character varying(100) NOT NULL,
    ""AccessLevel"" character varying(50) NOT NULL DEFAULT 'Staff',
    ""IsActive"" boolean NOT NULL DEFAULT TRUE,
    ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT NOW(),
    ""CreatedBy"" character varying(100) NOT NULL DEFAULT 'SuperAdmin',
    CONSTRAINT ""PK_CidrSubnets"" PRIMARY KEY (""Id"")
);

CREATE TABLE IF NOT EXISTS ""SystemSettings"" (
    ""Key"" character varying(100) NOT NULL,
    ""Value"" text NOT NULL,
    ""Category"" character varying(50) NOT NULL DEFAULT 'General',
    ""Description"" character varying(250) NOT NULL DEFAULT '',
    ""UpdatedAt"" timestamp with time zone NOT NULL DEFAULT NOW(),
    ""UpdatedBy"" character varying(100) NOT NULL DEFAULT 'System',
    CONSTRAINT ""PK_SystemSettings"" PRIMARY KEY (""Key"")
);

CREATE TABLE IF NOT EXISTS ""BookCopies"" (
    ""Id"" uuid NOT NULL,
    ""BookId"" uuid NOT NULL,
    ""CopyNumber"" integer NOT NULL,
    ""AccessionNumber"" character varying(100) NOT NULL,
    ""QrCodeData"" character varying(255) NOT NULL,
    ""Status"" integer NOT NULL DEFAULT 0,
    ""Condition"" character varying(50) NOT NULL DEFAULT 'Good',
    ""ConditionNotes"" character varying(500) NULL,
    ""BayLocation"" character varying(100) NULL,
    ""AcquiredDate"" timestamp with time zone NOT NULL DEFAULT NOW(),
    ""LastReturnedDate"" timestamp with time zone NULL,
    CONSTRAINT ""PK_BookCopies"" PRIMARY KEY (""Id"")
);

CREATE TABLE IF NOT EXISTS ""DataProtectionKeys"" (
    ""Id"" character varying(200) NOT NULL,
    ""FriendlyName"" character varying(255) NULL,
    ""Xml"" text NOT NULL,
    ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT ""PK_DataProtectionKeys"" PRIMARY KEY (""Id"")
);

-- 2. Missing / widened columns on pre-existing tables
ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""FirstName"" character varying(100) NULL;
ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""MiddleName"" character varying(100) NULL;
ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""LastName"" character varying(100) NULL;
ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""Username"" character varying(100) NULL;
ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""EmploymentStatus"" character varying(100) NULL;
ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""CurrentAddress"" character varying(300) NULL;
ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""PermanentAddress"" character varying(300) NULL;
ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""ProfilePictureUrl"" text NULL;
ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""Age"" character varying(10) NULL;
ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""IsProtected"" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE ""Books"" ADD COLUMN IF NOT EXISTS ""RowVersion"" bytea NULL;
ALTER TABLE ""Books"" ADD COLUMN IF NOT EXISTS ""CoverImage"" text NULL;
ALTER TABLE ""Books"" ALTER COLUMN ""CoverImage"" TYPE text;

ALTER TABLE ""BorrowTransactions"" ADD COLUMN IF NOT EXISTS ""BookCopyId"" uuid NULL;

ALTER TABLE ""FineTransactions"" ADD COLUMN IF NOT EXISTS ""CashierId"" uuid NULL;
ALTER TABLE ""FineTransactions"" ADD COLUMN IF NOT EXISTS ""PaymentMethod"" character varying(50) NULL;

-- 3. Unique & supporting indexes
CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Users_Email"" ON ""Users"" (""Email"");
CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Users_LibraryCardNumber"" ON ""Users"" (""LibraryCardNumber"");
CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Users_Username"" ON ""Users"" (""Username"");
CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Books_Isbn"" ON ""Books"" (""Isbn"");
CREATE UNIQUE INDEX IF NOT EXISTS ""IX_BookCopies_AccessionNumber"" ON ""BookCopies"" (""AccessionNumber"");

CREATE INDEX IF NOT EXISTS ""IX_BookCopies_BookId"" ON ""BookCopies"" (""BookId"");
CREATE INDEX IF NOT EXISTS ""IX_BookCopies_QrCodeData"" ON ""BookCopies"" (""QrCodeData"");
CREATE INDEX IF NOT EXISTS ""IX_BookCopies_Status"" ON ""BookCopies"" (""Status"");
CREATE INDEX IF NOT EXISTS ""IX_BorrowTransactions_BookCopyId"" ON ""BorrowTransactions"" (""BookCopyId"");
CREATE INDEX IF NOT EXISTS ""IX_FineTransactions_CashierId"" ON ""FineTransactions"" (""CashierId"");

-- 4. Foreign key constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_BookCopies_Books_BookId') THEN
        ALTER TABLE ""BookCopies""
            ADD CONSTRAINT ""FK_BookCopies_Books_BookId""
            FOREIGN KEY (""BookId"") REFERENCES ""Books"" (""Id"") ON DELETE RESTRICT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_BorrowTransactions_BookCopies_BookCopyId') THEN
        ALTER TABLE ""BorrowTransactions""
            ADD CONSTRAINT ""FK_BorrowTransactions_BookCopies_BookCopyId""
            FOREIGN KEY (""BookCopyId"") REFERENCES ""BookCopies"" (""Id"") ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_FineTransactions_Users_CashierId') THEN
        ALTER TABLE ""FineTransactions""
            ADD CONSTRAINT ""FK_FineTransactions_Users_CashierId""
            FOREIGN KEY (""CashierId"") REFERENCES ""Users"" (""Id"") ON DELETE RESTRICT;
    END IF;
END $$;
";

            await db.Database.ExecuteSqlRawAsync(sql);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "PostgreSQL schema synchronization failed in DatabaseSchemaSync.EnsurePostgresSchemaAsync.");
            throw;
        }
    }
}
