// [Layer: Features/Services/Interfaces]
// ICashierService.cs -- Domain service contract for Cashier operations, business validation, and audit ledger.
// DO NOT put HTTP concerns or UI logic here.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;

namespace Backend.Features.Services.Interfaces;

public interface ICashierService
{
    Task<CashierDashboardKpisResponse> GetDashboardKpisAsync();
    Task<List<CashierIntakeQueueItemResponse>> GetIntakeQueueAsync();
    Task<List<CashierOverdueQueueItemResponse>> GetOverdueQueueAsync();
    Task<(List<CashierTransactionItemResponse> Items, int TotalCount)> GetTransactionsLedgerAsync(CashierTransactionFilterRequest request);
    Task<byte[]> ExportTransactionsCsvAsync(DateTime? date);
    Task<CashierShiftSummaryResponse> GetShiftSummaryAsync(string? cashierName);
}
