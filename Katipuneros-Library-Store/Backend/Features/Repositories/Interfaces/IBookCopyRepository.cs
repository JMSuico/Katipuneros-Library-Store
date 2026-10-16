// [Layer: Features/Repositories/Interfaces]
// IBookCopyRepository.cs -- Contract for individual physical book copy data access via EF Core.
// Defines queries for copy inventory, accession numbers, QR lookup, and status tracking.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Backend.Features.Data.Models;

namespace Backend.Features.Repositories.Interfaces;

public interface IBookCopyRepository
{
    Task<BookCopy?> GetByIdAsync(Guid id);
    Task<BookCopy?> GetByAccessionNumberAsync(string accessionNumber);
    Task<BookCopy?> GetByQrCodeAsync(string qrCodeData);
    Task<BookCopy?> FindByCodeAsync(string code);
    Task<List<BookCopy>> GetByBookIdAsync(Guid bookId);
    Task<BookCopy?> GetAvailableCopyAsync(Guid bookId);
    Task<int> GetCountByBookIdAsync(Guid bookId);
    Task<int> GetMaxCopyNumberAsync(Guid bookId);
    Task AddAsync(BookCopy copy);
    Task AddRangeAsync(IEnumerable<BookCopy> copies);
    Task UpdateAsync(BookCopy copy);
    Task DeleteAsync(BookCopy copy);
    Task<bool> SaveChangesAsync();
}
