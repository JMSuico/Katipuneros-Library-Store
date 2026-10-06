// [Layer: Features/Repositories/Interfaces]
// IContactRepository.cs -- Contract for public inquiries and feedback data access via EF Core.
// Defines queries and persistence methods for contact form messages and ratings.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;

namespace Backend.Features.Repositories.Interfaces;

public interface IContactRepository
{
    Task AddMessageAsync(ContactMessage message);
    Task AddFeedbackAsync(Feedback feedback);
    Task<List<ContactMessage>> GetInquiriesAsync(InquiryStatus? status = null);
    Task<List<Feedback>> GetFeedbacksAsync();
    Task<bool> SaveChangesAsync();
}
