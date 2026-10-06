// [Layer: Features/Services/Implementations]
// ContactService.cs -- Implementation of public inquiry and feedback submission workflows.
// Enforces XSS sanitization via InputSanitizer and coordinates with IContactRepository.
// DO NOT access AppDbContext directly -- use IContactRepository only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Helpers.Infrastructure;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class ContactService : IContactService
{
    private readonly IContactRepository _contactRepository;

    public ContactService(IContactRepository contactRepository) =>
        _contactRepository = contactRepository;

    public async Task<List<ContactMessage>> GetInquiriesAsync(InquiryStatus? status = null) =>
        await _contactRepository.GetInquiriesAsync(status);

    public async Task<List<Feedback>> GetFeedbacksAsync() =>
        await _contactRepository.GetFeedbacksAsync();

    public async Task<(bool Success, string? Error)> SubmitContactMessageAsync(string name, string email, string subject, string message) =>
        await ValidateAndSaveMessageAsync(
            InputSanitizer.SanitizeText(name),
            InputSanitizer.SanitizeEmail(email),
            InputSanitizer.SanitizeText(subject),
            InputSanitizer.SanitizeText(message)
        );

    private async Task<(bool Success, string? Error)> ValidateAndSaveMessageAsync(string cleanName, string cleanEmail, string cleanSubject, string cleanMsg)
    {
        if (string.IsNullOrWhiteSpace(cleanEmail) || !cleanEmail.Contains('@'))
            return (false, "Please provide a valid email address.");

        if (string.IsNullOrWhiteSpace(cleanMsg))
            return (false, "Inquiry message body cannot be empty.");

        var msg = new ContactMessage
        {
            Name = cleanName,
            Email = cleanEmail,
            Subject = cleanSubject,
            Message = cleanMsg,
            Status = InquiryStatus.New,
            SubmittedAt = DateTime.UtcNow
        };

        await _contactRepository.AddMessageAsync(msg);
        var saved = await _contactRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to record contact inquiry.");
    }

    public async Task<(bool Success, string? Error)> SubmitFeedbackAsync(Guid? patronId, FeedbackRating rating, string? comments) =>
        await SaveFeedbackEntityAsync(new Feedback
        {
            PatronId = patronId,
            Rating = rating,
            Comments = comments != null ? InputSanitizer.SanitizeText(comments) : null,
            CreatedAt = DateTime.UtcNow
        });

    private async Task<(bool Success, string? Error)> SaveFeedbackEntityAsync(Feedback feedback)
    {
        await _contactRepository.AddFeedbackAsync(feedback);
        var saved = await _contactRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to record feedback.");
    }
}
