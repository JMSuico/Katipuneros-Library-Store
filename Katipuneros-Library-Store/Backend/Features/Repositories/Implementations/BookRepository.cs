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
    private readonly AppDbContext _readOnlyContext;

    public BookRepository(AppDbContext context, ReadOnlyAppDbContext? readOnlyContext = null)
    {
        _context = context;
        _readOnlyContext = (AppDbContext?)readOnlyContext ?? context;
    }

    public async Task<Book?> GetByIdAsync(Guid id) =>
        await _context.Books
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id);

    public async Task<Book?> GetByIsbnAsync(string isbn)
    {
        if (string.IsNullOrWhiteSpace(isbn)) return null;
        var cleanIsbn = isbn.Trim().ToLower();
        return await _context.Books
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Isbn.ToLower() == cleanIsbn);
    }

    public async Task<Book?> GetByBarcodeAsync(string barcode)
    {
        if (string.IsNullOrWhiteSpace(barcode)) return null;
        var cleanBarcode = barcode.Trim();
        var cleanLower = cleanBarcode.ToLower();
        var strippedLower = cleanLower.Replace("-", "");
        var isGuid = Guid.TryParse(cleanBarcode, out var bookId);

        return await _context.Books
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b =>
                (isGuid && b.Id == bookId) ||
                (b.IsbnBarcode != null && (b.IsbnBarcode.ToLower() == cleanLower || b.IsbnBarcode.ToLower() == strippedLower)) ||
                (b.RfidTag != null && b.RfidTag.ToLower() == cleanLower) ||
                b.Isbn.ToLower() == cleanLower ||
                b.Isbn.ToLower() == strippedLower);
    }

    public async Task<Guid> GetDefaultCategoryIdAsync() =>
        await _readOnlyContext.Categories.Select(c => c.Id).FirstOrDefaultAsync();

    public async Task<List<Book>> GetAllAsync(Guid? categoryId = null, string? searchTerm = null, bool? isSpotlight = null)
    {
        var term = string.IsNullOrWhiteSpace(searchTerm) ? null : searchTerm.Trim().ToLower();

        return await _readOnlyContext.Books
            .Include(b => b.Category)
            .Where(b => !categoryId.HasValue || b.CategoryId == categoryId.Value)
            .Where(b => !isSpotlight.HasValue || b.IsSpotlight == isSpotlight.Value)
            .Where(b => term == null ||
                        b.Title.ToLower().Contains(term) ||
                        b.Author.ToLower().Contains(term) ||
                        b.Isbn.ToLower().Contains(term) ||
                        b.DeweyCode.ToLower().Contains(term))
            .OrderBy(b => b.Title)
            .ToListAsync();
    }

    public async Task AddAsync(Book book) =>
        await _context.Books.AddAsync(book);

    public Task UpdateAsync(Book book)
    {
        if (_context.Entry(book).State == EntityState.Detached)
            _context.Books.Update(book);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Book book)
    {
        var target = ResolveTrackedForDelete(book);
        _context.Books.Remove(target);
        return Task.CompletedTask;
    }

    public Task DeleteRangeAsync(IEnumerable<Book> books)
    {
        var targets = books.Select(ResolveTrackedForDelete).ToList();
        _context.Books.RemoveRange(targets);
        return Task.CompletedTask;
    }

    private Book ResolveTrackedForDelete(Book book) =>
        _context.Entry(book).State == EntityState.Detached
            ? _context.Books.Local.FirstOrDefault(b => b.Id == book.Id) ?? book
            : book;

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() > 0;
}
