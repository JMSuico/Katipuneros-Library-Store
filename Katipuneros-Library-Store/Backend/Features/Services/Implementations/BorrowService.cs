// [Layer: Features/Services/Implementations]
// BorrowService.cs -- Implementation of circulation loan and returns workflows.
// Enforces borrowing limits, loan caps, renewal limits, overdue tariffs, condition grading, and concurrency transactions.
// AppDbContext injected for explicit database transactions (BeginTransactionAsync) and atomic inventory concurrency.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data;
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Helpers.Infrastructure;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class BorrowService : IBorrowService
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    private readonly AppDbContext _context;
    private readonly IBorrowRepository _borrowRepository;
    private readonly IBookRepository _bookRepository;
    private readonly IBookCopyRepository _bookCopyRepository;
    private readonly IUserRepository _userRepository;
    private readonly IFineRepository _fineRepository;
    private readonly IReservationRepository _reservationRepository;
    private readonly ISettingsRepository _settingsRepository;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;

    public BorrowService(
        AppDbContext context,
        IBorrowRepository borrowRepository,
        IBookRepository bookRepository,
        IBookCopyRepository bookCopyRepository,
        IUserRepository userRepository,
        IFineRepository fineRepository,
        IReservationRepository reservationRepository,
        ISettingsRepository settingsRepository,
        IConfiguration configuration,
        IEmailService emailService) =>
        (_context, _borrowRepository, _bookRepository, _bookCopyRepository, _userRepository, _fineRepository, _reservationRepository, _settingsRepository, _configuration, _emailService) =
        (context, borrowRepository, bookRepository, bookCopyRepository, userRepository, fineRepository, reservationRepository, settingsRepository, configuration, emailService);

    public async Task<List<BorrowTransaction>> GetPatronActiveLoansAsync(Guid patronId) =>
        await _borrowRepository.GetActiveByPatronIdAsync(patronId);

    public async Task<List<BorrowTransaction>> GetPatronLoanHistoryAsync(Guid patronId) =>
        await _borrowRepository.GetAllByPatronIdAsync(patronId);

    public async Task<List<BorrowTransaction>> GetAuditLedgerAsync(TransactionStatus? status = null) =>
        await _borrowRepository.GetAllLedgerAsync(status);

    private async Task<CirculationPolicyResponse> GetCirculationPolicyAsync()
    {
        var circPolicy = new CirculationPolicyResponse();
        try
        {
            var setting = await _settingsRepository.GetByKeyAsync("circulation_policy");
            if (setting != null && !string.IsNullOrWhiteSpace(setting.Value))
            {
                var parsed = JsonSerializer.Deserialize<CirculationPolicyResponse>(setting.Value, JsonOptions);
                if (parsed != null) circPolicy = parsed;
            }
        }
        catch
        {
            // Fallback to default institutional circulation policy
        }
        return circPolicy;
    }

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
            // Fallback to default institutional fine tariffs
        }
        return fineTariffs;
    }

    private static TierPolicyDto GetPatronTier(User? patron, CirculationPolicyResponse policy)
    {
        if (patron == null) return policy.Tier1;

        var emp = patron.EmploymentStatus ?? string.Empty;
        if (patron.Role == UserRole.Admin ||
            emp.Contains("Faculty", StringComparison.OrdinalIgnoreCase) ||
            emp.Contains("Doctoral", StringComparison.OrdinalIgnoreCase) ||
            emp.Contains("Professor", StringComparison.OrdinalIgnoreCase))
        {
            return policy.Tier3;
        }

        if (emp.Contains("Graduate", StringComparison.OrdinalIgnoreCase) ||
            emp.Contains("Master", StringComparison.OrdinalIgnoreCase) ||
            patron.Role == UserRole.Cashier)
        {
            return policy.Tier2;
        }

        return policy.Tier1;
    }

    public async Task<(bool Success, List<BorrowTransaction> Transactions, string? Error)> CheckoutAsync(
        Guid patronId,
        List<string> bookBarcodes,
        DateTime? dueDate = null,
        Guid? cashierId = null,
        string? pickupPin = null,
        Guid? reservationId = null) =>
        await ExecuteAsync<(bool Success, List<BorrowTransaction> Transactions, string? Error)>(async () =>
        {
            var patron = await _userRepository.GetByIdAsync(patronId);
            if (patron == null || !patron.IsActive)
                return (false, new List<BorrowTransaction>(), "Patron record is invalid or currently suspended.");

            var activeLoans = await _borrowRepository.GetActiveByPatronIdAsync(patronId);
            var circPolicy = await GetCirculationPolicyAsync();
            var patronTier = GetPatronTier(patron, circPolicy);

            int maxAllowed = patronTier.MaxConcurrency > 0
                ? patronTier.MaxConcurrency
                : (int.TryParse(_configuration["LibraryPolicy:MaxActiveBorrowingsPerPatron"], out int cap) ? cap : 3);

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

            // Wrap multi-table checkout operations in explicit database transaction with RepeatableRead isolation
            using var dbTx = await _context.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead);
            try
            {
                int defaultLoanDays = patronTier.DaysDuration > 0 ? patronTier.DaysDuration : 14;
                DateTime effectiveDueDate = dueDate.HasValue && dueDate.Value > DateTime.UtcNow
                    ? dueDate.Value
                    : DateTime.UtcNow.AddDays(defaultLoanDays);

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
                    {
                        await dbTx.RollbackAsync();
                        return (false, new List<BorrowTransaction>(), $"Book barcode or copy identifier '{barcode}' not found in registry.");
                    }

                    // Check if there is an active reservation for this book
                    var matchedHold = (explicitReservation != null && explicitReservation.BookId == book.Id)
                        ? explicitReservation
                        : activeHolds.FirstOrDefault(r => r.BookId == book.Id);

                    if (matchedHold != null)
                    {
                        if (string.IsNullOrWhiteSpace(pickupPin) ||
                            !string.Equals(pickupPin.Trim(), matchedHold.LockerPin?.Trim(), StringComparison.OrdinalIgnoreCase))
                        {
                            await dbTx.RollbackAsync();
                            return (false, new List<BorrowTransaction>(), "Invalid 4-digit Pickup PIN for this reservation hold.");
                        }

                        if (!reservationsToFulfill.Any(r => r.Id == matchedHold.Id))
                        {
                            reservationsToFulfill.Add(matchedHold);
                        }
                    }

                    // Validate copy status if direct accession copy scanned
                    if (copy != null && copy.Status != CopyStatus.Available)
                    {
                        await dbTx.RollbackAsync();
                        return (false, new List<BorrowTransaction>(), $"Copy '{copy.AccessionNumber}' of '{book.Title}' is not available for loan (current status: {copy.Status}).");
                    }

                    // Enforce atomic inventory check
                    if (book.AvailableCopies <= 0)
                    {
                        await dbTx.RollbackAsync();
                        return (false, new List<BorrowTransaction>(), $"No physical copies of '{book.Title}' are currently available on shelf.");
                    }

                    // Allocate physical copy with pessimistic row lock if not already resolved
                    if (copy == null)
                    {
                        copy = await _bookCopyRepository.GetAvailableCopyAsync(book.Id);
                    }

                    if (copy == null && book.AvailableCopies > 0)
                    {
                        var maxNum = await _bookCopyRepository.GetMaxCopyNumberAsync(book.Id);
                        var nextNum = maxNum + 1;
                        var rawIsbn = !string.IsNullOrWhiteSpace(book.Isbn) ? book.Isbn.Replace("-", "").Trim() : "ITEM";
                        var accession = $"ACC-{rawIsbn}-{nextNum:D2}";
                        copy = new BookCopy
                        {
                            BookId = book.Id,
                            CopyNumber = nextNum,
                            AccessionNumber = accession,
                            QrCodeData = $"KP:COPY:{book.Id}:{accession}",
                            Status = CopyStatus.Borrowed,
                            Condition = "Good",
                            BayLocation = book.BayLocation,
                            AcquiredDate = DateTime.UtcNow
                        };
                        await _context.BookCopies.AddAsync(copy);
                    }
                    else if (copy != null)
                    {
                        copy.Status = CopyStatus.Borrowed;
                        await _bookCopyRepository.UpdateAsync(copy);
                    }

                    if (copy == null)
                    {
                        await dbTx.RollbackAsync();
                        return (false, new List<BorrowTransaction>(), $"No physical copies of '{book.Title}' are currently available on shelf.");
                    }

                    // Enforce atomic inventory decrement on Book.AvailableCopies
                    var rowsAffected = await _context.Books
                        .Where(b => b.Id == book.Id && b.AvailableCopies > 0)
                        .ExecuteUpdateAsync(s => s.SetProperty(b => b.AvailableCopies, b => b.AvailableCopies - 1));

                    if (rowsAffected <= 0)
                    {
                        await dbTx.RollbackAsync();
                        return (false, new List<BorrowTransaction>(), $"No physical copies of '{book.Title}' are currently available on shelf.");
                    }

                    book.AvailableCopies = Math.Max(0, book.AvailableCopies - 1);

                    var transaction = new BorrowTransaction
                    {
                        PatronId = patronId,
                        BookId = book.Id,
                        BookCopyId = copy.Id,
                        CashierId = cashierId,
                        BorrowDate = DateTime.UtcNow,
                        DueDate = effectiveDueDate,
                        Status = TransactionStatus.Active,
                        RenewalCount = 0,
                        GatePassCode = $"KP-TXN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}"
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

                DetachModifiedGraph();

                await _bookCopyRepository.SaveChangesAsync();
                await _borrowRepository.SaveChangesAsync();
                if (reservationsToFulfill.Count > 0)
                {
                    await _reservationRepository.SaveChangesAsync();
                }

                await dbTx.CommitAsync();
            }
            catch (Exception ex)
            {
                await dbTx.RollbackAsync();
                return (false, new List<BorrowTransaction>(), $"Checkout transaction aborted due to database concurrency conflict: {ex.Message}");
            }

            // Dispatch loan notification emails only AFTER database transaction is committed
            foreach (var loan in created)
            {
                loan.Patron = patron;
                loan.Book = await _bookRepository.GetByIdAsync(loan.BookId);
                if (loan.BookCopyId.HasValue)
                {
                    loan.BookCopy = await _bookCopyRepository.GetByIdAsync(loan.BookCopyId.Value);
                }
                await _emailService.SendLoanNotificationAsync(loan, "Checkout");
            }

            return (true, created, null);
        });

    public async Task<(bool Success, BorrowTransaction? Transaction, string? Error)> RenewLoanAsync(Guid loanId, Guid patronId) =>
        await _borrowRepository.GetByIdAsync(loanId) is not { } loan || loan.PatronId != patronId || loan.Status != TransactionStatus.Active
            ? (false, null, "Active loan record not found.")
            : await ExecuteLoanRenewalAsync(loan);

    private async Task<(bool Success, BorrowTransaction? Transaction, string? Error)> ExecuteLoanRenewalAsync(BorrowTransaction loan) =>
        await ExecuteAsync<(bool Success, BorrowTransaction? Transaction, string? Error)>(async () =>
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
        });

    public async Task<(bool Success, BorrowTransaction? Transaction, decimal AssessedFine, string? Error)> ReturnBookAsync(
        string barcode,
        string? condition,
        decimal? damageFee,
        Guid? cashierId,
        Guid? bookCopyId = null,
        string? expressCode = null,
        string? pickupPin = null,
        Guid? reservationId = null) =>
        await ExecuteAsync<(bool Success, BorrowTransaction? Transaction, decimal AssessedFine, string? Error)>(async () =>
        {
            var cleanBarcode = barcode?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(cleanBarcode))
            {
                if (!string.IsNullOrWhiteSpace(expressCode)) cleanBarcode = expressCode.Trim();
                else if (!string.IsNullOrWhiteSpace(pickupPin)) cleanBarcode = pickupPin.Trim();
                else if (reservationId.HasValue && reservationId.Value != Guid.Empty) cleanBarcode = reservationId.Value.ToString();
            }

            BookCopy? copy = bookCopyId.HasValue ? await _bookCopyRepository.GetByIdAsync(bookCopyId.Value) : null;
            Book? book = copy?.Book;
            BorrowTransaction? activeLoan = null;

            // a. Copy accession number / barcode via _bookCopyRepository.FindByCodeAsync(cleanBarcode)
            if (copy == null && !string.IsNullOrWhiteSpace(cleanBarcode))
            {
                copy = await _bookCopyRepository.FindByCodeAsync(cleanBarcode);
            }
            if (copy != null)
            {
                book ??= copy.Book ?? await _bookRepository.GetByIdAsync(copy.BookId);
                activeLoan = await _borrowRepository.GetActiveByCopyIdOrBookIdAsync(copy.Id, copy.BookId);
            }

            // b. Book ISBN / barcode via _bookRepository.GetByBarcodeAsync(cleanBarcode)
            if (activeLoan == null && !string.IsNullOrWhiteSpace(cleanBarcode))
            {
                if (book == null)
                {
                    book = await _bookRepository.GetByBarcodeAsync(cleanBarcode);
                }
                if (book != null)
                {
                    activeLoan = await _borrowRepository.GetActiveByCopyIdOrBookIdAsync(copy?.Id, book.Id);
                }
            }

            // c. Transaction GatePassCode (e.g. KP-TXN-YYYYMMDD-XXXXXX)
            if (activeLoan == null && !string.IsNullOrWhiteSpace(cleanBarcode))
            {
                var allActiveLoans = await _borrowRepository.GetAllLedgerAsync(TransactionStatus.Active);
                activeLoan = allActiveLoans.FirstOrDefault(l =>
                    !string.IsNullOrWhiteSpace(l.GatePassCode) &&
                    l.GatePassCode.Equals(cleanBarcode, StringComparison.OrdinalIgnoreCase));
            }

            // d. Transaction Id (GUID)
            if (activeLoan == null && Guid.TryParse(cleanBarcode, out var transactionId))
            {
                var loanById = await _borrowRepository.GetByIdAsync(transactionId);
                if (loanById != null && loanById.Status == TransactionStatus.Active)
                {
                    activeLoan = loanById;
                }
            }

            // e. ExpressCode format (SCAN-BAY-XXXXXX)
            if (activeLoan == null)
            {
                string? expressId = null;
                if (cleanBarcode.StartsWith("SCAN-BAY-", StringComparison.OrdinalIgnoreCase) && cleanBarcode.Length >= "SCAN-BAY-".Length)
                {
                    expressId = cleanBarcode.Substring("SCAN-BAY-".Length).Trim();
                }
                else if (!string.IsNullOrWhiteSpace(expressCode))
                {
                    var rawExpress = expressCode.Trim();
                    expressId = rawExpress.StartsWith("SCAN-BAY-", StringComparison.OrdinalIgnoreCase) && rawExpress.Length >= "SCAN-BAY-".Length
                        ? rawExpress.Substring("SCAN-BAY-".Length).Trim()
                        : rawExpress;
                }

                if (!string.IsNullOrWhiteSpace(expressId))
                {
                    var allReservations = await _reservationRepository.GetAllWithDetailsAsync();
                    var matchedReservation = allReservations.FirstOrDefault(r =>
                        r.Id.ToString().Replace("-", "").StartsWith(expressId, StringComparison.OrdinalIgnoreCase) ||
                        r.Id.ToString().StartsWith(expressId, StringComparison.OrdinalIgnoreCase));

                    if (matchedReservation != null)
                    {
                        var patronLoans = await _borrowRepository.GetActiveByPatronIdAsync(matchedReservation.PatronId);
                        activeLoan = patronLoans.FirstOrDefault(l => l.BookId == matchedReservation.BookId);
                        if (activeLoan != null && book == null)
                        {
                            book = matchedReservation.Book ?? await _bookRepository.GetByIdAsync(matchedReservation.BookId);
                        }
                    }
                }
            }

            // f. 4-Digit Pickup PIN (e.g. cleanBarcode is 4 digits)
            if (activeLoan == null)
            {
                string? pinTarget = null;
                if (cleanBarcode.Length == 4 && cleanBarcode.All(char.IsDigit))
                {
                    pinTarget = cleanBarcode;
                }
                else if (!string.IsNullOrWhiteSpace(pickupPin) && pickupPin.Trim().Length == 4 && pickupPin.Trim().All(char.IsDigit))
                {
                    pinTarget = pickupPin.Trim();
                }

                if (!string.IsNullOrWhiteSpace(pinTarget))
                {
                    var allReservations = await _reservationRepository.GetAllWithDetailsAsync();
                    var matchedReservations = allReservations.Where(r => r.LockerPin == pinTarget).ToList();
                    foreach (var res in matchedReservations)
                    {
                        var patronLoans = await _borrowRepository.GetActiveByPatronIdAsync(res.PatronId);
                        activeLoan = patronLoans.FirstOrDefault(l => l.BookId == res.BookId);
                        if (activeLoan != null)
                        {
                            if (book == null)
                            {
                                book = res.Book ?? await _bookRepository.GetByIdAsync(res.BookId);
                            }
                            break;
                        }
                    }
                }
            }

            // g. Reservation ID (GUID)
            if (activeLoan == null)
            {
                Guid? targetResId = null;
                if (reservationId.HasValue && reservationId.Value != Guid.Empty)
                {
                    targetResId = reservationId.Value;
                }
                else if (Guid.TryParse(cleanBarcode, out var parsedResGuid))
                {
                    targetResId = parsedResGuid;
                }

                if (targetResId.HasValue)
                {
                    var res = await _reservationRepository.GetByIdAsync(targetResId.Value);
                    if (res != null)
                    {
                        var patronLoans = await _borrowRepository.GetActiveByPatronIdAsync(res.PatronId);
                        activeLoan = patronLoans.FirstOrDefault(l => l.BookId == res.BookId);
                        if (activeLoan != null && book == null)
                        {
                            book = res.Book ?? await _bookRepository.GetByIdAsync(res.BookId);
                        }
                    }
                }
            }

            if (activeLoan == null)
            {
                return (false, null, 0, $"No active circulation loan found matching slip code '{barcode}'. Please check the ExpressCode or copy barcode.");
            }

            if (book == null)
            {
                book = await _bookRepository.GetByIdAsync(activeLoan.BookId);
            }

            if (book == null)
            {
                return (false, null, 0, $"Book barcode or asset identifier '{barcode}' not found.");
            }

            if (copy == null && activeLoan.BookCopyId.HasValue)
            {
                copy = await _bookCopyRepository.GetByIdAsync(activeLoan.BookCopyId.Value);
            }

            // Determine condition and update physical copy if present
            var conditionStr = string.IsNullOrWhiteSpace(condition) ? "Good" : condition.Trim();
            bool isDamaged = conditionStr.Equals("Damaged", StringComparison.OrdinalIgnoreCase);
            bool isLost = conditionStr.Equals("Lost", StringComparison.OrdinalIgnoreCase);

            decimal totalFine = 0;

            // Wrap operations in explicit database transaction with RepeatableRead isolation
            using var dbTx = await _context.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead);
            try
            {
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

                // Perform atomic inventory increment bounded by TotalCopies (only restore if physically available)
                if (!isDamaged && !isLost)
                {
                    await _context.Books
                        .Where(b => b.Id == book.Id && b.AvailableCopies < b.TotalCopies)
                        .ExecuteUpdateAsync(s => s.SetProperty(b => b.AvailableCopies, b => b.AvailableCopies + 1));

                    book.AvailableCopies = Math.Min(book.TotalCopies, book.AvailableCopies + 1);
                }

                // Dynamic statutory fine tariffs and circulation policy
                var fineTariffs = await GetFineTariffsAsync();
                var circPolicy = await GetCirculationPolicyAsync();

                decimal dailyFine = fineTariffs.DailyOverdueTariff > 0
                    ? fineTariffs.DailyOverdueTariff
                    : (decimal.TryParse(_configuration["LibraryPolicy:DailyOverdueFineRate"], out decimal fr) ? fr : 15.00m);
                decimal fineCap = fineTariffs.MaxPenaltyCap > 0
                    ? fineTariffs.MaxPenaltyCap
                    : (decimal.TryParse(_configuration["LibraryPolicy:MaximumFineCap"], out decimal fc) ? fc : 500.00m);

                if (activeLoan.Patron == null)
                {
                    activeLoan.Patron = await _userRepository.GetByIdAsync(activeLoan.PatronId);
                }

                int gracePeriodHours = circPolicy.GracePeriodHours > 0 ? circPolicy.GracePeriodHours : 24;
                int dynamicGracePeriodDays = (int)Math.Ceiling(gracePeriodHours / 24.0);

                bool isStudentOrCustomer = activeLoan.Patron?.Role == UserRole.Customer ||
                    string.Equals(activeLoan.Patron?.EmploymentStatus, "Student", StringComparison.OrdinalIgnoreCase);
                int gracePeriodDays = isStudentOrCustomer ? dynamicGracePeriodDays : 0;

                if (activeLoan.ReturnDate.HasValue && activeLoan.ReturnDate.Value > activeLoan.DueDate)
                {
                    var rawOverdueDays = (int)Math.Ceiling((activeLoan.ReturnDate.Value - activeLoan.DueDate).TotalDays);
                    var billableDays = Math.Max(0, rawOverdueDays - gracePeriodDays);
                    if (billableDays > 0)
                    {
                        decimal overduePenalty = Math.Min(billableDays * dailyFine, fineCap);
                        totalFine += overduePenalty;
                    }
                }

                if (damageFee.HasValue && damageFee.Value > 0)
                {
                    totalFine += damageFee.Value;
                }
                else if (isDamaged)
                {
                    totalFine += fineTariffs.BindingRepairTariff > 0 ? fineTariffs.BindingRepairTariff : 280.00m;
                }
                else if (isLost)
                {
                    decimal lostAdminFee = fineTariffs.LostBookAdministrativeFee > 0 ? fineTariffs.LostBookAdministrativeFee : 150.00m;
                    totalFine += 500.00m + lostAdminFee;
                }

                DetachModifiedGraph();

                if (totalFine > 0)
                {
                    var fine = new FineTransaction
                    {
                        PatronId = activeLoan.PatronId,
                        BorrowTransactionId = activeLoan.Id,
                        Amount = totalFine,
                        BalanceRemaining = totalFine,
                        Status = "Unpaid",
                        Reason = isLost
                            ? $"Book replacement tariff for lost copy of '{book.Title}'."
                            : $"Overdue return and/or condition assessment ({conditionStr}) penalty for '{book.Title}'."
                    };
                    await _fineRepository.AddAsync(fine);
                    await _fineRepository.SaveChangesAsync();
                }

                await _borrowRepository.UpdateAsync(activeLoan);
                await _borrowRepository.SaveChangesAsync();

                await dbTx.CommitAsync();
            }
            catch (Exception ex)
            {
                await dbTx.RollbackAsync();
                return (false, null, 0, $"Return transaction aborted due to database concurrency conflict: {ex.Message}");
            }

            activeLoan.Book = book;
            await _emailService.SendLoanNotificationAsync(activeLoan, "Returned", totalFine);

            return (true, activeLoan, totalFine, null);
        });

    public async Task<BorrowingMetricsResponse> GetMetricsAsync() =>
        await _borrowRepository.GetBorrowingMetricsAsync();

    public async Task<List<BorrowingDetailResponse>> GetAllAdminBorrowingsAsync(string? status = null, string? query = null) =>
        await ExecuteAsync<List<BorrowingDetailResponse>>(async () =>
        {
            var loans = await _borrowRepository.GetAllWithDetailsAsync(status, query);
            var now = DateTime.UtcNow;

            var fineTariffs = await GetFineTariffsAsync();
            var circPolicy = await GetCirculationPolicyAsync();

            decimal dailyRate = fineTariffs.DailyOverdueTariff > 0
                ? fineTariffs.DailyOverdueTariff
                : (decimal.TryParse(_configuration["LibraryPolicy:DailyOverdueFineRate"], out var configuredRate) ? configuredRate : 15.00m);
            decimal fineCap = fineTariffs.MaxPenaltyCap > 0
                ? fineTariffs.MaxPenaltyCap
                : (decimal.TryParse(_configuration["LibraryPolicy:MaximumFineCap"], out var configuredCap) ? configuredCap : 500.00m);

            int gracePeriodHours = circPolicy.GracePeriodHours > 0 ? circPolicy.GracePeriodHours : 24;
            int dynamicGraceDays = (int)Math.Ceiling(gracePeriodHours / 24.0);

            return loans.Select(b =>
            {
                int daysRemaining = (int)Math.Ceiling((b.DueDate - now).TotalDays);
                bool isOverdue = b.Status == TransactionStatus.Active && b.DueDate < now;
                bool isStudentOrCustomer = b.Patron?.Role == UserRole.Customer ||
                    string.Equals(b.Patron?.EmploymentStatus, "Student", StringComparison.OrdinalIgnoreCase);
                int graceDays = isStudentOrCustomer ? dynamicGraceDays : 0;
                int rawOverdueDays = Math.Max(0, (int)Math.Floor((now - b.DueDate).TotalDays));
                int billableDays = Math.Max(0, rawOverdueDays - graceDays);
                decimal fine = isOverdue
                    ? Math.Min(billableDays * dailyRate, fineCap)
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
        });

    public async Task<(bool Success, BorrowTransaction? Transaction, string? Error)> CreateLoanOverrideAsync(LoanOverrideRequest request, Guid adminId) =>
        await ExecuteAsync<(bool Success, BorrowTransaction? Transaction, string? Error)>(async () =>
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
                await _context.Books
                    .Where(b => b.Id == book.Id && b.AvailableCopies > 0)
                    .ExecuteUpdateAsync(s => s.SetProperty(b => b.AvailableCopies, b => b.AvailableCopies - 1));
                book.AvailableCopies = Math.Max(0, book.AvailableCopies - 1);
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

            DetachModifiedGraph();
            await _borrowRepository.AddAsync(transaction);
            await _borrowRepository.SaveChangesAsync();

            return (true, transaction, null);
        });

    public async Task<(bool Success, BorrowTransaction? Transaction, string? Error)> ForceRenewLoanAsync(Guid loanId, ForceRenewLoanRequest request, Guid adminId) =>
        await ExecuteAsync<(bool Success, BorrowTransaction? Transaction, string? Error)>(async () =>
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
        });

    private void DetachModifiedGraph()
    {
        foreach (var entry in _context.ChangeTracker.Entries<Book>().ToList())
        {
            entry.State = EntityState.Detached;
        }
        foreach (var entry in _context.ChangeTracker.Entries<Category>().ToList())
        {
            entry.State = EntityState.Detached;
        }
        foreach (var entry in _context.ChangeTracker.Entries<User>().ToList())
        {
            entry.State = EntityState.Detached;
        }
    }

    private static async Task<T> ExecuteAsync<T>(Func<Task<T>> action) =>
        await action();
}
