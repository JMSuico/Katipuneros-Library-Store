// [Layer: Data/Models]
// SystemSetting.cs -- System configuration parameter entity for library governance.
// Database table shape ONLY.
// DO NOT add business logic, methods, or computed properties with rules.

using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Data.Models;

public class SystemSetting
{
    [Key]
    [MaxLength(100)]
    public string Key { get; set; } = string.Empty;

    [Required]
    public string Value { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Category { get; set; } = "General";

    [MaxLength(250)]
    public string Description { get; set; } = string.Empty;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(100)]
    public string UpdatedBy { get; set; } = "System";
}
