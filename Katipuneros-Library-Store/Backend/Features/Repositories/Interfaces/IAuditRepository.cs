// [Layer: Features/Repositories/Interfaces]
// IAuditRepository.cs -- Contract for cryptographic audit log data access via EF Core.
// Defines queries for append-only audit trail and latest hash link retrieval.
// Strictly adheres to AGENTS.md, SKILL.md, and universal expression bodies (=>).

using Backend.Features.Data.Models;

namespace Backend.Features.Repositories.Interfaces;

public interface IAuditRepository
{
    Task<AuditLogEntry?> GetLatestLogAsync();
    Task<List<AuditLogEntry>> GetAllAsync(string? severity = null, int limit = 100);
    Task<List<AuditLogEntry>> GetFilteredLogsAsync(string? searchTerm, string? severity, string? module, string? timeframe, DateTime? startDate, DateTime? endDate, int skip, int take);
    Task<int> GetFilteredCountAsync(string? searchTerm, string? severity, string? module, string? timeframe, DateTime? startDate, DateTime? endDate);
    Task<int> GetTotalEvents24hCountAsync();
    Task<int> GetSecurityAnomaliesCountAsync();
    Task AddAsync(AuditLogEntry entry);
    Task DeleteLogsAsync(List<Guid> ids);
    Task<bool> SaveChangesAsync();
}
