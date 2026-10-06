// [Layer: Features/Data/Models]
// BorrowTransaction.cs -- Circulation loan transaction record between patron and library asset.
// Contains entity properties and foreign key definitions ONLY.
// DO NOT put business logic, validation rules, or calculation methods here.

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Features.Data.Enums;

namespace Backend.Features.Data.Models;

public class BorrowTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid PatronId { get; set; }

    [ForeignKey(nameof(PatronId))]
    public User? Patron { get; set; }

    [Required]
    public Guid BookId { get; set; }

    [ForeignKey(nameof(BookId))]
    public Book? Book { get; set; }

    public Guid? CashierId { get; set; }

    [ForeignKey(nameof(CashierId))]
    public User? Cashier { get; set; }

    public DateTime BorrowDate { get; set; } = DateTime.UtcNow;

    public DateTime DueDate { get; set; }

    public DateTime? ReturnDate { get; set; }

    public TransactionStatus Status { get; set; } = TransactionStatus.Active;

    public int RenewalCount { get; set; } = 0;

    [MaxLength(500)]
    public string? ConditionNotes { get; set; }

    [MaxLength(50)]
    public string? GatePassCode { get; set; }

    // Navigation properties
    public ICollection<FineTransaction> FineTransactions { get; set; } = new List<FineTransaction>();
}
