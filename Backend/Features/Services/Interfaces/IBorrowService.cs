// [Layer: Features/Services/Interfaces]
// IBorrowService.cs -- Contract for circulation loan workflows, checkout, renewals, and returns.
// Defines business rules for loan duration, limits, overdue tariffs, and condition grading.
// DO NOT put data access, raw SQL, or HTTP concerns here.

using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;

namespace Backend.Features.Services.Interfaces;

public interface IBorrowService
{
    Task<(bool Success, List<BorrowTransaction> Transactions, string? Error)> CheckoutAsync(Guid patronId, List<string> bookBarcodes, DateTime dueDate, Guid? cashierId);
    Task<(bool Success, BorrowTransaction? Transaction, string? Error)> RenewLoanAsync(Guid loanId, Guid patronId);
    Task<(bool Success, BorrowTransaction? Transaction, decimal AssessedFine, string? Error)> ReturnBookAsync(string barcode, string? condition, decimal? damageFee, Guid? cashierId);
    Task<List<BorrowTransaction>> GetPatronActiveLoansAsync(Guid patronId);
    Task<List<BorrowTransaction>> GetPatronLoanHistoryAsync(Guid patronId);
    Task<List<BorrowTransaction>> GetAuditLedgerAsync(TransactionStatus? status = null);
}
