// [Layer: Features/Services/Interfaces]
// IAuditService.cs -- Contract for cryptographic audit log recording and verification.
// Defines business rules for event auditing and SHA-256 hash chain verification.
// DO NOT put data access, raw SQL, or HTTP concerns here.

using Backend.Features.Data.Models;

namespace Backend.Features.Services.Interfaces;

public interface IAuditService
{
    Task<AuditLogEntry> LogEventAsync(Guid? userId, string action, string targetEntity, string? recordRef, string? delta, string ipAddress, string severity = "Info");
    Task<List<AuditLogEntry>> GetAuditTrailAsync(string? severity = null, int limit = 100);
    Task<(bool IsIntact, int VerifiedCount, Guid? BrokenEntryId)> VerifyHashChainAsync();
}
