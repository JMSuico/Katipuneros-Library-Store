// [Layer: Features/Data/Models]
// AuditLogEntry.cs -- Tamper-evident cryptographic hash-chained security event record.
// Contains entity properties and foreign key definitions ONLY.
// DO NOT put business logic, validation rules, or calculation methods here.

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Features.Data.Models;

public class AuditLogEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid? UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string TargetEntity { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? RecordRef { get; set; }

    [MaxLength(2000)]
    public string? DeltaModification { get; set; }

    [MaxLength(50)]
    public string IpAddress { get; set; } = string.Empty;

    [MaxLength(30)]
    public string Severity { get; set; } = "Info"; // Info, Warning, Critical

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(128)]
    public string PreviousHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(128)]
    public string CurrentHash { get; set; } = string.Empty;
}
