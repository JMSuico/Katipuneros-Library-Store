// [Layer: Features/Services/Interfaces]
// IContactService.cs -- Contract for public inquiries and visitor feedback workflows.
// Defines business rules for sanitization, inquiry submission, and ratings capture.
// DO NOT put data access, raw SQL, or HTTP concerns here.

using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;

namespace Backend.Features.Services.Interfaces;

public interface IContactService
{
    Task<(bool Success, string? Error)> SubmitContactMessageAsync(string name, string email, string subject, string message);
    Task<(bool Success, string? Error)> SubmitFeedbackAsync(Guid? patronId, FeedbackRating rating, string? comments);
    Task<List<ContactMessage>> GetInquiriesAsync(InquiryStatus? status = null);
    Task<List<Feedback>> GetFeedbacksAsync();
}
