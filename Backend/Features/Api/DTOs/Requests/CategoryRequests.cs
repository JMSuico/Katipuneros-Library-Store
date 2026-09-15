// [Layer: Features/Api/DTOs/Requests]
// CategoryRequests.cs -- Request DTOs for Dewey taxonomy category creation and editing.
// Data shaping and DataAnnotations attributes ONLY.
// DO NOT put business validation logic or database queries here.

using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Api.DTOs.Requests;

public class CreateCategoryRequest
{
    [Required]
    [MaxLength(50)]
    public string DeweyRange { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string ShelfBayLocation { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
}

public class UpdateCategoryRequest
{
    [Required]
    [MaxLength(50)]
    public string DeweyRange { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string ShelfBayLocation { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
}
