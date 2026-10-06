// [Layer: Features/Services/Implementations]
// BorrowService.cs -- Implementation of circulation loan and returns workflows.
// Enforces borrowing limits, loan caps, renewal limits, overdue tariffs, and condition grading.
// DO NOT access AppDbContext directly -- use IBorrowRepository, IBookRepository, IFineRepository only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Helpers.Infrastructure;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class BorrowService : IBorrowService
{
    private readonly IBorrowRepository _borrowRepository;
    private readonly IBookRepository _bookRepository;
    private readonly IUserRepository _userRepository;
    private readonly IFineRepository _fineRepository;
    private readonly IConfiguration _configuration;

    public BorrowService(
        IBorrowRepository borrowRepository,
        IBookRepository bookRepository,
        IUserRepository userRepository,
        IFineRepository fineRepository,
        IConfiguration configuration) =>
        (_borrowRepository, _bookRepository, _userRepository, _fineRepository, _configuration) =
        (borrowRepository, bookRepository, userRepository, fineRepository, configuration);

    public async Task<List<BorrowTransaction>> GetPatronActiveLoansAsync(Guid patronId) =>
        await _borrowRepository.GetActiveByPatronIdAsync(patronId);

    public async Task<List<BorrowTransaction>> GetPatronLoanHistoryAsync(Guid patronId) =>
        await _borrowRepository.GetAllByPatronIdAsync(patronId);

    public async Task<List<BorrowTransaction>> GetAuditLedgerAsync(TransactionStatus? status = null) =>
        await _borrowRepository.GetAllLedgerAsync(status);

    public async Task<(bool Success, List<BorrowTransaction> Transactions, string? Error)> CheckoutAsync(Guid patronId, List<string> bookBarcodes, DateTime dueDate, Guid? cashierId)
    {
        var patron = await _userRepository.GetByIdAsync(patronId);
        if (patron == null || !patron.IsActive)
            return (false, new List<BorrowTransaction>(), "Patron record is invalid or currently suspended.");

        var activeLoans = await _borrowRepository.GetActiveByPatronIdAsync(patronId);
        int maxAllowed = int.TryParse(_configuration["LibraryPolicy:MaxActiveBorrowingsPerPatron"], out int cap) ? cap : 3;

        if (activeLoans.Count + bookBarcodes.Count > maxAllowed)
            return (false, new List<BorrowTransaction>(), $"Loan quota exceeded. Patrons can have at most {maxAllowed} active loans concurrently (currently active: {activeLoans.Count}).");

        var created = new List<BorrowTransaction>();

        foreach (var barcode in bookBarcodes)
        {
            var book = await _bookRepository.GetByBarcodeAsync(barcode);
            if (book == null)
                return (false, new List<BorrowTransaction>(), $"Book barcode '{barcode}' not found in registry.");

            if (book.AvailableCopies <= 0)
                return (false, new List<BorrowTransaction>(), $"No physical copies of '{book.Title}' are currently available on shelf.");

            book.AvailableCopies--;
            await _bookRepository.UpdateAsync(book);

            var transaction = new BorrowTransaction
            {
                PatronId = patronId,
                BookId = book.Id,
                CashierId = cashierId,
                BorrowDate = DateTime.UtcNow,
                DueDate = dueDate > DateTime.UtcNow ? dueDate : DateTime.UtcNow.AddDays(14),
                Status = TransactionStatus.Active,
                RenewalCount = 0,
                GatePassCode = $"GP-{Random.Shared.Next(100000, 999999)}"
            };

            await _borrowRepository.AddAsync(transaction);
            created.Add(transaction);
        }

        await _borrowRepository.SaveChangesAsync();
        await _bookRepository.SaveChangesAsync();

        return (true, created, null);
    }

    public async Task<(bool Success, BorrowTransaction? Transaction, string? Error)> RenewLoanAsync(Guid loanId, Guid patronId) =>
        await _borrowRepository.GetByIdAsync(loanId) is not { } loan || loan.PatronId != patronId || loan.Status != TransactionStatus.Active
            ? (false, null, "Active loan record not found.")
            : await ExecuteLoanRenewalAsync(loan);

    private async Task<(bool Success, BorrowTransaction? Transaction, string? Error)> ExecuteLoanRenewalAsync(BorrowTransaction loan)
    {
        int maxRenewals = int.TryParse(_configuration["LibraryPolicy:MaxRenewalsAllowed"], out int mr) ? mr : 2;
        if (loan.RenewalCount >= maxRenewals)
            return (false, null, $"Renewal limit reached ({maxRenewals} extensions granted). Please return the physical book for re-cataloging.");

        int extensionDays = int.TryParse(_configuration["LibraryPolicy:RenewalExtensionDays"], out int ed) ? ed : 7;
        loan.DueDate = loan.DueDate.AddDays(extensionDays);
        loan.RenewalCount++;

        await _borrowRepository.UpdateAsync(loan);
        await _borrowRepository.SaveChangesAsync();

        return (true, loan, null);
    }

    public async Task<(bool Success, BorrowTransaction? Transaction, decimal AssessedFine, string? Error)> ReturnBookAsync(string barcode, string? condition, decimal? damageFee, Guid? cashierId)
    {
        var book = await _bookRepository.GetByBarcodeAsync(barcode);
        if (book == null)
            return (false, null, 0, $"Book barcode '{barcode}' not found.");

        var allLoans = await _borrowRepository.GetAllLedgerAsync(TransactionStatus.Active);
        var activeLoan = allLoans.FirstOrDefault(l => l.BookId == book.Id);

        if (activeLoan == null)
            return (false, null, 0, $"No active loan record found for '{book.Title}'.");

        activeLoan.ReturnDate = DateTime.UtcNow;
        activeLoan.Status = TransactionStatus.Returned;
        activeLoan.ConditionNotes = condition != null ? InputSanitizer.SanitizeText(condition) : null;

        book.AvailableCopies = Math.Min(book.TotalCopies, book.AvailableCopies + 1);
        await _bookRepository.UpdateAsync(book);

        decimal dailyFine = decimal.TryParse(_configuration["LibraryPolicy:DailyOverdueFineRate"], out decimal fr) ? fr : 5.00m;
        decimal fineCap = decimal.TryParse(_configuration["LibraryPolicy:MaximumFineCap"], out decimal fc) ? fc : 500.00m;
        decimal totalFine = 0;

        if (activeLoan.ReturnDate.Value > activeLoan.DueDate)
        {
            var overdueDays = (int)Math.Ceiling((activeLoan.ReturnDate.Value - activeLoan.DueDate).TotalDays);
            decimal overduePenalty = Math.Min(overdueDays * dailyFine, fineCap);
            totalFine += overduePenalty;
        }

        if (damageFee.HasValue && damageFee.Value > 0)
        {
            totalFine += damageFee.Value;
        }

        if (totalFine > 0)
        {
            var fine = new FineTransaction
            {
                PatronId = activeLoan.PatronId,
                BorrowTransactionId = activeLoan.Id,
                Amount = totalFine,
                BalanceRemaining = totalFine,
                Status = "Unpaid",
                Reason = $"Overdue return and/or condition assessment penalty for '{book.Title}'."
            };
            await _fineRepository.AddAsync(fine);
            await _fineRepository.SaveChangesAsync();
        }

        await _borrowRepository.UpdateAsync(activeLoan);
        await _borrowRepository.SaveChangesAsync();
        await _bookRepository.SaveChangesAsync();

        return (true, activeLoan, totalFine, null);
    }

    public async Task<BorrowingMetricsResponse> GetMetricsAsync() =>
        await _borrowRepository.GetBorrowingMetricsAsync();

    public async Task<List<BorrowingDetailResponse>> GetAllAdminBorrowingsAsync(string? status = null, string? query = null)
    {
        var loans = await _borrowRepository.GetAllWithDetailsAsync(status, query);
        var now = DateTime.UtcNow;
        const decimal dailyRate = 15.00m;

        return loans.Select(b =>
        {
            int daysRemaining = (int)Math.Ceiling((b.DueDate - now).TotalDays);
            bool isOverdue = b.Status == TransactionStatus.Active && b.DueDate < now;
            decimal fine = isOverdue
                ? Math.Max(0, (int)Math.Floor((now - b.DueDate).TotalDays)) * dailyRate
                : 0m;

            string roleLabel = b.Patron?.EmploymentStatus ?? (b.Patron?.Role == UserRole.Customer ? "Undergrad" : b.Patron?.Role.ToString() ?? "Patron");

            return new BorrowingDetailResponse
            {
                Id = b.Id,
                LoanCode = b.GatePassCode ?? $"#LN-{b.Id.ToString()[..4].ToUpper()}",
                PatronId = b.PatronId,
                PatronName = b.Patron?.FullName ?? "Unknown Patron",
                PatronLibraryId = b.Patron?.LibraryCardNumber ?? "N/A",
                PatronRole = roleLabel,
                PatronAvatar = b.Patron?.ProfilePictureUrl,
                BookId = b.BookId,
                BookTitle = b.Book?.Title ?? "Unknown Title",
                BookBarcode = b.Book?.IsbnBarcode ?? b.Book?.Isbn ?? "N/A",
                BookCallNumber = b.Book?.DeweyCode ?? "000 GEN",
                BookCoverImage = b.Book?.CoverImage,
                BorrowDate = b.BorrowDate,
                DueDate = b.DueDate,
                DaysRemaining = daysRemaining,
                RenewalCount = b.RenewalCount,
                MaxRenewals = 2,
                Status = isOverdue ? "Overdue" : b.Status.ToString(),
                AssessedFine = fine,
                Notes = b.ConditionNotes
            };
        }).ToList();
    }

    public async Task<(bool Success, BorrowTransaction? Transaction, string? Error)> CreateLoanOverrideAsync(LoanOverrideRequest request, Guid adminId)
    {
        var patron = await _userRepository.GetByIdentifierAsync(request.PatronLibraryId)
            ?? await _userRepository.GetByCardNumberAsync(request.PatronLibraryId);

        if (patron == null)
            return (false, null, $"Patron with ID '{request.PatronLibraryId}' not found.");

        var book = await _bookRepository.GetByBarcodeAsync(request.VolumeBarcode);
        if (book == null)
            return (false, null, $"Book with barcode '{request.VolumeBarcode}' not found.");

        int extensionDays = request.ExtensionInterval switch
        {
            "Extended +14 Days Exam Period" => 14,
            "Semester Long Special Grant (+45 Days)" => 45,
            "Faculty Capstone Override (+90 Days)" => 90,
            _ => 7
        };

        if (book.AvailableCopies > 0)
        {
            book.AvailableCopies--;
            await _bookRepository.UpdateAsync(book);
        }

        var transaction = new BorrowTransaction
        {
            PatronId = patron.Id,
            BookId = book.Id,
            CashierId = adminId,
            BorrowDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(extensionDays),
            Status = TransactionStatus.Active,
            RenewalCount = 1,
            GatePassCode = $"GP-{Random.Shared.Next(100000, 999999)}",
            ConditionNotes = $"FAST-LANE OVERRIDE: {request.Justification} (Authorized interval: {request.ExtensionInterval})"
        };

        await _borrowRepository.AddAsync(transaction);
        await _borrowRepository.SaveChangesAsync();
        await _bookRepository.SaveChangesAsync();

        return (true, transaction, null);
    }

    public async Task<(bool Success, BorrowTransaction? Transaction, string? Error)> ForceRenewLoanAsync(Guid loanId, ForceRenewLoanRequest request, Guid adminId)
    {
        var loan = await _borrowRepository.GetByIdAsync(loanId);
        if (loan == null)
            return (false, null, "Active loan record not found.");

        int days = request.ExtensionDays > 0 ? request.ExtensionDays : 14;
        loan.DueDate = (loan.DueDate > DateTime.UtcNow ? loan.DueDate : DateTime.UtcNow).AddDays(days);
        loan.RenewalCount++;
        loan.Status = TransactionStatus.Active;
        if (!string.IsNullOrWhiteSpace(request.SpecialApprovalNote))
            loan.ConditionNotes = string.IsNullOrWhiteSpace(loan.ConditionNotes) ? request.SpecialApprovalNote : $"{loan.ConditionNotes} | Note: {request.SpecialApprovalNote}";

        await _borrowRepository.UpdateAsync(loan);
        await _borrowRepository.SaveChangesAsync();

        return (true, loan, null);
    }
}
