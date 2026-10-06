// [Layer: Features/Repositories/Interfaces]
// ICategoryRepository.cs -- Contract for Dewey classification data access via EF Core.
// Defines queries for categories and shelf bay locations.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Backend.Features.Data.Models;

namespace Backend.Features.Repositories.Interfaces;

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(Guid id);
    Task<List<Category>> GetAllAsync();
    Task AddAsync(Category category);
    Task UpdateAsync(Category category);
    Task DeleteAsync(Category category);
    Task<bool> SaveChangesAsync();
}
