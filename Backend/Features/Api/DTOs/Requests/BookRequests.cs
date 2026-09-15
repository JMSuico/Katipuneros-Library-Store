// [Layer: Features/Api/DTOs/Requests]
// BookRequests.cs -- Request DTOs for book asset acquisition and catalog updates.
// Data shaping and DataAnnotations attributes ONLY.
// DO NOT put business validation logic or database queries here.

using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Api.DTOs.Requests;

public class CreateBookRequest
{
    [Required]
    [MaxLength(250)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Author { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Isbn { get; set; } = string.Empty;

    public string DeweyCode { get; set; } = string.Empty;

    [Required]
    public Guid CategoryId { get; set; }

    public int PublishedYear { get; set; } = DateTime.UtcNow.Year;

    [Range(1, 1000)]
    public int TotalCopies { get; set; } = 1;

    public string BayLocation { get; set; } = "Main Stacks";

    public string? Description { get; set; }

    public string? RfidTag { get; set; }
}

public class UpdateBookRequest
{
    [Required]
    [MaxLength(250)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Author { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Isbn { get; set; } = string.Empty;

    public string DeweyCode { get; set; } = string.Empty;

    [Required]
    public Guid CategoryId { get; set; }

    public int PublishedYear { get; set; }

    [Range(0, 1000)]
    public int TotalCopies { get; set; }

    public string BayLocation { get; set; } = "Main Stacks";

    public string? Description { get; set; }

    public string? RfidTag { get; set; }
}
