// [Layer: Features/Services/Interfaces]
// IBookCopyService.cs -- Service contract for physical book copy management and QR barcode scanning.
// Pure interface definition ONLY.
// DO NOT put implementation details or direct database operations here.

using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;

namespace Backend.Features.Services.Interfaces;

public interface IBookCopyService
{
    Task<List<BookCopyDto>> GetCopiesByBookIdAsync(Guid bookId);
    Task<BookCopyDto?> GetCopyByIdAsync(Guid copyId);
    Task<(bool Success, BookCopyDto? Copy, string? Error)> CreateCopyAsync(Guid bookId, CreateBookCopyRequest request);
    Task<(bool Success, BookCopyDto? Copy, string? Error)> UpdateCopyAsync(Guid copyId, UpdateBookCopyRequest request);
    Task<(bool Success, string? Error)> DeleteCopyAsync(Guid copyId);
    Task<int> EnsureCopiesForBookAsync(Guid bookId, int expectedTotalCopies);
    Task<int> SyncAllBookCopiesAsync();
    Task<(bool Success, BookCopyScanResultDto? Result, string? Error)> ResolveScanAsync(string code);
}
