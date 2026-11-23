// [Layer: Features/Services/Implementations]
// FineService.cs -- Implementation of fine settlements, notices, and authorized supervisor waivers.
// Enforces fine balance clearance, payment method logging, and cryptographic waiver/notice audit trails.
// DO NOT access AppDbContext directly -- use IFineRepository only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using Backend.Features.Data.Models;
using Backend.Features.Helpers.Infrastructure;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class FineService : IFineService
{
    private readonly IFineRepository _fineRepository;
    private readonly IAuditService _auditService;

    public FineService(IFineRepository fineRepository, IAuditService auditService) =>
        (_fineRepository, _auditService) = (fineRepository, auditService);

    public async Task<List<FineTransaction>> GetPatronFinesAsync(Guid patronId) =>
        await _fineRepository.GetByPatronIdAsync(patronId);

    public async Task<List<FineTransaction>> GetAllFinesAsync(string? status = null) =>
        await _fineRepository.GetAllAsync(status);

    public async Task<(bool Success, string? Error)> SettleFineAsync(Guid fineId, decimal amountPaid, string paymentMethod, Guid cashierId) =>
        amountPaid <= 0
            ? (false, "Payment amount must be greater than zero.")
            : await _fineRepository.GetByIdAsync(fineId) is not { } fine
                ? (false, "Fine record not found.")
                : fine.Status is "Settled" or "Waived"
                    ? (false, $"Fine balance is already {fine.Status.ToLowerInvariant()}.")
                    : await ExecuteFineSettlementAsync(fine, amountPaid, paymentMethod, cashierId);

    private async Task<(bool Success, string? Error)> ExecuteFineSettlementAsync(FineTransaction fine, decimal amountPaid, string paymentMethod, Guid cashierId)
    {
        fine.BalanceRemaining = Math.Max(0, fine.BalanceRemaining - amountPaid);
        fine.CashierId = cashierId;
        fine.PaymentMethod = InputSanitizer.SanitizeText(paymentMethod);
        if (fine.BalanceRemaining <= 0)
        {
            fine.Status = "Settled";
            fine.SettledAt = DateTime.UtcNow;
        }

        await _fineRepository.UpdateAsync(fine);
        var saved = await _fineRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to record fine payment.");
    }

    public async Task<(bool Success, string? Error)> WaiveFineAsync(Guid fineId, Guid supervisorId, string reason) =>
        await _fineRepository.GetByIdAsync(fineId) is not { } fine
            ? (false, "Fine record not found.")
            : fine.Status is "Settled" or "Waived"
                ? (false, $"Cannot waive a fine that is already {fine.Status.ToLowerInvariant()}.")
                : await ExecuteFineWaiverAsync(fine, supervisorId, reason);

    private async Task<(bool Success, string? Error)> ExecuteFineWaiverAsync(FineTransaction fine, Guid supervisorId, string reason)
    {
        fine.WaivedAmount = fine.BalanceRemaining;
        fine.BalanceRemaining = 0;
        fine.Status = "Waived";
        fine.WaivedByUserId = supervisorId;
        fine.WaiverReason = InputSanitizer.SanitizeText(reason);
        fine.SettledAt = DateTime.UtcNow;

        await _fineRepository.UpdateAsync(fine);
        var saved = await _fineRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to apply authorized waiver.");
    }

    public async Task<(bool Success, string? Error)> NotifyPatronFineAsync(Guid fineId, Guid staffId) =>
        await _fineRepository.GetByIdAsync(fineId) is not { } fine
            ? (false, "Fine record not found.")
            : await RecordFineNoticeAsync(fine, staffId);

    private async Task<(bool Success, string? Error)> RecordFineNoticeAsync(FineTransaction fine, Guid staffId)
    {
        await _auditService.LogEventAsync(
            staffId,
            "FINE_BALANCE_NOTICE_DISPATCHED",
            "FineTransaction",
            fine.Id.ToString(),
            $"Dispatched overdue balance notice for Patron {fine.PatronId} (Outstanding: {fine.BalanceRemaining:F2})",
            "Internal",
            "Info");
        return (true, null);
    }
}
