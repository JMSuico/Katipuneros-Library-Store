// [Layer: Features/Services/Interfaces]
// IBookService.cs -- Contract for bibliographic catalog workflows and stock validation.
// Defines business rules for acquisitions, searches, and physical inventory.
// DO NOT put data access, raw SQL, or HTTP concerns here.

using Backend.Features.Data.Models;

namespace Backend.Features.Services.Interfaces;

public interface IBookService
{
    Task<List<Book>> GetCatalogAsync(Guid? categoryId = null, string? query = null, bool? isSpotlight = null);
    Task<Book?> GetBookDetailsAsync(Guid id);
    Task<Book?> GetBookByBarcodeAsync(string barcode);
    Task<Book> CreateBookAsync(string title, string author, string isbn, string? deweyCode, Guid categoryId, int year, int totalCopies, string bay, string? description, string? rfid);
    Task<(bool Success, string? Error)> UpdateBookAsync(Guid id, string title, string author, string isbn, string? deweyCode, Guid categoryId, int year, int totalCopies, string bay, string? description, string? rfid);
    Task<(bool Success, string? Error)> DeleteBookAsync(Guid id);
    Task<(int TotalTitles, int PhysicalCopies, int InCirculation, int ActiveDisciplines)> GetCatalogMetricsAsync();
    Task<(int DeletedCount, string? Error)> BulkDeleteBooksAsync(List<Guid> bookIds);
    Task<(bool Success, string? Error)> ToggleArchiveAsync(Guid id, bool isArchived);
    Task<(int IngestedCount, List<string> Errors)> BatchIngestIsbnsAsync(List<string> isbns, Guid? defaultCategoryId);
}
