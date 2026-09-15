// [Layer: Features/Services/Implementations]
// BookService.cs -- Implementation of catalog management workflows.
// Validates bibliographic metadata, manages stock counts, and coordinates with IBookRepository.
// DO NOT access AppDbContext directly -- use IBookRepository only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using Backend.Features.Data.Models;
using Backend.Features.Helpers.Infrastructure;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class BookService : IBookService
{
    private readonly IBookRepository _bookRepository;

    public BookService(IBookRepository bookRepository) =>
        _bookRepository = bookRepository;

    public async Task<List<Book>> GetCatalogAsync(Guid? categoryId = null, string? query = null, bool? isSpotlight = null) =>
        await _bookRepository.GetAllAsync(categoryId, query, isSpotlight);

    public async Task<Book?> GetBookDetailsAsync(Guid id) =>
        await _bookRepository.GetByIdAsync(id);

    public async Task<Book?> GetBookByBarcodeAsync(string barcode) =>
        await _bookRepository.GetByBarcodeAsync(barcode.Trim());

    public async Task<Book> CreateBookAsync(string title, string author, string isbn, string deweyCode, Guid categoryId, int year, int totalCopies, string bay, string? description, string? rfid)
    {
        var book = new Book
        {
            Title = InputSanitizer.SanitizeText(title),
            Author = InputSanitizer.SanitizeText(author),
            Isbn = isbn.Trim(),
            DeweyCode = deweyCode.Trim(),
            CategoryId = categoryId,
            PublishedYear = year,
            TotalCopies = Math.Max(1, totalCopies),
            AvailableCopies = Math.Max(1, totalCopies),
            BayLocation = InputSanitizer.SanitizeText(bay),
            Description = description != null ? InputSanitizer.SanitizeText(description) : null,
            RfidTag = rfid?.Trim(),
            IsbnBarcode = isbn.Replace("-", "").Trim()
        };

        await _bookRepository.AddAsync(book);
        await _bookRepository.SaveChangesAsync();
        return book;
    }

    public async Task<(bool Success, string? Error)> UpdateBookAsync(Guid id, string title, string author, string isbn, string deweyCode, Guid categoryId, int year, int totalCopies, string bay, string? description, string? rfid) =>
        await _bookRepository.GetByIdAsync(id) is not { } book
            ? (false, "Book asset not found.")
            : await PerformBookUpdateAsync(book, title, author, isbn, deweyCode, categoryId, year, totalCopies, bay, description, rfid);

    private async Task<(bool Success, string? Error)> PerformBookUpdateAsync(Book book, string title, string author, string isbn, string deweyCode, Guid categoryId, int year, int totalCopies, string bay, string? description, string? rfid)
    {
        int deltaCopies = totalCopies - book.TotalCopies;
        book.Title = InputSanitizer.SanitizeText(title);
        book.Author = InputSanitizer.SanitizeText(author);
        book.Isbn = isbn.Trim();
        book.DeweyCode = deweyCode.Trim();
        book.CategoryId = categoryId;
        book.PublishedYear = year;
        book.TotalCopies = Math.Max(0, totalCopies);
        book.AvailableCopies = Math.Max(0, book.AvailableCopies + deltaCopies);
        book.BayLocation = InputSanitizer.SanitizeText(bay);
        if (description != null) book.Description = InputSanitizer.SanitizeText(description);
        if (rfid != null) book.RfidTag = rfid.Trim();

        await _bookRepository.UpdateAsync(book);
        var saved = await _bookRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to update book asset.");
    }

    public async Task<(bool Success, string? Error)> DeleteBookAsync(Guid id) =>
        await _bookRepository.GetByIdAsync(id) is not { } book
            ? (false, "Book asset not found.")
            : book.TotalCopies > book.AvailableCopies
                ? (false, "Cannot de-accession a book while physical copies are currently out on loan.")
                : await PerformBookDeleteAsync(book);

    private async Task<(bool Success, string? Error)> PerformBookDeleteAsync(Book book)
    {
        await _bookRepository.DeleteAsync(book);
        var saved = await _bookRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to delete book asset.");
    }
}
