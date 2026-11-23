// [Layer: Features/Api/DTOs/Requests]
// PersonnelRequests.cs -- Request DTOs for library personnel CMS creation and updates.
// Extracted from PersonnelController to keep controllers free of inline DTO classes.
// DO NOT place business logic here.

using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Api.DTOs.Requests;

public class CreatePersonnelRequest
{
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
}

public class UpdatePersonnelRequest : CreatePersonnelRequest
{
    public bool IsActive { get; set; } = true;
}
