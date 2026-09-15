// [Layer: Features/Services/Implementations]
// AuditService.cs -- Implementation of cryptographic audit trail recording and verification.
// Enforces tamper-evident SHA-256 hash chaining and coordinates with IAuditRepository.
// DO NOT access AppDbContext directly -- use IAuditRepository only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using Backend.Features.Data.Models;
using Backend.Features.Helpers.Infrastructure;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class AuditService : IAuditService
{
    private readonly IAuditRepository _auditRepository;

    public AuditService(IAuditRepository auditRepository) =>
        _auditRepository = auditRepository;

    public async Task<List<AuditLogEntry>> GetAuditTrailAsync(string? severity = null, int limit = 100) =>
        await _auditRepository.GetAllAsync(severity, limit);

    public async Task<AuditLogEntry> LogEventAsync(Guid? userId, string action, string targetEntity, string? recordRef, string? delta, string ipAddress, string severity = "Info")
    {
        var latest = await _auditRepository.GetLatestLogAsync();
        string previousHash = latest?.CurrentHash ?? AuditHelper.GenesisHash;
        var now = DateTime.UtcNow;

        string currentHash = AuditHelper.ComputeHash(previousHash, action, targetEntity, delta ?? string.Empty, now);

        var entry = new AuditLogEntry
        {
            UserId = userId,
            Action = action.Trim(),
            TargetEntity = targetEntity.Trim(),
            RecordRef = recordRef?.Trim(),
            DeltaModification = delta,
            IpAddress = ipAddress.Trim(),
            Severity = severity.Trim(),
            Timestamp = now,
            PreviousHash = previousHash,
            CurrentHash = currentHash
        };

        await _auditRepository.AddAsync(entry);
        await _auditRepository.SaveChangesAsync();
        return entry;
    }

    public async Task<(bool IsIntact, int VerifiedCount, Guid? BrokenEntryId)> VerifyHashChainAsync() =>
        VerifyOrderedLogs(await _auditRepository.GetAllAsync(null, 1000));

    private (bool IsIntact, int VerifiedCount, Guid? BrokenEntryId) VerifyOrderedLogs(List<AuditLogEntry> logs)
    {
        if (!logs.Any()) return (true, 0, null);

        var ordered = logs.OrderBy(l => l.Timestamp).ToList();
        string expectedPreviousHash = AuditHelper.GenesisHash;

        for (int i = 0; i < ordered.Count; i++)
        {
            var current = ordered[i];
            if (current.PreviousHash != expectedPreviousHash)
                return (false, i, current.Id);

            string recomputed = AuditHelper.ComputeHash(current.PreviousHash, current.Action, current.TargetEntity, current.DeltaModification ?? string.Empty, current.Timestamp);
            if (recomputed != current.CurrentHash)
                return (false, i, current.Id);

            expectedPreviousHash = current.CurrentHash;
        }

        return (true, ordered.Count, null);
    }
}
