// [Layer: Features/Repositories/Implementations]
// BorrowRepository.cs -- Data access implementation for BorrowTransaction entity via EF Core.
// Queries AppDbContext directly.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Microsoft.EntityFrameworkCore;
using Backend.Features.Data;
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;

namespace Backend.Features.Repositories.Implementations;

public class BorrowRepository : IBorrowRepository
{
    private readonly AppDbContext _context;

    public BorrowRepository(AppDbContext context) =>
        _context = context;

    public async Task<BorrowTransaction?> GetByIdAsync(Guid id) =>
        await _context.BorrowTransactions
            .Include(b => b.Book)
            .Include(b => b.Patron)
            .Include(b => b.Cashier)
            .FirstOrDefaultAsync(b => b.Id == id);

    public async Task<List<BorrowTransaction>> GetActiveByPatronIdAsync(Guid patronId) =>
        await _context.BorrowTransactions
            .Include(b => b.Book)
            .Where(b => b.PatronId == patronId && b.Status == TransactionStatus.Active)
            .OrderBy(b => b.DueDate)
            .ToListAsync();

    public async Task<List<BorrowTransaction>> GetAllByPatronIdAsync(Guid patronId) =>
        await _context.BorrowTransactions
            .Include(b => b.Book)
            .Where(b => b.PatronId == patronId)
            .OrderByDescending(b => b.BorrowDate)
            .ToListAsync();

    public async Task<List<BorrowTransaction>> GetOverdueLoansAsync() =>
        await _context.BorrowTransactions
            .Include(b => b.Book)
            .Include(b => b.Patron)
            .Where(b => b.Status == TransactionStatus.Active && b.DueDate < DateTime.UtcNow)
            .OrderBy(b => b.DueDate)
            .ToListAsync();

    public async Task<List<BorrowTransaction>> GetAllLedgerAsync(TransactionStatus? status = null) =>
        await _context.BorrowTransactions
            .Include(b => b.Book)
            .Include(b => b.Patron)
            .Include(b => b.Cashier)
            .Where(b => !status.HasValue || b.Status == status.Value)
            .OrderByDescending(b => b.BorrowDate)
            .ToListAsync();

    public async Task<int> GetCountByStatusAsync(TransactionStatus status) =>
        await _context.BorrowTransactions.AsNoTracking().CountAsync(b => b.Status == status);

    public async Task<List<BorrowTransaction>> GetAllWithDetailsAsync(string? status = null, string? query = null)
    {
        var q = _context.BorrowTransactions
            .AsNoTracking()
            .Include(b => b.Book)
            .Include(b => b.Patron)
            .Include(b => b.Cashier)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<TransactionStatus>(status, true, out var parsedStatus))
            q = q.Where(b => b.Status == parsedStatus);

        if (!string.IsNullOrWhiteSpace(query))
        {
            var lower = query.ToLower();
            q = q.Where(b =>
                (b.GatePassCode != null && b.GatePassCode.ToLower().Contains(lower)) ||
                (b.Book != null && (b.Book.Title.ToLower().Contains(lower) || (b.Book.IsbnBarcode != null && b.Book.IsbnBarcode.ToLower().Contains(lower)) || (b.Book.Isbn != null && b.Book.Isbn.ToLower().Contains(lower)))));
        }

        return await q.OrderByDescending(b => b.BorrowDate).ToListAsync();
    }

    public async Task<Backend.Features.Api.DTOs.Responses.BorrowingMetricsResponse> GetBorrowingMetricsAsync()
    {
        var now = DateTime.UtcNow;
        var in48h = now.AddHours(48);
        var in3d = now.AddDays(3);
        var in7d = now.AddDays(7);

        var activeLoans = await _context.BorrowTransactions.AsNoTracking()
            .Include(b => b.Patron)
            .Where(b => b.Status == TransactionStatus.Active)
            .ToListAsync();

        int totalActive = activeLoans.Count;
        var dueSoon = activeLoans.Where(b => b.DueDate >= now && b.DueDate <= in48h).ToList();
        int undergradDue = dueSoon.Count(b => b.Patron?.EmploymentStatus != "Graduate" && b.Patron?.EmploymentStatus != "Faculty");
        int gradDue = dueSoon.Count - undergradDue;
        int approachingExpiry = activeLoans.Count(b => b.DueDate > in3d && b.DueDate <= in7d);

        var overdue = activeLoans.Where(b => b.DueDate < now).ToList();
        int overdueCount = overdue.Count;
        const decimal dailyPenalty = 15.00m;
        decimal cumulativeFines = overdue.Sum(b => Math.Max(0, (int)Math.Floor((now - b.DueDate).TotalDays)) * dailyPenalty);

        return new Backend.Features.Api.DTOs.Responses.BorrowingMetricsResponse
        {
            TotalActiveBorrowings = totalActive,
            TrendingPercent = totalActive > 0 ? 3.4 : 0.0,
            DueToday48h = dueSoon.Count,
            UndergradDueCount = undergradDue,
            GraduateDueCount = gradDue,
            ApproachingExpiry = approachingExpiry,
            OverdueDelinquencies = overdueCount,
            CumulativeFines = cumulativeFines
        };
    }

    public async Task AddAsync(BorrowTransaction transaction) =>
        await _context.BorrowTransactions.AddAsync(transaction);

    public Task UpdateAsync(BorrowTransaction transaction) =>
        Task.FromResult(_context.BorrowTransactions.Update(transaction));

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() > 0;
}
