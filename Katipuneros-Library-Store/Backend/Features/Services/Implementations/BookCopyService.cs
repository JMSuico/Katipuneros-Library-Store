// [Layer: Features/Services/Implementations]
// BookCopyService.cs -- Implementation of individual physical book copy management and QR barcode scanning.
// Generates accession numbers, handles QR payloads, resolves camera/text scans, and manages copy lifecycles.
// DO NOT access AppDbContext directly -- use IBookCopyRepository, IBookRepository, IBorrowRepository only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class BookCopyService : IBookCopyService
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    private readonly IBookCopyRepository _bookCopyRepository;
    private readonly IBookRepository _bookRepository;
    private readonly IBorrowRepository _borrowRepository;
    private readonly ISettingsRepository _settingsRepository;
    private readonly IConfiguration _configuration;

    public BookCopyService(
        IBookCopyRepository bookCopyRepository,
        IBookRepository bookRepository,
        IBorrowRepository borrowRepository,
        ISettingsRepository settingsRepository,
        IConfiguration configuration) =>
        (_bookCopyRepository, _bookRepository, _borrowRepository, _settingsRepository, _configuration) =
        (bookCopyRepository, bookRepository, borrowRepository, settingsRepository, configuration);

    private async Task<FineTariffsResponse> GetFineTariffsAsync()
    {
        var fineTariffs = new FineTariffsResponse();
        try
        {
            var setting = await _settingsRepository.GetByKeyAsync("fine_tariffs");
            if (setting != null && !string.IsNullOrWhiteSpace(setting.Value))
            {
                var parsed = JsonSerializer.Deserialize<FineTariffsResponse>(setting.Value, JsonOptions);
                if (parsed != null) fineTariffs = parsed;
            }
        }
        catch
        {
            // Fallback to default institutional tariffs
        }
        return fineTariffs;
    }

    public async Task<List<BookCopyDto>> GetCopiesByBookIdAsync(Guid bookId)
    {
        var book = await _bookRepository.GetByIdAsync(bookId);
        if (book == null) return new List<BookCopyDto>();

        // Auto-seed missing copies matching TotalCopies
        if (book.TotalCopies > 0)
        {
            await EnsureCopiesForBookAsync(bookId, book.TotalCopies);
        }

        var copies = await _bookCopyRepository.GetByBookIdAsync(bookId);
        var fineTariffs = await GetFineTariffsAsync();
        decimal dailyRate = fineTariffs.DailyOverdueTariff > 0
            ? fineTariffs.DailyOverdueTariff
            : (decimal.TryParse(_configuration["LibraryPolicy:DailyOverdueFineRate"], out decimal dr) ? dr : 15.00m);

        var results = new List<BookCopyDto>();

        foreach (var copy in copies)
        {
            var activeLoan = await _borrowRepository.GetActiveByCopyIdOrBookIdAsync(copy.Id, bookId);
            // If loan is on this copy, or if status is Borrowed
            results.Add(MapToDto(copy, activeLoan, dailyRate));
        }

        return results;
    }

    public async Task<BookCopyDto?> GetCopyByIdAsync(Guid copyId)
    {
        var copy = await _bookCopyRepository.GetByIdAsync(copyId);
        if (copy == null) return null;

        var fineTariffs = await GetFineTariffsAsync();
        decimal dailyRate = fineTariffs.DailyOverdueTariff > 0
            ? fineTariffs.DailyOverdueTariff
            : (decimal.TryParse(_configuration["LibraryPolicy:DailyOverdueFineRate"], out decimal dr) ? dr : 15.00m);

        var activeLoan = await _borrowRepository.GetActiveByCopyIdOrBookIdAsync(copy.Id, copy.BookId);
        return MapToDto(copy, activeLoan, dailyRate);
    }

    public async Task<(bool Success, BookCopyDto? Copy, string? Error)> CreateCopyAsync(Guid bookId, CreateBookCopyRequest request)
    {
        var book = await _bookRepository.GetByIdAsync(bookId);
        if (book == null)
            return (false, null, "Catalog book volume not found.");

        int nextCopyNum = await _bookCopyRepository.GetMaxCopyNumberAsync(bookId) + 1;
        var (accession, qr) = GenerateIdentifiers(book, nextCopyNum);
        while (await _bookCopyRepository.GetByAccessionNumberAsync(accession) != null)
        {
            nextCopyNum++;
            (accession, qr) = GenerateIdentifiers(book, nextCopyNum);
        }

        var copy = new BookCopy
        {
            BookId = book.Id,
            CopyNumber = nextCopyNum,
            AccessionNumber = accession,
            QrCodeData = qr,
            Status = CopyStatus.Available,
            Condition = string.IsNullOrWhiteSpace(request.Condition) ? "Good" : request.Condition.Trim(),
            ConditionNotes = request.ConditionNotes,
            BayLocation = !string.IsNullOrWhiteSpace(request.BayLocation) ? request.BayLocation.Trim() : book.BayLocation,
            AcquiredDate = DateTime.UtcNow
        };

        await _bookCopyRepository.AddAsync(copy);

        book.TotalCopies++;
        book.AvailableCopies++;
        await _bookRepository.UpdateAsync(book);

        await _bookCopyRepository.SaveChangesAsync();
        await _bookRepository.SaveChangesAsync();

        return (true, MapToDto(copy), null);
    }

    public async Task<(bool Success, BookCopyDto? Copy, string? Error)> UpdateCopyAsync(Guid copyId, UpdateBookCopyRequest request)
    {
        var copy = await _bookCopyRepository.GetByIdAsync(copyId);
        if (copy == null)
            return (false, null, "Physical book copy not found.");

        if (Enum.TryParse<CopyStatus>(request.Status, true, out var parsedStatus))
        {
            var prevStatus = copy.Status;
            copy.Status = parsedStatus;

            // If transitioning to/from Available, sync Book.AvailableCopies
            if (copy.Book != null)
            {
                if (prevStatus == CopyStatus.Available && parsedStatus != CopyStatus.Available)
                {
                    copy.Book.AvailableCopies = Math.Max(0, copy.Book.AvailableCopies - 1);
                    await _bookRepository.UpdateAsync(copy.Book);
                }
                else if (prevStatus != CopyStatus.Available && parsedStatus == CopyStatus.Available)
                {
                    copy.Book.AvailableCopies = Math.Min(copy.Book.TotalCopies, copy.Book.AvailableCopies + 1);
                    await _bookRepository.UpdateAsync(copy.Book);
                }
            }
        }

        if (!string.IsNullOrWhiteSpace(request.Condition))
            copy.Condition = request.Condition.Trim();

        copy.ConditionNotes = request.ConditionNotes;

        if (!string.IsNullOrWhiteSpace(request.BayLocation))
            copy.BayLocation = request.BayLocation.Trim();

        await _bookCopyRepository.UpdateAsync(copy);
        await _bookCopyRepository.SaveChangesAsync();
        await _bookRepository.SaveChangesAsync();

        var fineTariffs = await GetFineTariffsAsync();
        decimal dailyRate = fineTariffs.DailyOverdueTariff > 0
            ? fineTariffs.DailyOverdueTariff
            : (decimal.TryParse(_configuration["LibraryPolicy:DailyOverdueFineRate"], out decimal dr) ? dr : 15.00m);

        var activeLoan = await _borrowRepository.GetActiveByCopyIdOrBookIdAsync(copy.Id, copy.BookId);
        return (true, MapToDto(copy, activeLoan, dailyRate), null);
    }

    public async Task<(bool Success, string? Error)> DeleteCopyAsync(Guid copyId)
    {
        var copy = await _bookCopyRepository.GetByIdAsync(copyId);
        if (copy == null)
            return (false, "Physical book copy not found.");

        if (copy.Status == CopyStatus.Borrowed)
            return (false, "Cannot remove a copy that is currently on circulation loan.");

        var book = await _bookRepository.GetByIdAsync(copy.BookId);
        if (book != null)
        {
            book.TotalCopies = Math.Max(0, book.TotalCopies - 1);
            if (copy.Status == CopyStatus.Available)
                book.AvailableCopies = Math.Max(0, book.AvailableCopies - 1);

            await _bookRepository.UpdateAsync(book);
        }

        await _bookCopyRepository.DeleteAsync(copy);
        await _bookCopyRepository.SaveChangesAsync();
        await _bookRepository.SaveChangesAsync();

        return (true, null);
    }

    public async Task<int> EnsureCopiesForBookAsync(Guid bookId, int expectedTotalCopies)
    {
        var book = await _bookRepository.GetByIdAsync(bookId);
        if (book == null) return 0;

        var existingCopies = await _bookCopyRepository.GetByBookIdAsync(bookId);
        if (existingCopies.Count >= expectedTotalCopies && existingCopies.Count > 0)
            return 0;

        int nextNum = existingCopies.Count > 0 ? existingCopies.Max(c => c.CopyNumber) + 1 : 1;
        int target = Math.Max(expectedTotalCopies, 1);
        int added = 0;

        while (existingCopies.Count + added < target)
        {
            var (accession, qr) = GenerateIdentifiers(book, nextNum);
            while (existingCopies.Any(c => c.AccessionNumber == accession) ||
                   await _bookCopyRepository.GetByAccessionNumberAsync(accession) != null)
            {
                nextNum++;
                (accession, qr) = GenerateIdentifiers(book, nextNum);
            }

            var copy = new BookCopy
            {
                BookId = book.Id,
                CopyNumber = nextNum++,
                AccessionNumber = accession,
                QrCodeData = qr,
                Status = CopyStatus.Available,
                Condition = "Good",
                BayLocation = book.BayLocation,
                AcquiredDate = DateTime.UtcNow
            };
            await _bookCopyRepository.AddAsync(copy);
            existingCopies.Add(copy);
            added++;
        }

        if (added > 0)
        {
            await _bookCopyRepository.SaveChangesAsync();
        }

        return added;
    }

    public async Task<int> SyncAllBookCopiesAsync()
    {
        var books = await _bookRepository.GetAllAsync();
        int totalSeeded = 0;
        foreach (var book in books)
        {
            totalSeeded += await EnsureCopiesForBookAsync(book.Id, book.TotalCopies);
        }
        return totalSeeded;
    }

    public async Task<(bool Success, BookCopyScanResultDto? Result, string? Error)> ResolveScanAsync(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            return (false, null, "Scan code or accession input is required.");

        var copy = await _bookCopyRepository.FindByCodeAsync(code);
        if (copy == null)
            return (false, null, $"No physical copy or catalog volume matched '{code}'.");

        var activeLoan = await _borrowRepository.GetActiveByCopyIdOrBookIdAsync(copy.Id, copy.BookId);

        var fineTariffs = await GetFineTariffsAsync();

        decimal dailyRate = fineTariffs.DailyOverdueTariff > 0
            ? fineTariffs.DailyOverdueTariff
            : (decimal.TryParse(_configuration["LibraryPolicy:DailyOverdueFineRate"], out decimal dr) ? dr : 15.00m);
        decimal maxCap = fineTariffs.MaxPenaltyCap > 0
            ? fineTariffs.MaxPenaltyCap
            : (decimal.TryParse(_configuration["LibraryPolicy:MaximumFineCap"], out decimal mc) ? mc : 500.00m);
        decimal defaultDamageFee = fineTariffs.BindingRepairTariff > 0
            ? fineTariffs.BindingRepairTariff
            : 280.00m;

        var dto = MapToDto(copy, activeLoan, dailyRate);

        var result = new BookCopyScanResultDto
        {
            Copy = dto,
            ActiveLoan = dto.CurrentBorrower,
            DailyFineRate = dailyRate,
            MaximumFineCap = maxCap,
            DefaultDamageFee = defaultDamageFee
        };

        return (true, result, null);
    }

    private static (string AccessionNumber, string QrCodeData) GenerateIdentifiers(Book book, int copyNumber)
    {
        var prefix = !string.IsNullOrWhiteSpace(book.DeweyCode)
            ? book.DeweyCode.Replace(" ", "").Replace(".", "").ToUpper()
            : "BOOK";

        // Ensure prefix only contains alphanumeric
        prefix = new string(prefix.Where(char.IsLetterOrDigit).ToArray());
        if (string.IsNullOrEmpty(prefix)) prefix = "BOOK";

        var bookHash = book.Id.ToString("N")[..4].ToUpper();
        var accession = $"KP-ACC-{prefix}-{bookHash}-C{copyNumber:D2}";
        var qr = $"KP:COPY:{book.Id}:{accession}";
        return (accession, qr);
    }

    private static BookCopyDto MapToDto(BookCopy copy, BorrowTransaction? activeLoan = null, decimal dailyRate = 15.00m)
    {
        ActiveBorrowerDto? borrower = null;
        if (activeLoan != null)
        {
            var now = DateTime.UtcNow;
            var isOverdue = activeLoan.DueDate < now;
            var overdueDays = isOverdue ? (int)Math.Ceiling((now - activeLoan.DueDate).TotalDays) : 0;
            borrower = new ActiveBorrowerDto
            {
                TransactionId = activeLoan.Id,
                PatronId = activeLoan.PatronId,
                PatronName = activeLoan.Patron?.FullName ?? "Unknown Patron",
                PatronLibraryId = activeLoan.Patron?.LibraryCardNumber ?? "N/A",
                PatronAvatar = activeLoan.Patron?.ProfilePictureUrl,
                GatePassCode = activeLoan.GatePassCode,
                BorrowDate = activeLoan.BorrowDate,
                DueDate = activeLoan.DueDate,
                IsOverdue = isOverdue,
                OverdueDays = overdueDays,
                EstimatedOverdueFine = overdueDays * dailyRate
            };
        }

        return new BookCopyDto
        {
            Id = copy.Id,
            BookId = copy.BookId,
            BookTitle = copy.Book?.Title ?? "Unknown Title",
            BookAuthor = copy.Book?.Author ?? "Unknown Author",
            BookIsbn = copy.Book?.Isbn ?? "",
            DeweyCode = copy.Book?.DeweyCode ?? "",
            CoverImage = copy.Book?.CoverImage,
            CopyNumber = copy.CopyNumber,
            AccessionNumber = copy.AccessionNumber,
            QrCodeData = copy.QrCodeData,
            Status = copy.Status.ToString(),
            Condition = copy.Condition,
            ConditionNotes = copy.ConditionNotes,
            BayLocation = copy.BayLocation ?? copy.Book?.BayLocation,
            AcquiredDate = copy.AcquiredDate,
            LastReturnedDate = copy.LastReturnedDate,
            IsBorrowed = copy.Status == CopyStatus.Borrowed || borrower != null,
            CurrentBorrower = borrower
        };
    }
}
