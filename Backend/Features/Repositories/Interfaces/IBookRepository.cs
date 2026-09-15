// [Layer: Features/Repositories/Interfaces]
// IBookRepository.cs -- Contract for bibliographic catalog data access via EF Core.
// Defines queries for book search, stock tracking, and acquisitions.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Backend.Features.Data.Models;

namespace Backend.Features.Repositories.Interfaces;

public interface IBookRepository
{
    Task<Book?> GetByIdAsync(Guid id);
    Task<Book?> GetByIsbnAsync(string isbn);
    Task<Book?> GetByBarcodeAsync(string barcode);
    Task<List<Book>> GetAllAsync(Guid? categoryId = null, string? searchTerm = null, bool? isSpotlight = null);
    Task AddAsync(Book book);
    Task UpdateAsync(Book book);
    Task DeleteAsync(Book book);
    Task<bool> SaveChangesAsync();
}
