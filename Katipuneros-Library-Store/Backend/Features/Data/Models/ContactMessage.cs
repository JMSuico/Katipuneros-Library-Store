// [Layer: Features/Data/Models]
// ContactMessage.cs -- Public inquiry messages submitted through the contact form.
// Contains entity properties and foreign key definitions ONLY.
// DO NOT put business logic, validation rules, or calculation methods here.

using System.ComponentModel.DataAnnotations;
using Backend.Features.Data.Enums;

namespace Backend.Features.Data.Models;

public class ContactMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();

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

    public InquiryStatus Status { get; set; } = InquiryStatus.New;

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ResolvedAt { get; set; }
}
