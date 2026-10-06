// [Layer: Features/Data/Models]
// Feedback.cs -- Visitor and patron service ratings and satisfaction comments.
// Contains entity properties and foreign key definitions ONLY.
// DO NOT put business logic, validation rules, or calculation methods here.

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Features.Data.Enums;

namespace Backend.Features.Data.Models;

public class Feedback
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid? PatronId { get; set; }

    [ForeignKey(nameof(PatronId))]
    public User? Patron { get; set; }

    [Required]
    public FeedbackRating Rating { get; set; } = FeedbackRating.Good;

    [MaxLength(2000)]
    public string? Comments { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
