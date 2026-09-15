// [Layer: Features/Services/Implementations]
// CategoryService.cs -- Implementation of Dewey taxonomy and shelf bay management.
// Enforces taxonomy uniqueness and coordinates with ICategoryRepository.
// DO NOT access AppDbContext directly -- use ICategoryRepository only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using Backend.Features.Data.Models;
using Backend.Features.Helpers.Infrastructure;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;

    public CategoryService(ICategoryRepository categoryRepository) =>
        _categoryRepository = categoryRepository;

    public async Task<List<Category>> GetAllCategoriesAsync() =>
        await _categoryRepository.GetAllAsync();

    public async Task<Category> CreateCategoryAsync(string deweyRange, string name, string bay, string description)
    {
        var category = new Category
        {
            DeweyRange = deweyRange.Trim(),
            Name = InputSanitizer.SanitizeText(name),
            ShelfBayLocation = InputSanitizer.SanitizeText(bay),
            Description = InputSanitizer.SanitizeText(description)
        };

        await _categoryRepository.AddAsync(category);
        await _categoryRepository.SaveChangesAsync();
        return category;
    }

    public async Task<(bool Success, string? Error)> UpdateCategoryAsync(Guid id, string deweyRange, string name, string bay, string description) =>
        await _categoryRepository.GetByIdAsync(id) is not { } category
            ? (false, "Category not found.")
            : await PerformCategoryUpdateAsync(category, deweyRange, name, bay, description);

    private async Task<(bool Success, string? Error)> PerformCategoryUpdateAsync(Category category, string deweyRange, string name, string bay, string description)
    {
        category.DeweyRange = deweyRange.Trim();
        category.Name = InputSanitizer.SanitizeText(name);
        category.ShelfBayLocation = InputSanitizer.SanitizeText(bay);
        category.Description = InputSanitizer.SanitizeText(description);

        await _categoryRepository.UpdateAsync(category);
        var saved = await _categoryRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to update category.");
    }

    public async Task<(bool Success, string? Error)> DeleteCategoryAsync(Guid id) =>
        await _categoryRepository.GetByIdAsync(id) is not { } category
            ? (false, "Category not found.")
            : category.Books.Any()
                ? (false, "Cannot remove classification range while books are actively assigned to it.")
                : await PerformCategoryDeleteAsync(category);

    private async Task<(bool Success, string? Error)> PerformCategoryDeleteAsync(Category category)
    {
        await _categoryRepository.DeleteAsync(category);
        var saved = await _categoryRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to delete category.");
    }
}
