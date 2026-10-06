// [Layer: Api/Controllers]
// CashierController.cs -- REST API endpoints for Cashier dashboard telemetry, intake queues, and circulation ledger.
// Uses clean expression-bodied lambda syntax (=>) across all actions.
// DO NOT put business logic, validation algorithms, or direct DB queries here.

using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Api.Controllers;

[ApiController]
[Route("api/cashier")]
[Authorize(Roles = "Cashier,Admin")]
public class CashierController : ControllerBase
{
    private readonly ICashierService _cashierService;

    public CashierController(ICashierService cashierService) =>
        _cashierService = cashierService;

    /// <summary> Retrieve active Cashier dashboard KPI counts and drawer balance </summary>
    [HttpGet("dashboard-kpis")]
    [ProducesResponseType(typeof(ApiResponse<CashierDashboardKpisResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboardKpis() =>
        Ok(ApiResponse<CashierDashboardKpisResponse>.Ok(await _cashierService.GetDashboardKpisAsync()));

    /// <summary> Retrieve pending reservation intake queue items for desk review </summary>
    [HttpGet("intake-queue")]
    public async Task<IActionResult> GetIntakeQueue() =>
        Ok(ApiResponse<object>.Ok(await _cashierService.GetIntakeQueueAsync()));

    /// <summary> Retrieve overdue loans queue for desk check-in </summary>
    [HttpGet("overdue-queue")]
    public async Task<IActionResult> GetOverdueQueue() =>
        Ok(ApiResponse<object>.Ok(await _cashierService.GetOverdueQueueAsync()));

    /// <summary> Query circulation journal transactions with filtering </summary>
    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions([FromQuery] CashierTransactionFilterRequest request)
    {
        var (items, total) = await _cashierService.GetTransactionsLedgerAsync(request);
        return Ok(ApiResponse<object>.Ok(new { items, totalCount = total }));
    }

    /// <summary> Export circulation transaction ledger as CSV </summary>
    [HttpGet("transactions/export")]
    public async Task<IActionResult> ExportTransactionsCsv([FromQuery] DateTime? date)
    {
        var csvBytes = await _cashierService.ExportTransactionsCsvAsync(date);
        return File(csvBytes, "text/csv", $"cashier_transactions_{(date?.ToString("yyyyMMdd") ?? "all")}.csv");
    }

    /// <summary> Retrieve current cashier shift summary and register status </summary>
    [HttpGet("shift-status")]
    public async Task<IActionResult> GetShiftStatus()
    {
        var name = User?.Identity?.Name ?? User?.FindFirst(ClaimTypes.Name)?.Value;
        return Ok(ApiResponse<CashierShiftSummaryResponse>.Ok(await _cashierService.GetShiftSummaryAsync(name)));
    }
}
