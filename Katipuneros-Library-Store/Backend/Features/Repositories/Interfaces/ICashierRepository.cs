// [Layer: Features/Repositories/Interfaces]
// ICashierRepository.cs -- Repository contract for cashier metrics, circulation queues, and ledger queries.
// Database query interfaces ONLY.
// DO NOT put business logic, controller endpoints, or UI concerns here.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data.Models;

namespace Backend.Features.Repositories.Interfaces;

public interface ICashierRepository
{
    Task<CashierDashboardKpisResponse> GetDashboardKpisAsync();
    Task<List<Reservation>> GetIntakeQueueReservationsAsync(int limit = 5);
    Task<List<BorrowTransaction>> GetOverdueQueueLoansAsync(int limit = 5);
    Task<List<BorrowTransaction>> GetCirculationLedgerAsync(DateTime? date, string? type, string? search, int page = 1, int pageSize = 20);
    Task<int> GetCirculationLedgerCountAsync(DateTime? date, string? type, string? search);
    Task<List<FineTransaction>> GetDailySettledFinesAsync(DateTime date);
}
