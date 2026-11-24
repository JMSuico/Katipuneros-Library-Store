// [Layer: Features/Data/Models]
// DataProtectionKey.cs -- Persisted ASP.NET Core Data Protection XML key ring entry.
// Contains entity properties ONLY.
// DO NOT put business logic or cryptographic operations here.

using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Data.Models;

public class DataProtectionKey
{
    [Key]
    [MaxLength(200)]
    public string Id { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? FriendlyName { get; set; }

    [Required]
    public string Xml { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
