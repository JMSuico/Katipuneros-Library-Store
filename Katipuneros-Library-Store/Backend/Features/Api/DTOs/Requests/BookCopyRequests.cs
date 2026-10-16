// [Layer: Features/Api/DTOs/Requests]
// BookCopyRequests.cs -- Request DTOs for physical book copy management.
// Pure data contracts and DataAnnotations attributes ONLY.
// DO NOT put business validation logic or database queries here.

using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Api.DTOs.Requests;

public class CreateBookCopyRequest
{
    [MaxLength(100)]
    public string? BayLocation { get; set; }

    [MaxLength(50)]
    public string Condition { get; set; } = "Good";

    [MaxLength(500)]
    public string? ConditionNotes { get; set; }
}

public class UpdateBookCopyRequest
{
    [MaxLength(50)]
    public string Status { get; set; } = "Available";

    [MaxLength(50)]
    public string Condition { get; set; } = "Good";

    [MaxLength(500)]
    public string? ConditionNotes { get; set; }

    [MaxLength(100)]
    public string? BayLocation { get; set; }
}
