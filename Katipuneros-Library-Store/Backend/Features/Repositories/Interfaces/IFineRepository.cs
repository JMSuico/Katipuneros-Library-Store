// [Layer: Features/Repositories/Interfaces]
// IFineRepository.cs -- Contract for fine assessments and settlements data access via EF Core.
// Defines queries for unpaid penalties, payment journals, and waivers.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Backend.Features.Data.Models;

namespace Backend.Features.Repositories.Interfaces;

public interface IFineRepository
{
    Task<FineTransaction?> GetByIdAsync(Guid id);
    Task<List<FineTransaction>> GetByPatronIdAsync(Guid patronId);
    Task<List<FineTransaction>> GetAllAsync(string? status = null);
    Task AddAsync(FineTransaction fine);
    Task UpdateAsync(FineTransaction fine);
    Task<bool> SaveChangesAsync();
}
