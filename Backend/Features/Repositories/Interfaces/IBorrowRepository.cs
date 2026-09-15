// [Layer: Features/Repositories/Interfaces]
// IBorrowRepository.cs -- Contract for circulation loan transactions data access via EF Core.
// Defines queries for active borrowings, loan history, and overdue loans.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;

namespace Backend.Features.Repositories.Interfaces;

public interface IBorrowRepository
{
    Task<BorrowTransaction?> GetByIdAsync(Guid id);
    Task<List<BorrowTransaction>> GetActiveByPatronIdAsync(Guid patronId);
    Task<List<BorrowTransaction>> GetAllByPatronIdAsync(Guid patronId);
    Task<List<BorrowTransaction>> GetOverdueLoansAsync();
    Task<List<BorrowTransaction>> GetAllLedgerAsync(TransactionStatus? status = null);
    Task AddAsync(BorrowTransaction transaction);
    Task UpdateAsync(BorrowTransaction transaction);
    Task<bool> SaveChangesAsync();
}
