// [Layer: Features/Repositories/Implementations]
// ContactRepository.cs -- Data access implementation for ContactMessage and Feedback entities via EF Core.
// Queries AppDbContext directly.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Microsoft.EntityFrameworkCore;
using Backend.Features.Data;
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;

namespace Backend.Features.Repositories.Implementations;

public class ContactRepository : IContactRepository
{
    private readonly AppDbContext _context;

    public ContactRepository(AppDbContext context) =>
        _context = context;

    public async Task AddMessageAsync(ContactMessage message) =>
        await _context.ContactMessages.AddAsync(message);

    public async Task AddFeedbackAsync(Feedback feedback) =>
        await _context.Feedbacks.AddAsync(feedback);

    public async Task<List<ContactMessage>> GetInquiriesAsync(InquiryStatus? status = null) =>
        await _context.ContactMessages
            .Where(c => !status.HasValue || c.Status == status.Value)
            .OrderByDescending(c => c.SubmittedAt)
            .ToListAsync();

    public async Task<List<Feedback>> GetFeedbacksAsync() =>
        await _context.Feedbacks
            .Include(f => f.Patron)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() > 0;
}
