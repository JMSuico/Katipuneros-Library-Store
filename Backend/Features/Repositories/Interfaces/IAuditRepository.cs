// [Layer: Features/Repositories/Interfaces]
// IAuditRepository.cs -- Contract for cryptographic audit log data access via EF Core.
// Defines queries for append-only audit trail and latest hash link retrieval.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Backend.Features.Data.Models;

namespace Backend.Features.Repositories.Interfaces;

public interface IAuditRepository
{
    Task<AuditLogEntry?> GetLatestLogAsync();
    Task<List<AuditLogEntry>> GetAllAsync(string? severity = null, int limit = 100);
    Task AddAsync(AuditLogEntry entry);
    Task<bool> SaveChangesAsync();
}
