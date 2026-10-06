// [Layer: Features/Api/DTOs/Requests]
// PublicRequests.cs -- Request DTOs for public inquiries and visitor feedback.
// Data shaping and DataAnnotations attributes ONLY.
// DO NOT put business validation logic or database queries here.

using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Api.DTOs.Requests;

public class ContactSubmissionRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    [MaxLength(3000)]
    public string Message { get; set; } = string.Empty;
}

public class FeedbackSubmissionRequest
{
    [Required]
    [Range(1, 4, ErrorMessage = "Rating must be between 1 (Poor) and 4 (Excellent).")]
    public int Rating { get; set; }

    [MaxLength(2000)]
    public string? Comments { get; set; }
}
