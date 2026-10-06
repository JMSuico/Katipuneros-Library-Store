// [Layer: Features/Services/Implementations]
// BookService.cs -- Implementation of catalog management workflows.
// Validates bibliographic metadata, manages stock counts, and coordinates with IBookRepository.
// DO NOT access AppDbContext directly -- use IBookRepository only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using Microsoft.EntityFrameworkCore;
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

    public async Task<Book> CreateBookAsync(string title, string author, string isbn, string? deweyCode, Guid categoryId, int year, int totalCopies, string bay, string? description, string? rfid)
    {
        var book = new Book
        {
            Title = InputSanitizer.SanitizeText(title),
            Author = InputSanitizer.SanitizeText(author),
            Isbn = isbn.Trim(),
            DeweyCode = deweyCode?.Trim() ?? string.Empty,
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

    public async Task<(bool Success, string? Error)> UpdateBookAsync(Guid id, string title, string author, string isbn, string? deweyCode, Guid categoryId, int year, int totalCopies, string bay, string? description, string? rfid) =>
        await _bookRepository.GetByIdAsync(id) is not { } book
            ? (false, "Book asset not found.")
            : await PerformBookUpdateAsync(book, title, author, isbn, deweyCode, categoryId, year, totalCopies, bay, description, rfid);

    private async Task<(bool Success, string? Error)> PerformBookUpdateAsync(Book book, string title, string author, string isbn, string? deweyCode, Guid categoryId, int year, int totalCopies, string bay, string? description, string? rfid)
    {
        int deltaCopies = totalCopies - book.TotalCopies;
        book.Title = InputSanitizer.SanitizeText(title);
        book.Author = InputSanitizer.SanitizeText(author);
        book.Isbn = isbn.Trim();
        if (deweyCode != null) book.DeweyCode = deweyCode.Trim();
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
        try
        {
            await _bookRepository.DeleteAsync(book);
            var saved = await _bookRepository.SaveChangesAsync();
            return (saved, saved ? null : "Failed to delete book asset.");
        }
        catch (DbUpdateException)
        {
            return (false, "Cannot de-accession catalog asset: historical circulation, reservation, or ledger records are linked. Please archive the title instead.");
        }
        catch (Exception ex)
        {
            return (false, $"Error deleting book asset: {ex.Message}");
        }
    }

    public async Task<(int TotalTitles, int PhysicalCopies, int InCirculation, int ActiveDisciplines)> GetCatalogMetricsAsync()
    {
        var allBooks = await _bookRepository.GetAllAsync();
        int totalTitles = allBooks.Count;
        int physicalCopies = allBooks.Sum(b => b.TotalCopies);
        int inCirculation = allBooks.Sum(b => Math.Max(0, b.TotalCopies - b.AvailableCopies));
        int activeDisciplines = allBooks.Select(b => b.CategoryId).Distinct().Count();
        return (totalTitles, physicalCopies, inCirculation, activeDisciplines);
    }

    public async Task<(int DeletedCount, string? Error)> BulkDeleteBooksAsync(List<Guid> bookIds)
    {
        if (bookIds == null || bookIds.Count == 0) return (0, "No book IDs provided for deletion.");
        var toDelete = new List<Book>();
        foreach (var id in bookIds)
        {
            if (await _bookRepository.GetByIdAsync(id) is { } book && book.TotalCopies <= book.AvailableCopies)
            {
                toDelete.Add(book);
            }
        }
        if (toDelete.Count == 0) return (0, "No eligible books found to de-accession (books on loan cannot be deleted).");
        try
        {
            await _bookRepository.DeleteRangeAsync(toDelete);
            await _bookRepository.SaveChangesAsync();
            return (toDelete.Count, null);
        }
        catch (DbUpdateException)
        {
            return (0, "Cannot de-accession one or more selected assets: historical circulation or reservation records are linked. Please archive instead.");
        }
        catch (Exception ex)
        {
            return (0, $"Error during bulk de-accession: {ex.Message}");
        }
    }

    public async Task<(bool Success, string? Error)> ToggleArchiveAsync(Guid id, bool isArchived)
    {
        if (await _bookRepository.GetByIdAsync(id) is not { } book)
            return (false, "Book asset not found.");

        book.IsSpotlight = !isArchived;
        await _bookRepository.UpdateAsync(book);
        var saved = await _bookRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to update archive status.");
    }

    public async Task<(int IngestedCount, List<string> Errors)> BatchIngestIsbnsAsync(List<string> isbns, Guid? defaultCategoryId)
    {
        var errors = new List<string>();
        int count = 0;
        if (isbns == null || isbns.Count == 0) return (0, errors);

        var allBooks = await _bookRepository.GetAllAsync();
        var existingIsbns = new HashSet<string>(allBooks.Select(b => b.Isbn.Replace("-", "").Trim()), StringComparer.OrdinalIgnoreCase);

        Guid catId = defaultCategoryId ?? (allBooks.FirstOrDefault()?.CategoryId ?? Guid.NewGuid());

        foreach (var rawIsbn in isbns)
        {
            string clean = rawIsbn.Replace("-", "").Trim();
            if (string.IsNullOrWhiteSpace(clean) || clean.Length < 10)
            {
                errors.Add($"Invalid ISBN format: '{rawIsbn}'");
                continue;
            }
            if (existingIsbns.Contains(clean))
            {
                errors.Add($"ISBN already in catalog: '{rawIsbn}'");
                continue;
            }

            var newBook = new Book
            {
                Title = $"Bibliographic Record ISBN {clean}",
                Author = "Catalog Ingest Authority",
                Isbn = rawIsbn.Trim(),
                DeweyCode = $"004.{clean.Substring(Math.Max(0, clean.Length - 3))}",
                CategoryId = catId,
                PublishedYear = DateTime.UtcNow.Year,
                TotalCopies = 1,
                AvailableCopies = 1,
                BayLocation = "Main Stacks / Ingest Processing",
                Description = $"Imported via Batch ISBN Accession on {DateTime.UtcNow:yyyy-MM-dd}.",
                CreatedAt = DateTime.UtcNow
            };

            await _bookRepository.AddAsync(newBook);
            existingIsbns.Add(clean);
            count++;
        }

        if (count > 0)
        {
            await _bookRepository.SaveChangesAsync();
        }

        return (count, errors);
    }
}
