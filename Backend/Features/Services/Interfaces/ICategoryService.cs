// [Layer: Features/Services/Interfaces]
// ICategoryService.cs -- Contract for Dewey classification taxonomy workflows.
// Defines business rules for category creation, modification, and deletion.
// DO NOT put data access, raw SQL, or HTTP concerns here.

using Backend.Features.Data.Models;

namespace Backend.Features.Services.Interfaces;

public interface ICategoryService
{
    Task<List<Category>> GetAllCategoriesAsync();
    Task<Category> CreateCategoryAsync(string deweyRange, string name, string bay, string description);
    Task<(bool Success, string? Error)> UpdateCategoryAsync(Guid id, string deweyRange, string name, string bay, string description);
    Task<(bool Success, string? Error)> DeleteCategoryAsync(Guid id);
}
