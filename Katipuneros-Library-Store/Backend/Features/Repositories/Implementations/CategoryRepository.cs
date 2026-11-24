// [Layer: Features/Repositories/Implementations]
// CategoryRepository.cs -- Data access implementation for Category entity via EF Core.
// Queries AppDbContext directly.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Microsoft.EntityFrameworkCore;
using Backend.Features.Data;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;

namespace Backend.Features.Repositories.Implementations;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;
    private readonly AppDbContext _readOnlyContext;

    public CategoryRepository(AppDbContext context, ReadOnlyAppDbContext? readOnlyContext = null)
    {
        _context = context;
        _readOnlyContext = (AppDbContext?)readOnlyContext ?? context;
    }

    public async Task<Category?> GetByIdAsync(Guid id) =>
        await _context.Categories
            .Include(c => c.Books)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<List<Category>> GetAllAsync() =>
        await _readOnlyContext.Categories
            .Include(c => c.Books)
            .OrderBy(c => c.DeweyRange)
            .ToListAsync();

    public async Task AddAsync(Category category) =>
        await _context.Categories.AddAsync(category);

    public Task UpdateAsync(Category category)
    {
        if (_context.Entry(category).State == EntityState.Detached)
            _context.Categories.Update(category);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Category category)
    {
        var target = ResolveTrackedForDelete(category);
        _context.Categories.Remove(target);
        return Task.CompletedTask;
    }

    public Task DeleteRangeAsync(IEnumerable<Category> categories)
    {
        var targets = categories.Select(ResolveTrackedForDelete).ToList();
        _context.Categories.RemoveRange(targets);
        return Task.CompletedTask;
    }

    private Category ResolveTrackedForDelete(Category category) =>
        _context.Entry(category).State == EntityState.Detached
            ? _context.Categories.Local.FirstOrDefault(c => c.Id == category.Id) ?? category
            : category;

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() > 0;
}
