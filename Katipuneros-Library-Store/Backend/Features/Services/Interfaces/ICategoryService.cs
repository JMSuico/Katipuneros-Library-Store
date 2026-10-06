// [Layer: Features/Services/Interfaces]
// ICategoryService.cs -- Contract for library category taxonomy workflows.
// Defines business rules for category creation, modification, and deletion.
// DO NOT put data access, raw SQL, or HTTP concerns here.

using Backend.Features.Data.Models;

namespace Backend.Features.Services.Interfaces;

public interface ICategoryService
{
    Task<List<Category>> GetAllCategoriesAsync();
    Task<(Category? Category, string? Error)> CreateCategoryAsync(string name, string description);
    Task<(bool Success, string? Error)> UpdateCategoryAsync(Guid id, string name, string description);
    Task<(bool Success, string? Error)> DeleteCategoryAsync(Guid id);
    Task<(int DeletedCount, string? Error)> BulkDeleteCategoriesAsync(List<Guid> categoryIds);
}
