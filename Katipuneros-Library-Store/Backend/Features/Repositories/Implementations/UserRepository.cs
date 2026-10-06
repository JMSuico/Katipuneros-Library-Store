// [Layer: Features/Repositories/Implementations]
// UserRepository.cs -- Data access implementation for User entity via EF Core.
// Queries AppDbContext directly.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Microsoft.EntityFrameworkCore;
using Backend.Features.Data;
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;

namespace Backend.Features.Repositories.Implementations;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context) =>
        _context = context;

    public async Task<User?> GetByIdAsync(Guid id) =>
        await _context.Users.FindAsync(id);

    public async Task<User?> GetByEmailAsync(string email) =>
        await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

    public async Task<User?> GetByUsernameAsync(string username) =>
        await _context.Users.FirstOrDefaultAsync(u => u.Username != null && u.Username.ToLower() == username.ToLower());

    public async Task<User?> GetByIdentifierAsync(string identifier) =>
        await _context.Users.FirstOrDefaultAsync(u => 
            u.Email.ToLower() == identifier.ToLower() || 
            (u.Username != null && u.Username.ToLower() == identifier.ToLower()) ||
            u.LibraryCardNumber == identifier);

    public async Task<User?> GetByCardNumberAsync(string cardNumber) =>
        await _context.Users.FirstOrDefaultAsync(u => u.LibraryCardNumber == cardNumber);

    public async Task<List<User>> GetAllAsync(UserRole? role = null, bool? isActive = null) =>
        await _context.Users
            .Where(u => !role.HasValue || u.Role == role.Value)
            .Where(u => !isActive.HasValue || u.IsActive == isActive.Value)
            .OrderBy(u => u.FullName)
            .ToListAsync();

    public async Task AddAsync(User user) =>
        await _context.Users.AddAsync(user);

    public Task UpdateAsync(User user) =>
        Task.FromResult(_context.Users.Update(user));

    public async Task DeleteAsync(User user)
    {
        var existing = await _context.Users
            .Include(u => u.BorrowTransactions)
            .Include(u => u.Reservations)
            .Include(u => u.FineTransactions)
            .FirstOrDefaultAsync(u => u.Id == user.Id);

        if (existing != null)
        {
            // Nullify audit logs and cashier/waived references
            var auditLogs = await _context.AuditLogs.Where(a => a.UserId == user.Id).ToListAsync();
            foreach (var a in auditLogs) a.UserId = null;

            var cashierLoans = await _context.BorrowTransactions.Where(b => b.CashierId == user.Id).ToListAsync();
            foreach (var b in cashierLoans) b.CashierId = null;

            var waivedFines = await _context.FineTransactions.Where(f => f.WaivedByUserId == user.Id).ToListAsync();
            foreach (var f in waivedFines) f.WaivedByUserId = null;

            var feedbacks = await _context.Feedbacks.Where(f => f.PatronId == user.Id).ToListAsync();
            if (feedbacks.Any()) _context.Feedbacks.RemoveRange(feedbacks);

            if (existing.FineTransactions.Any()) _context.FineTransactions.RemoveRange(existing.FineTransactions);
            if (existing.Reservations.Any()) _context.Reservations.RemoveRange(existing.Reservations);

            if (existing.BorrowTransactions.Any())
            {
                var loanIds = existing.BorrowTransactions.Select(l => l.Id).ToList();
                var childFines = await _context.FineTransactions.Where(f => loanIds.Contains(f.BorrowTransactionId)).ToListAsync();
                if (childFines.Any()) _context.FineTransactions.RemoveRange(childFines);
                _context.BorrowTransactions.RemoveRange(existing.BorrowTransactions);
            }

            _context.Users.Remove(existing);
        }
    }

    public async Task DeleteRangeAsync(IEnumerable<User> users)
    {
        var ids = users.Select(u => u.Id).ToList();
        var existingUsers = await _context.Users
            .Include(u => u.BorrowTransactions)
            .Include(u => u.Reservations)
            .Include(u => u.FineTransactions)
            .Where(u => ids.Contains(u.Id))
            .ToListAsync();

        var auditLogs = await _context.AuditLogs.Where(a => a.UserId.HasValue && ids.Contains(a.UserId.Value)).ToListAsync();
        foreach (var a in auditLogs) a.UserId = null;

        var cashierLoans = await _context.BorrowTransactions.Where(b => b.CashierId.HasValue && ids.Contains(b.CashierId.Value)).ToListAsync();
        foreach (var b in cashierLoans) b.CashierId = null;

        var waivedFines = await _context.FineTransactions.Where(f => f.WaivedByUserId.HasValue && ids.Contains(f.WaivedByUserId.Value)).ToListAsync();
        foreach (var f in waivedFines) f.WaivedByUserId = null;

        var feedbacks = await _context.Feedbacks.Where(f => f.PatronId.HasValue && ids.Contains(f.PatronId.Value)).ToListAsync();
        if (feedbacks.Any()) _context.Feedbacks.RemoveRange(feedbacks);

        foreach (var u in existingUsers)
        {
            if (u.FineTransactions.Any()) _context.FineTransactions.RemoveRange(u.FineTransactions);
            if (u.Reservations.Any()) _context.Reservations.RemoveRange(u.Reservations);

            if (u.BorrowTransactions.Any())
            {
                var loanIds = u.BorrowTransactions.Select(l => l.Id).ToList();
                var childFines = await _context.FineTransactions.Where(f => loanIds.Contains(f.BorrowTransactionId)).ToListAsync();
                if (childFines.Any()) _context.FineTransactions.RemoveRange(childFines);
                _context.BorrowTransactions.RemoveRange(u.BorrowTransactions);
            }

            _context.Users.Remove(u);
        }
    }

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() > 0;

    public async Task<bool> CanConnectAsync() =>
        await _context.Database.CanConnectAsync();
}
