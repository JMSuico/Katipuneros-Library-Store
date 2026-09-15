// [Layer: Features/Data]
// AppDbContext.cs -- Entity Framework Core DbContext for Katipuneros Library Store.
// Configures DbSets, indexes, entity relationships, and precision mapping.
// DO NOT put business logic, validation rules, or workflow orchestration here.

using Microsoft.EntityFrameworkCore;
using Backend.Features.Data.Models;

namespace Backend.Features.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<BorrowTransaction> BorrowTransactions => Set<BorrowTransaction>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<FineTransaction> FineTransactions => Set<FineTransaction>();
    public DbSet<AuditLogEntry> AuditLogs => Set<AuditLogEntry>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<Feedback> Feedbacks => Set<Feedback>();
    public DbSet<Personnel> Personnel => Set<Personnel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User indexes and constraints
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.LibraryCardNumber);
            entity.HasIndex(u => u.Role);
        });

        // Book indexes
        modelBuilder.Entity<Book>(entity =>
        {
            entity.HasIndex(b => b.Isbn);
            entity.HasIndex(b => b.DeweyCode);
            entity.HasIndex(b => b.CategoryId);
            entity.HasIndex(b => b.IsbnBarcode);
            entity.HasIndex(b => b.RfidTag);

            entity.HasOne(b => b.Category)
                  .WithMany(c => c.Books)
                  .HasForeignKey(b => b.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // BorrowTransaction configurations
        modelBuilder.Entity<BorrowTransaction>(entity =>
        {
            entity.HasIndex(bt => bt.PatronId);
            entity.HasIndex(bt => bt.BookId);
            entity.HasIndex(bt => bt.Status);
            entity.HasIndex(bt => bt.DueDate);

            entity.HasOne(bt => bt.Patron)
                  .WithMany(u => u.BorrowTransactions)
                  .HasForeignKey(bt => bt.PatronId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(bt => bt.Book)
                  .WithMany(b => b.BorrowTransactions)
                  .HasForeignKey(bt => bt.BookId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Reservation configurations
        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.HasIndex(r => r.PatronId);
            entity.HasIndex(r => r.BookId);
            entity.HasIndex(r => r.Status);

            entity.HasOne(r => r.Patron)
                  .WithMany(u => u.Reservations)
                  .HasForeignKey(r => r.PatronId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Book)
                  .WithMany(b => b.Reservations)
                  .HasForeignKey(r => r.BookId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // FineTransaction decimal precisions
        modelBuilder.Entity<FineTransaction>(entity =>
        {
            entity.Property(f => f.Amount).HasPrecision(18, 2);
            entity.Property(f => f.BalanceRemaining).HasPrecision(18, 2);
            entity.Property(f => f.WaivedAmount).HasPrecision(18, 2);

            entity.HasIndex(f => f.PatronId);
            entity.HasIndex(f => f.Status);

            entity.HasOne(f => f.Patron)
                  .WithMany(u => u.FineTransactions)
                  .HasForeignKey(f => f.PatronId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(f => f.BorrowTransaction)
                  .WithMany(bt => bt.FineTransactions)
                  .HasForeignKey(f => f.BorrowTransactionId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Category index
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasIndex(c => c.DeweyRange).IsUnique();
        });

        // AuditLog index
        modelBuilder.Entity<AuditLogEntry>(entity =>
        {
            entity.HasIndex(a => a.Timestamp);
            entity.HasIndex(a => a.Severity);
            entity.HasIndex(a => a.Action);
        });
    }
}
