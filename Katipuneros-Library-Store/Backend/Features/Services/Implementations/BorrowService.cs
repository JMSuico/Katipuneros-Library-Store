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
    private readonly IBookCopyRepository _bookCopyRepository;
    private readonly IUserRepository _userRepository;
    private readonly IFineRepository _fineRepository;
    private readonly IReservationRepository _reservationRepository;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;

    public BorrowService(
        IBorrowRepository borrowRepository,
        IBookRepository bookRepository,
        IBookCopyRepository bookCopyRepository,
        IUserRepository userRepository,
        IFineRepository fineRepository,
        IReservationRepository reservationRepository,
        IConfiguration configuration,
        IEmailService emailService) =>
        (_borrowRepository, _bookRepository, _bookCopyRepository, _userRepository, _fineRepository, _reservationRepository, _configuration, _emailService) =
        (borrowRepository, bookRepository, bookCopyRepository, userRepository, fineRepository, reservationRepository, configuration, emailService);

    public async Task<List<BorrowTransaction>> GetPatronActiveLoansAsync(Guid patronId) =>
        await _borrowRepository.GetActiveByPatronIdAsync(patronId);

    public async Task<List<BorrowTransaction>> GetPatronLoanHistoryAsync(Guid patronId) =>
        await _borrowRepository.GetAllByPatronIdAsync(patronId);

    public async Task<List<BorrowTransaction>> GetAuditLedgerAsync(TransactionStatus? status = null) =>
        await _borrowRepository.GetAllLedgerAsync(status);

    public async Task<(bool Success, List<BorrowTransaction> Transactions, string? Error)> CheckoutAsync(
        Guid patronId,
        List<string> bookBarcodes,
        DateTime dueDate,
        Guid? cashierId,
        string? pickupPin = null,
        Guid? reservationId = null)
    {
        var patron = await _userRepository.GetByIdAsync(patronId);
        if (patron == null || !patron.IsActive)
            return (false, new List<BorrowTransaction>(), "Patron record is invalid or currently suspended.");

        var activeLoans = await _borrowRepository.GetActiveByPatronIdAsync(patronId);
        int maxAllowed = int.TryParse(_configuration["LibraryPolicy:MaxActiveBorrowingsPerPatron"], out int cap) ? cap : 3;

        if (activeLoans.Count + bookBarcodes.Count > maxAllowed)
            return (false, new List<BorrowTransaction>(), $"Loan quota exceeded. Patrons can have at most {maxAllowed} active loans concurrently (currently active: {activeLoans.Count}).");

        // Validate explicit reservation hold if provided
        Reservation? explicitReservation = null;
        if (reservationId.HasValue && reservationId.Value != Guid.Empty)
        {
            explicitReservation = await _reservationRepository.GetByIdAsync(reservationId.Value);
            if (explicitReservation == null || explicitReservation.PatronId != patronId)
            {
                return (false, new List<BorrowTransaction>(), "Reservation hold not found for this patron.");
            }

            if (string.IsNullOrWhiteSpace(pickupPin) ||
                !string.Equals(pickupPin.Trim(), explicitReservation.LockerPin?.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return (false, new List<BorrowTransaction>(), "Invalid 4-digit Pickup PIN for this reservation hold.");
            }
        }

        // Retrieve active holds for this patron to validate holds for checked out books
        var patronReservations = await _reservationRepository.GetActiveByPatronIdAsync(patronId);
        var activeHolds = patronReservations
            .Where(r => r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.StagedInLocker)
            .ToList();

        var created = new List<BorrowTransaction>();
        var reservationsToFulfill = new List<Reservation>();
        if (explicitReservation != null)
        {
            reservationsToFulfill.Add(explicitReservation);
        }

        foreach (var barcode in bookBarcodes)
        {
            var book = await _bookRepository.GetByBarcodeAsync(barcode);
            BookCopy? copy = null;

            if (book == null)
            {
                // Check if the barcode was an individual copy Accession Number or QR code
                copy = await _bookCopyRepository.FindByCodeAsync(barcode);
                if (copy != null)
                {
                    book = copy.Book ?? await _bookRepository.GetByIdAsync(copy.BookId);
                }
            }

            if (book == null)
                return (false, new List<BorrowTransaction>(), $"Book barcode or copy identifier '{barcode}' not found in registry.");

            // Check if there is an active reservation for this book
            var matchedHold = (explicitReservation != null && explicitReservation.BookId == book.Id)
                ? explicitReservation
                : activeHolds.FirstOrDefault(r => r.BookId == book.Id);

            if (matchedHold != null)
            {
                if (string.IsNullOrWhiteSpace(pickupPin) ||
                    !string.Equals(pickupPin.Trim(), matchedHold.LockerPin?.Trim(), StringComparison.OrdinalIgnoreCase))
                {
                    return (false, new List<BorrowTransaction>(), "Invalid 4-digit Pickup PIN for this reservation hold.");
                }

                if (!reservationsToFulfill.Any(r => r.Id == matchedHold.Id))
                {
                    reservationsToFulfill.Add(matchedHold);
                }
            }

            if (book.AvailableCopies <= 0)
                return (false, new List<BorrowTransaction>(), $"No physical copies of '{book.Title}' are currently available on shelf.");

            if (copy == null)
            {
                copy = await _bookCopyRepository.GetAvailableCopyAsync(book.Id);
            }

            if (copy != null)
            {
                copy.Status = CopyStatus.Borrowed;
                await _bookCopyRepository.UpdateAsync(copy);
            }

            book.AvailableCopies = Math.Max(0, book.AvailableCopies - 1);
            await _bookRepository.UpdateAsync(book);

            var transaction = new BorrowTransaction
            {
                PatronId = patronId,
                BookId = book.Id,
                BookCopyId = copy?.Id,
                CashierId = cashierId,
                BorrowDate = DateTime.UtcNow,
                DueDate = dueDate > DateTime.UtcNow ? dueDate : DateTime.UtcNow.AddDays(14),
                Status = TransactionStatus.Active,
                RenewalCount = 0,
                GatePassCode = $"KP-TXN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}",
                Patron = patron,
                Book = book
            };

            await _borrowRepository.AddAsync(transaction);
            created.Add(transaction);
        }

        // Transition reservation status to Fulfilled upon successful checkout
        foreach (var reservation in reservationsToFulfill)
        {
            reservation.Status = ReservationStatus.Fulfilled;
            reservation.FulfilledDate = DateTime.UtcNow;
            await _reservationRepository.UpdateAsync(reservation);
        }

        await _bookCopyRepository.SaveChangesAsync();
        await _borrowRepository.SaveChangesAsync();
        await _bookRepository.SaveChangesAsync();
        if (reservationsToFulfill.Count > 0)
        {
            await _reservationRepository.SaveChangesAsync();
        }

        foreach (var loan in created)
        {
            await _emailService.SendLoanNotificationAsync(loan, "Checkout");
        }

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

    public async Task<(bool Success, BorrowTransaction? Transaction, decimal AssessedFine, string? Error)> ReturnBookAsync(string barcode, string? condition, decimal? damageFee, Guid? cashierId, Guid? bookCopyId = null)
    {
        var cleanBarcode = barcode.Trim();
        BookCopy? copy = bookCopyId.HasValue ? await _bookCopyRepository.GetByIdAsync(bookCopyId.Value) : null;
        if (copy == null && !string.IsNullOrWhiteSpace(cleanBarcode))
        {
            copy = await _bookCopyRepository.FindByCodeAsync(cleanBarcode);
        }

        Book? book = copy?.Book;
        if (book == null && !string.IsNullOrWhiteSpace(cleanBarcode))
        {
            book = await _bookRepository.GetByBarcodeAsync(cleanBarcode);
        }

        BorrowTransaction? activeLoan = null;
        if (copy != null)
        {
            activeLoan = await _borrowRepository.GetActiveByCopyIdOrBookIdAsync(copy.Id, copy.BookId);
        }

        if (activeLoan == null && book != null)
        {
            activeLoan = await _borrowRepository.GetActiveByCopyIdOrBookIdAsync(null, book.Id);
        }

        if (activeLoan == null)
        {
            var allLoans = await _borrowRepository.GetAllLedgerAsync(TransactionStatus.Active);
            activeLoan = allLoans.FirstOrDefault(l =>
                (l.GatePassCode != null && l.GatePassCode.Equals(cleanBarcode, StringComparison.OrdinalIgnoreCase)) ||
                l.Id.ToString().Equals(cleanBarcode, StringComparison.OrdinalIgnoreCase));

            if (activeLoan != null && book == null)
            {
                book = await _bookRepository.GetByIdAsync(activeLoan.BookId);
            }
        }

        if (book == null && activeLoan != null)
        {
            book = await _bookRepository.GetByIdAsync(activeLoan.BookId);
        }

        if (book == null)
            return (false, null, 0, $"Book barcode or asset identifier '{barcode}' not found.");

        if (activeLoan == null)
            return (false, null, 0, $"No active loan record found for '{book.Title}'.");

        if (copy == null && activeLoan.BookCopyId.HasValue)
        {
            copy = await _bookCopyRepository.GetByIdAsync(activeLoan.BookCopyId.Value);
        }

        // Determine condition and update physical copy if present
        var conditionStr = string.IsNullOrWhiteSpace(condition) ? "Good" : condition.Trim();
        bool isDamaged = conditionStr.Equals("Damaged", StringComparison.OrdinalIgnoreCase);
        bool isLost = conditionStr.Equals("Lost", StringComparison.OrdinalIgnoreCase);

        if (copy != null)
        {
            copy.Status = isDamaged ? CopyStatus.Damaged : isLost ? CopyStatus.Lost : CopyStatus.Available;
            copy.Condition = conditionStr;
            copy.ConditionNotes = condition;
            copy.LastReturnedDate = DateTime.UtcNow;
            await _bookCopyRepository.UpdateAsync(copy);
            await _bookCopyRepository.SaveChangesAsync();
        }

        activeLoan.ReturnDate = DateTime.UtcNow;
        activeLoan.Status = isLost ? TransactionStatus.Lost : TransactionStatus.Returned;
        activeLoan.ConditionNotes = InputSanitizer.SanitizeText(conditionStr);
        if (string.IsNullOrWhiteSpace(activeLoan.GatePassCode))
        {
            activeLoan.GatePassCode = $"KP-TXN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
        }
        if (copy != null) activeLoan.BookCopyId = copy.Id;

        // Only restore available copies if the book is physically available (not damaged or lost)
        if (!isDamaged && !isLost)
        {
            book.AvailableCopies = Math.Min(book.TotalCopies, book.AvailableCopies + 1);
            await _bookRepository.UpdateAsync(book);
        }

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
        else if (isDamaged)
        {
            totalFine += 150.00m; // Default damage assessment
        }
        else if (isLost)
        {
            totalFine += 500.00m; // Default replacement cost
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
                Reason = isLost ? $"Book replacement tariff for lost copy of '{book.Title}'." : $"Overdue return and/or condition assessment ({conditionStr}) penalty for '{book.Title}'."
            };
            await _fineRepository.AddAsync(fine);
            await _fineRepository.SaveChangesAsync();
        }

        await _borrowRepository.UpdateAsync(activeLoan);
        await _borrowRepository.SaveChangesAsync();
        await _bookRepository.SaveChangesAsync();

        activeLoan.Book = book;
        if (activeLoan.Patron == null)
        {
            activeLoan.Patron = await _userRepository.GetByIdAsync(activeLoan.PatronId);
        }
        await _emailService.SendLoanNotificationAsync(activeLoan, "Returned", totalFine);

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
            GatePassCode = $"KP-TXN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}",
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
