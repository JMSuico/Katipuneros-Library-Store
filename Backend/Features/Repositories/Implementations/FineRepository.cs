// [Layer: Features/Repositories/Implementations]
// FineRepository.cs -- Data access implementation for FineTransaction entity via EF Core.
// Queries AppDbContext directly.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Microsoft.EntityFrameworkCore;
using Backend.Features.Data;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;

namespace Backend.Features.Repositories.Implementations;

public class FineRepository : IFineRepository
{
    private readonly AppDbContext _context;

    public FineRepository(AppDbContext context) =>
        _context = context;

    public async Task<FineTransaction?> GetByIdAsync(Guid id) =>
        await _context.FineTransactions
            .Include(f => f.Patron)
            .Include(f => f.BorrowTransaction)
            .FirstOrDefaultAsync(f => f.Id == id);

    public async Task<List<FineTransaction>> GetByPatronIdAsync(Guid patronId) =>
        await _context.FineTransactions
            .Include(f => f.BorrowTransaction)
            .Where(f => f.PatronId == patronId)
            .OrderByDescending(f => f.AssessedAt)
            .ToListAsync();

    public async Task<List<FineTransaction>> GetAllAsync(string? status = null) =>
        await _context.FineTransactions
            .Include(f => f.Patron)
            .Include(f => f.BorrowTransaction)
            .Where(f => string.IsNullOrWhiteSpace(status) || f.Status.ToLower() == status.Trim().ToLower())
            .OrderByDescending(f => f.AssessedAt)
            .ToListAsync();

    public async Task AddAsync(FineTransaction fine) =>
        await _context.FineTransactions.AddAsync(fine);

    public Task UpdateAsync(FineTransaction fine) =>
        Task.FromResult(_context.FineTransactions.Update(fine));

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() > 0;
}
