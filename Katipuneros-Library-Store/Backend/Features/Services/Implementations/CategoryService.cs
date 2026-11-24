// [Layer: Features/Services/Implementations]
// CategoryService.cs -- Implementation of library category taxonomy management.
// Enforces taxonomy uniqueness and coordinates with ICategoryRepository.
// DO NOT access AppDbContext directly -- use ICategoryRepository only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Backend.Features.Data.Models;
using Backend.Features.Helpers.Infrastructure;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly ILogger<CategoryService>? _logger;

    public CategoryService(ICategoryRepository categoryRepository, ILogger<CategoryService>? logger = null) =>
        (_categoryRepository, _logger) = (categoryRepository, logger);

    public async Task<List<Category>> GetAllCategoriesAsync() =>
        await _categoryRepository.GetAllAsync();

    // Unique, ascending, server-generated category code (e.g. CAT-0001). Persisted in the
    // existing uniquely-indexed code column, so ordering by it yields ascending creation order.
    public const string CodePrefix = "CAT-";

    public static string FormatCode(int sequence) => $"{CodePrefix}{sequence:D4}";

    private static int ParseSequence(string? code) =>
        code != null && code.StartsWith(CodePrefix, StringComparison.OrdinalIgnoreCase) &&
        int.TryParse(code[CodePrefix.Length..], out var n) ? n : 0;

    public async Task<(Category? Category, string? Error)> CreateCategoryAsync(string name, string description)
    {
        var cleanName = InputSanitizer.SanitizeText(name).Trim();
        var existing = await _categoryRepository.GetAllAsync();

        if (existing.Any(c => string.Equals(c.Name.Trim(), cleanName, StringComparison.OrdinalIgnoreCase)))
            return (null, $"A category named \"{cleanName}\" already exists.");

        var nextSequence = existing.Select(c => ParseSequence(c.DeweyRange)).DefaultIfEmpty(0).Max() + 1;

        var category = new Category
        {
            DeweyRange = FormatCode(nextSequence),
            Name = cleanName,
            ShelfBayLocation = string.Empty,
            Description = InputSanitizer.SanitizeText(description ?? string.Empty)
        };

        await _categoryRepository.AddAsync(category);
        var saved = await _categoryRepository.SaveChangesAsync();
        return saved ? (category, null) : (null, "Failed to create category.");
    }

    public async Task<(bool Success, string? Error)> UpdateCategoryAsync(Guid id, string name, string description)
    {
        if (await _categoryRepository.GetByIdAsync(id) is not { } category)
            return (false, "Category not found.");

        var cleanName = InputSanitizer.SanitizeText(name).Trim();
        var existing = await _categoryRepository.GetAllAsync();
        if (existing.Any(c => c.Id != id && string.Equals(c.Name.Trim(), cleanName, StringComparison.OrdinalIgnoreCase)))
            return (false, $"A category named \"{cleanName}\" already exists.");

        return await PerformCategoryUpdateAsync(category, cleanName, description);
    }

    private async Task<(bool Success, string? Error)> PerformCategoryUpdateAsync(Category category, string name, string description)
    {
        // The category code (unique ascending ID) is immutable once assigned.
        category.Name = name;
        category.Description = InputSanitizer.SanitizeText(description ?? string.Empty);

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
        try
        {
            await _categoryRepository.DeleteAsync(category);
            var saved = await _categoryRepository.SaveChangesAsync();
            return (saved, saved ? null : "Failed to delete category.");
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger?.LogWarning(ex, "Concurrency conflict deleting category {CategoryId}", category.Id);
            return (false, "Record was modified by another operation. Please refresh and retry.");
        }
        catch (DbUpdateException ex)
        {
            _logger?.LogWarning(ex, "Database constraint prevented deleting category {CategoryId}", category.Id);
            return (false, "Cannot remove classification category: books are actively assigned to it.");
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Unexpected error deleting category {CategoryId}", category.Id);
            return (false, "An unexpected error occurred while removing the classification category.");
        }
    }

    public async Task<(int DeletedCount, string? Error)> BulkDeleteCategoriesAsync(List<Guid> categoryIds)
    {
        if (categoryIds == null || categoryIds.Count == 0) return (0, "No category IDs provided for deletion.");
        var toDelete = new List<Category>();
        var seenIds = new HashSet<Guid>();
        foreach (var id in categoryIds)
        {
            if (!seenIds.Add(id)) continue;
            if (await _categoryRepository.GetByIdAsync(id) is { } category)
            {
                if (category.Books.Any())
                {
                    return (0, $"Cannot remove category \"{category.Name}\": catalog titles are actively assigned to it.");
                }
                toDelete.Add(category);
            }
        }
        if (toDelete.Count == 0) return (0, "No eligible categories found to remove.");
        try
        {
            await _categoryRepository.DeleteRangeAsync(toDelete);
            await _categoryRepository.SaveChangesAsync();
            return (toDelete.Count, null);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger?.LogWarning(ex, "Concurrency conflict during bulk category deletion");
            return (0, "Record was modified by another operation. Please refresh and retry.");
        }
        catch (DbUpdateException ex)
        {
            _logger?.LogWarning(ex, "Database constraint prevented bulk category deletion");
            return (0, "Cannot remove one or more selected categories: catalog titles are actively assigned to them.");
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Unexpected error during bulk category deletion");
            return (0, "An unexpected error occurred during bulk category removal.");
        }
    }
}
