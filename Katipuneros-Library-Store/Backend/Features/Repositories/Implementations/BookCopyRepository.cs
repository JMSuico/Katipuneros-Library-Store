// [Layer: Features/Repositories/Implementations]
// BookCopyRepository.cs -- Data access implementation for BookCopy physical volumes via EF Core.
// Queries AppDbContext directly.
// Enforces atomic copy allocation and concurrency locking.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Microsoft.EntityFrameworkCore;
using Backend.Features.Data;
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;

namespace Backend.Features.Repositories.Implementations;

public class BookCopyRepository : IBookCopyRepository
{
    private readonly AppDbContext _context;

    public BookCopyRepository(AppDbContext context) =>
        _context = context;

    public async Task<BookCopy?> GetByIdAsync(Guid id) =>
        await _context.BookCopies
            .Include(bc => bc.Book)
                .ThenInclude(b => b!.Category)
            .FirstOrDefaultAsync(bc => bc.Id == id);

    public async Task<BookCopy?> GetByAccessionNumberAsync(string accessionNumber) =>
        await _context.BookCopies
            .Include(bc => bc.Book)
                .ThenInclude(b => b!.Category)
            .FirstOrDefaultAsync(bc => bc.AccessionNumber == accessionNumber.Trim());

    public async Task<BookCopy?> GetByQrCodeAsync(string qrCodeData) =>
        await _context.BookCopies
            .Include(bc => bc.Book)
                .ThenInclude(b => b!.Category)
            .FirstOrDefaultAsync(bc => bc.QrCodeData == qrCodeData.Trim());

    public async Task<BookCopy?> FindByCodeAsync(string code) =>
        await ExecuteAsync(async () =>
        {
            if (string.IsNullOrWhiteSpace(code)) return null;

            var clean = code.Trim();
            var isGuid = Guid.TryParse(clean, out var parsedGuid);

            // 1. Direct match on AccessionNumber or QrCodeData or Id
            var directMatch = await _context.BookCopies
                .Include(bc => bc.Book)
                    .ThenInclude(b => b!.Category)
                .FirstOrDefaultAsync(bc =>
                    (isGuid && bc.Id == parsedGuid) ||
                    bc.AccessionNumber == clean ||
                    bc.QrCodeData == clean ||
                    bc.QrCodeData.Contains(clean));

            if (directMatch != null) return directMatch;

            // 2. If payload has prefix e.g. "KP:COPY:{bookId}:{acc}", extract the accession part
            if (clean.Contains(':'))
            {
                var parts = clean.Split(':', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                foreach (var part in parts)
                {
                    var match = await _context.BookCopies
                        .Include(bc => bc.Book)
                            .ThenInclude(b => b!.Category)
                        .FirstOrDefaultAsync(bc => bc.AccessionNumber == part);
                    if (match != null) return match;
                }
            }

            // 3. Check if code matches a Book by ISBN/Barcode and return its first available copy
            var book = await _context.Books
                .FirstOrDefaultAsync(b =>
                    (isGuid && b.Id == parsedGuid) ||
                    b.IsbnBarcode == clean ||
                    b.Isbn == clean ||
                    b.RfidTag == clean);

            if (book != null)
            {
                return await _context.BookCopies
                    .Include(bc => bc.Book)
                        .ThenInclude(b => b!.Category)
                    .Where(bc => bc.BookId == book.Id)
                    .OrderBy(bc => bc.Status == CopyStatus.Available ? 0 : 1)
                    .ThenBy(bc => bc.CopyNumber)
                    .FirstOrDefaultAsync();
            }

            return null;
        });

    public async Task<List<BookCopy>> GetByBookIdAsync(Guid bookId) =>
        await _context.BookCopies
            .Include(bc => bc.Book)
            .Where(bc => bc.BookId == bookId)
            .OrderBy(bc => bc.CopyNumber)
            .ToListAsync();

    public async Task<BookCopy?> GetAvailableCopyAsync(Guid bookId) =>
        await FetchAvailableCopyWithLockAsync(bookId);

    public async Task<BookCopy?> AllocateAvailableCopyAsync(Guid bookId) =>
        await ExecuteAsync(async () =>
        {
            var copy = await FetchAvailableCopyWithLockAsync(bookId);
            if (copy == null || copy.Status != CopyStatus.Available)
            {
                return null;
            }

            copy.Status = CopyStatus.Borrowed;
            _context.BookCopies.Update(copy);
            return copy;
        });

    public async Task<int> GetCountByBookIdAsync(Guid bookId) =>
        await _context.BookCopies.CountAsync(bc => bc.BookId == bookId);

    public async Task<int> GetMaxCopyNumberAsync(Guid bookId) =>
        await _context.BookCopies
            .Where(bc => bc.BookId == bookId)
            .MaxAsync(bc => (int?)bc.CopyNumber) ?? 0;

    public async Task AddAsync(BookCopy copy) =>
        await _context.BookCopies.AddAsync(copy);

    public async Task AddRangeAsync(IEnumerable<BookCopy> copies) =>
        await _context.BookCopies.AddRangeAsync(copies);

    public Task UpdateAsync(BookCopy copy) =>
        Task.FromResult(_context.BookCopies.Update(copy));

    public Task DeleteAsync(BookCopy copy) =>
        Task.FromResult(_context.BookCopies.Remove(copy));

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() > 0;

    private static async Task<T> ExecuteAsync<T>(Func<Task<T>> action) =>
        await action();

    private async Task<BookCopy?> FetchAvailableCopyWithLockAsync(Guid bookId) =>
        await ExecuteAsync(async () =>
        {
            try
            {
                if (_context.Database.IsSqlServer())
                {
                    var sqlServerCopy = await _context.BookCopies
                        .FromSqlInterpolated($"SELECT TOP 1 * FROM [BookCopies] WITH (UPDLOCK, ROWLOCK) WHERE [BookId] = {bookId} AND [Status] = {(int)CopyStatus.Available} ORDER BY [CopyNumber]")
                        .FirstOrDefaultAsync();

                    if (sqlServerCopy is { Status: CopyStatus.Available })
                    {
                        return sqlServerCopy;
                    }
                }
                else if (_context.Database.IsNpgsql())
                {
                    var npgsqlCopy = await _context.BookCopies
                        .FromSqlInterpolated($"SELECT * FROM \"BookCopies\" WHERE \"BookId\" = {bookId} AND \"Status\" = {(int)CopyStatus.Available} ORDER BY \"CopyNumber\" LIMIT 1 FOR UPDATE")
                        .FirstOrDefaultAsync();

                    if (npgsqlCopy is { Status: CopyStatus.Available })
                    {
                        return npgsqlCopy;
                    }
                }
            }
            catch
            {
                // Fallback to LINQ if relational locking syntax is unsupported on current provider
            }

            return await _context.BookCopies
                .Include(bc => bc.Book)
                .Where(bc => bc.BookId == bookId && bc.Status == CopyStatus.Available)
                .OrderBy(bc => bc.CopyNumber)
                .FirstOrDefaultAsync();
        });
}
