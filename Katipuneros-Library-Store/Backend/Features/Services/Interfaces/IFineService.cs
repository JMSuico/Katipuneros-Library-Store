// [Layer: Features/Services/Interfaces]
// IFineService.cs -- Contract for overdue fine calculations, settlements, and supervisor waivers.
// Defines business rules for daily fine tariffs, waiver reasons, and balance clearances.
// DO NOT put data access, raw SQL, or HTTP concerns here.

using Backend.Features.Data.Models;

namespace Backend.Features.Services.Interfaces;

public interface IFineService
{
    Task<List<FineTransaction>> GetPatronFinesAsync(Guid patronId);
    Task<List<FineTransaction>> GetAllFinesAsync(string? status = null);
    Task<(bool Success, string? Error)> SettleFineAsync(Guid fineId, decimal amountPaid, string paymentMethod);
    Task<(bool Success, string? Error)> WaiveFineAsync(Guid fineId, Guid supervisorId, string reason);
}
