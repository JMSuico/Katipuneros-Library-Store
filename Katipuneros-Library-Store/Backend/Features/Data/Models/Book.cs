// [Layer: Features/Data/Models]
// Book.cs -- Bibliographic catalog asset and physical volume tracking entity.
// Contains entity properties and foreign key definitions ONLY.
// DO NOT put business logic, validation rules, or calculation methods here.

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Features.Data.Models;

public class Book
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(250)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Author { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Isbn { get; set; } = string.Empty;

    [MaxLength(50)]
    public string DeweyCode { get; set; } = string.Empty;

    [Required]
    public Guid CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))]
    public Category? Category { get; set; }

    public int PublishedYear { get; set; }

    public int TotalCopies { get; set; } = 1;

    public int AvailableCopies { get; set; } = 1;

    [MaxLength(50)]
    public string BayLocation { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? RfidTag { get; set; }

    [MaxLength(100)]
    public string? IsbnBarcode { get; set; }

    [MaxLength(500)]
    public string? CoverImage { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    public bool IsSpotlight { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<BorrowTransaction> BorrowTransactions { get; set; } = new List<BorrowTransaction>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
