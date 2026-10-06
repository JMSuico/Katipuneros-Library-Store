// [Layer: Features/Repositories/Implementations]
// AuditRepository.cs -- Data access implementation for AuditLogEntry entity via EF Core.
// Queries AppDbContext directly.
// Strictly adheres to AGENTS.md, SKILL.md, and universal expression bodies (=>).

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

    public async Task<List<AuditLogEntry>> GetFilteredLogsAsync(string? searchTerm, string? severity, string? module, string? timeframe, DateTime? startDate, DateTime? endDate, int skip, int take) =>
        await BuildFilteredQuery(searchTerm, severity, module, timeframe, startDate, endDate)
            .Include(a => a.User)
            .OrderByDescending(a => a.Timestamp)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

    public async Task<int> GetFilteredCountAsync(string? searchTerm, string? severity, string? module, string? timeframe, DateTime? startDate, DateTime? endDate) =>
        await BuildFilteredQuery(searchTerm, severity, module, timeframe, startDate, endDate)
            .CountAsync();

    public async Task<int> GetTotalEvents24hCountAsync() =>
        await _context.AuditLogs.CountAsync(l => l.Timestamp >= DateTime.UtcNow.AddHours(-24));

    public async Task<int> GetSecurityAnomaliesCountAsync() =>
        await _context.AuditLogs.CountAsync(l => l.Severity == "Critical");

    public async Task AddAsync(AuditLogEntry entry) =>
        await _context.AuditLogs.AddAsync(entry);

    public async Task DeleteLogsAsync(List<Guid> ids)
    {
        var logsToDelete = await _context.AuditLogs.Where(l => ids.Contains(l.Id)).ToListAsync();
        if (logsToDelete.Any())
        {
            _context.AuditLogs.RemoveRange(logsToDelete);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() > 0;

    private IQueryable<AuditLogEntry> BuildFilteredQuery(string? searchTerm, string? severity, string? module, string? timeframe, DateTime? startDate, DateTime? endDate)
    {
        var query = _context.AuditLogs.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLower();
            query = query.Where(l =>
                l.Action.ToLower().Contains(term) ||
                l.TargetEntity.ToLower().Contains(term) ||
                (l.RecordRef != null && l.RecordRef.ToLower().Contains(term)) ||
                (l.DeltaModification != null && l.DeltaModification.ToLower().Contains(term)) ||
                l.IpAddress.ToLower().Contains(term) ||
                l.CurrentHash.ToLower().Contains(term) ||
                (l.User != null && (
                    l.User.FullName.ToLower().Contains(term) ||
                    l.User.Email.ToLower().Contains(term) ||
                    (l.User.Username != null && l.User.Username.ToLower().Contains(term))
                )));
        }

        if (!string.IsNullOrWhiteSpace(severity) && !severity.Equals("All Severities", StringComparison.OrdinalIgnoreCase) && !severity.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var sev = severity.Trim().ToLower();
            query = query.Where(l => l.Severity.ToLower() == sev);
        }

        if (!string.IsNullOrWhiteSpace(module) && !module.Equals("All Modules", StringComparison.OrdinalIgnoreCase) && !module.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var mod = module.Trim().ToLower();
            query = query.Where(l => l.TargetEntity.ToLower().Contains(mod));
        }

        if (!string.IsNullOrWhiteSpace(timeframe))
        {
            var tf = timeframe.Trim().ToLower();
            if (tf == "today")
            {
                var today = DateTime.UtcNow.Date;
                query = query.Where(l => l.Timestamp >= today);
            }
            else if (tf == "7d")
            {
                var cutoff = DateTime.UtcNow.AddDays(-7);
                query = query.Where(l => l.Timestamp >= cutoff);
            }
            else if (tf == "30d")
            {
                var cutoff = DateTime.UtcNow.AddDays(-30);
                query = query.Where(l => l.Timestamp >= cutoff);
            }
            else if (tf == "custom")
            {
                if (startDate.HasValue)
                    query = query.Where(l => l.Timestamp >= startDate.Value);
                if (endDate.HasValue)
                    query = query.Where(l => l.Timestamp <= endDate.Value);
            }
        }
        else if (startDate.HasValue || endDate.HasValue)
        {
            if (startDate.HasValue)
                query = query.Where(l => l.Timestamp >= startDate.Value);
            if (endDate.HasValue)
                query = query.Where(l => l.Timestamp <= endDate.Value);
        }

        return query;
    }
}
