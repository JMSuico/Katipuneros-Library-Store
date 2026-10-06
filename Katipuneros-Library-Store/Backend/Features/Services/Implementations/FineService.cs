// [Layer: Features/Services/Implementations]
// FineService.cs -- Implementation of fine settlements and authorized supervisor waivers.
// Enforces fine balance clearance, payment method logging, and waiver audit trails.
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

    public FineService(IFineRepository fineRepository) =>
        _fineRepository = fineRepository;

    public async Task<List<FineTransaction>> GetPatronFinesAsync(Guid patronId) =>
        await _fineRepository.GetByPatronIdAsync(patronId);

    public async Task<List<FineTransaction>> GetAllFinesAsync(string? status = null) =>
        await _fineRepository.GetAllAsync(status);

    public async Task<(bool Success, string? Error)> SettleFineAsync(Guid fineId, decimal amountPaid, string paymentMethod) =>
        await _fineRepository.GetByIdAsync(fineId) is not { } fine
            ? (false, "Fine record not found.")
            : fine.Status == "Settled"
                ? (false, "Fine balance is already fully settled.")
                : await ExecuteFineSettlementAsync(fine, amountPaid);

    private async Task<(bool Success, string? Error)> ExecuteFineSettlementAsync(FineTransaction fine, decimal amountPaid)
    {
        fine.BalanceRemaining = Math.Max(0, fine.BalanceRemaining - amountPaid);
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
}
