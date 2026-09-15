// [Layer: Features/Repositories/Implementations]
// BookRepository.cs -- Data access implementation for Book entity via EF Core.
// Queries AppDbContext directly.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Microsoft.EntityFrameworkCore;
using Backend.Features.Data;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;

namespace Backend.Features.Repositories.Implementations;

public class BookRepository : IBookRepository
{
    private readonly AppDbContext _context;

    public BookRepository(AppDbContext context) =>
        _context = context;

    public async Task<Book?> GetByIdAsync(Guid id) =>
        await _context.Books
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id);

    public async Task<Book?> GetByIsbnAsync(string isbn) =>
        await _context.Books
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Isbn == isbn);

    public async Task<Book?> GetByBarcodeAsync(string barcode) =>
        await _context.Books
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.IsbnBarcode == barcode || b.RfidTag == barcode || b.Isbn == barcode);

    public async Task<List<Book>> GetAllAsync(Guid? categoryId = null, string? searchTerm = null, bool? isSpotlight = null) =>
        await _context.Books
            .Include(b => b.Category)
            .Where(b => !categoryId.HasValue || b.CategoryId == categoryId.Value)
            .Where(b => !isSpotlight.HasValue || b.IsSpotlight == isSpotlight.Value)
            .Where(b => string.IsNullOrWhiteSpace(searchTerm) ||
                        b.Title.ToLower().Contains(searchTerm.Trim().ToLower()) ||
                        b.Author.ToLower().Contains(searchTerm.Trim().ToLower()) ||
                        b.Isbn.Contains(searchTerm.Trim()) ||
                        b.DeweyCode.Contains(searchTerm.Trim()))
            .OrderBy(b => b.Title)
            .ToListAsync();

    public async Task AddAsync(Book book) =>
        await _context.Books.AddAsync(book);

    public Task UpdateAsync(Book book) =>
        Task.FromResult(_context.Books.Update(book));

    public Task DeleteAsync(Book book) =>
        Task.FromResult(_context.Books.Remove(book));

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() > 0;
}
