// [Layer: Data/Models]
// CidrSubnet.cs -- Campus CIDR whitelisted subnet range entity.
// Database table shape ONLY.
// DO NOT add business logic, methods, or computed properties with rules.

using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Data.Models;

public class CidrSubnet
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(50)]
    public string CidrRange { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string NetworkClassification { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string AccessLevel { get; set; } = "Staff";

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(100)]
    public string CreatedBy { get; set; } = "SuperAdmin";
}
