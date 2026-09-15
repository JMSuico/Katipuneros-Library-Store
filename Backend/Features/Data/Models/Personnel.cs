// [Layer: Features/Data/Models]
// Personnel.cs -- Entity representation of library staff CMS profile.
// Contains entity properties and data shape ONLY.
// DO NOT put business logic, validation rules, or calculation methods here.

using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Data.Models;

public class Personnel
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Position { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Department { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public int DisplayOrder { get; set; } = 1;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
