// [Layer: Features/Repositories/Implementations]
// AuditRepository.cs -- Data access implementation for AuditLogEntry entity via EF Core.
// Queries AppDbContext directly.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Microsoft.EntityFrameworkCore;
using Backend.Features.Data;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;

namespace Backend.Features.Repositories.Implementations;

public class AuditRepository : IAuditRepository
{
    private readonly AppDbContext _context;

    public AuditRepository(AppDbContext context) =>
        _context = context;

    public async Task<AuditLogEntry?> GetLatestLogAsync() =>
        await _context.AuditLogs
            .OrderByDescending(a => a.Timestamp)
            .FirstOrDefaultAsync();

    public async Task<List<AuditLogEntry>> GetAllAsync(string? severity = null, int limit = 100) =>
        await _context.AuditLogs
            .Include(a => a.User)
            .Where(a => string.IsNullOrWhiteSpace(severity) || a.Severity.ToLower() == severity.Trim().ToLower())
            .OrderByDescending(a => a.Timestamp)
            .Take(limit)
            .ToListAsync();

    public async Task AddAsync(AuditLogEntry entry) =>
        await _context.AuditLogs.AddAsync(entry);

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() > 0;
}
