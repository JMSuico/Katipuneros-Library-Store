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

    public CategoryRepository(AppDbContext context) =>
        _context = context;

    public async Task<Category?> GetByIdAsync(Guid id) =>
        await _context.Categories
            .Include(c => c.Books)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<List<Category>> GetAllAsync() =>
        await _context.Categories
            .Include(c => c.Books)
            .OrderBy(c => c.DeweyRange)
            .ToListAsync();

    public async Task AddAsync(Category category) =>
        await _context.Categories.AddAsync(category);

    public Task UpdateAsync(Category category) =>
        Task.FromResult(_context.Categories.Update(category));

    public Task DeleteAsync(Category category) =>
        Task.FromResult(_context.Categories.Remove(category));

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() > 0;
}
