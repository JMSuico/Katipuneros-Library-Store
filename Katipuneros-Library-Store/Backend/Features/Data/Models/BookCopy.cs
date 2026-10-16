// [Layer: Features/Data/Models]
// BookCopy.cs -- Physical volume tracking entity for individual library books.
// Contains entity properties and foreign key definitions ONLY.
// DO NOT put business logic, validation rules, or calculation methods here.

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Features.Data.Enums;

namespace Backend.Features.Data.Models;

public class BookCopy
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid BookId { get; set; }

    [ForeignKey(nameof(BookId))]
    public Book? Book { get; set; }

    [Required]
    public int CopyNumber { get; set; }

    [Required]
    [MaxLength(100)]
    public string AccessionNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string QrCodeData { get; set; } = string.Empty;

    public CopyStatus Status { get; set; } = CopyStatus.Available;

    [MaxLength(50)]
    public string Condition { get; set; } = "Good";

    [MaxLength(500)]
    public string? ConditionNotes { get; set; }

    [MaxLength(100)]
    public string? BayLocation { get; set; }

    public DateTime AcquiredDate { get; set; } = DateTime.UtcNow;

    public DateTime? LastReturnedDate { get; set; }

    // Navigation properties
    public ICollection<BorrowTransaction> BorrowTransactions { get; set; } = new List<BorrowTransaction>();
}
