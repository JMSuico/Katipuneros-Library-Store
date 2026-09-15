// [Layer: Features/Data/Models]
// FineTransaction.cs -- Overdue penalties, damage assessments, waivers, and settlements.
// Contains entity properties and foreign key definitions ONLY.
// DO NOT put business logic, validation rules, or calculation methods here.

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Features.Data.Models;

public class FineTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid PatronId { get; set; }

    [ForeignKey(nameof(PatronId))]
    public User? Patron { get; set; }

    [Required]
    public Guid BorrowTransactionId { get; set; }

    [ForeignKey(nameof(BorrowTransactionId))]
    public BorrowTransaction? BorrowTransaction { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal BalanceRemaining { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal WaivedAmount { get; set; } = 0;

    [MaxLength(50)]
    public string Status { get; set; } = "Unpaid"; // Unpaid, Settled, InDispute, Waived

    [MaxLength(250)]
    public string Reason { get; set; } = string.Empty;

    public Guid? WaivedByUserId { get; set; }

    [MaxLength(250)]
    public string? WaiverReason { get; set; }

    public DateTime AssessedAt { get; set; } = DateTime.UtcNow;

    public DateTime? SettledAt { get; set; }
}
