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

    public async Task AddAsync(BorrowTransaction transaction) =>
        await _context.BorrowTransactions.AddAsync(transaction);

    public Task UpdateAsync(BorrowTransaction transaction) =>
        Task.FromResult(_context.BorrowTransactions.Update(transaction));

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() > 0;
}
