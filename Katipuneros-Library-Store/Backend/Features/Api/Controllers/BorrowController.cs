// [Layer: Features/Api/Controllers]
// BorrowController.cs -- API endpoints for circulation desk checkouts, returns, extensions, and audit.
// Parses requests, validates DTOs, calls IBorrowService, and returns IActionResult.
// DO NOT put business logic or direct database queries here.

using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data.Enums;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BorrowController : ControllerBase
{
    private readonly IBorrowService _borrowService;

    public BorrowController(IBorrowService borrowService) =>
        _borrowService = borrowService;

    [HttpPost("checkout")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid checkout request payload."))
            : await _borrowService.CheckoutAsync(
                request.PatronId,
                request.BookBarcodes,
                request.DueDate ?? DateTime.UtcNow.AddDays(14),
                Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var cid) ? cid : null
            ) switch
            {
                (true, var transactions, _) => Ok(ApiResponse<object>.Ok(transactions, $"Successfully checked out {transactions.Count} volumes.")),
                (false, _, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Circulation checkout failed."))
            };

    [HttpPost("return")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> ReturnBook([FromBody] ReturnRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid return request payload."))
            : await _borrowService.ReturnBookAsync(
                request.Barcode,
                request.ConditionNotes,
                request.DamageFee,
                Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var cid) ? cid : null
            ) switch
            {
                (true, var transaction, var fine, _) => Ok(ApiResponse<object>.Ok(new
                {
                    Transaction = transaction,
                    AssessedFine = fine,
                    ClearanceStatus = fine > 0 ? "PendingFinePayment" : "Cleared"
                }, fine > 0 ? $"Return completed. Overdue/condition penalty of ₱{fine:F2} assessed." : "Book successfully returned to active stacks.")),
                (false, _, _, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Return processing failed."))
            };

    [HttpPost("{id:guid}/renew")]
    [Authorize]
    public async Task<IActionResult> Renew(Guid id) =>
        !Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var patronId)
            ? Unauthorized(ApiResponse<object>.Fail("Invalid patron identity token."))
            : await _borrowService.RenewLoanAsync(id, patronId) switch
            {
                (true, var transaction, _) => Ok(ApiResponse<object>.Ok(transaction!, "Loan period extended (+7 Days).")),
                (false, _, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Renewal request rejected."))
            };

    [HttpGet("my-loans")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyActiveLoans() =>
        !Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var patronId)
            ? Unauthorized(ApiResponse<object>.Fail("Invalid patron identity token."))
            : Ok(ApiResponse<object>.Ok(await _borrowService.GetPatronActiveLoansAsync(patronId)));

    [HttpGet("my-history")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyLoanHistory() =>
        !Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var patronId)
            ? Unauthorized(ApiResponse<object>.Fail("Invalid patron identity token."))
            : Ok(ApiResponse<object>.Ok(await _borrowService.GetPatronLoanHistoryAsync(patronId)));

    [HttpGet("ledger")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> GetCirculationLedger([FromQuery] TransactionStatus? status) =>
        Ok(ApiResponse<object>.Ok(await _borrowService.GetAuditLedgerAsync(status)));

    [HttpGet("metrics")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> GetMetrics() =>
        Ok(ApiResponse<BorrowingMetricsResponse>.Ok(await _borrowService.GetMetricsAsync()));

    [HttpGet("admin-ledger")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> GetAdminLedger([FromQuery] string? status, [FromQuery] string? query) =>
        Ok(ApiResponse<object>.Ok(await _borrowService.GetAllAdminBorrowingsAsync(status, query)));

    [HttpPost("override")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> LoanOverride([FromBody] LoanOverrideRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid loan override request payload."))
            : !Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var adminId)
                ? Unauthorized(ApiResponse<object>.Fail("Invalid librarian identity token."))
                : await _borrowService.CreateLoanOverrideAsync(request, adminId) switch
                {
                    (true, var transaction, _) => Ok(ApiResponse<object>.Ok(transaction!, "Manual loan override granted and logged in audit register.")),
                    (false, _, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Loan override failed."))
                };

    [HttpPost("{id:guid}/force-renew")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> ForceRenew(Guid id, [FromBody] ForceRenewLoanRequest request) =>
        !Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var adminId)
            ? Unauthorized(ApiResponse<object>.Fail("Invalid librarian identity token."))
            : await _borrowService.ForceRenewLoanAsync(id, request, adminId) switch
            {
                (true, var transaction, _) => Ok(ApiResponse<object>.Ok(transaction!, $"Loan extension authorized (+{request.ExtensionDays} Days).")),
                (false, _, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Force renewal failed."))
            };

    [HttpGet("export")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> ExportBorrowings([FromQuery] ExportBorrowingsQuery query)
    {
        var records = await _borrowService.GetAllAdminBorrowingsAsync();

        if (query.StartDate.HasValue)
            records = records.Where(r => r.BorrowDate >= query.StartDate.Value).ToList();
        if (query.EndDate.HasValue)
            records = records.Where(r => r.BorrowDate <= query.EndDate.Value).ToList();

        if (!string.IsNullOrWhiteSpace(query.AlphabeticalFilter))
        {
            var letter = query.AlphabeticalFilter.Trim().ToLower();
            records = records.Where(r =>
                r.BookTitle.ToLower().Contains(letter) ||
                r.PatronName.ToLower().Contains(letter)).ToList();
        }

        if (!string.IsNullOrWhiteSpace(query.IdFilter))
        {
            var idPart = query.IdFilter.Trim().ToLower();
            records = records.Where(r =>
                r.LoanCode.ToLower().Contains(idPart) ||
                r.PatronLibraryId.ToLower().Contains(idPart)).ToList();
        }

        if (string.Equals(query.SortDirection, "desc", StringComparison.OrdinalIgnoreCase))
            records = records.OrderByDescending(r => r.BorrowDate).ToList();
        else
            records = records.OrderBy(r => r.BorrowDate).ToList();

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("LoanCode,PatronName,PatronLibraryId,PatronRole,BookTitle,BookBarcode,BorrowDate,DueDate,DaysRemaining,RenewalCount,Status,AssessedFine,Notes");
        foreach (var r in records)
        {
            sb.AppendLine($"\"{r.LoanCode}\",\"{r.PatronName.Replace("\"", "\"\"")}\",\"{r.PatronLibraryId}\",\"{r.PatronRole}\",\"{r.BookTitle.Replace("\"", "\"\"")}\",\"{r.BookBarcode}\",\"{r.BorrowDate:yyyy-MM-dd}\",\"{r.DueDate:yyyy-MM-dd}\",{r.DaysRemaining},{r.RenewalCount},\"{r.Status}\",{r.AssessedFine},\"{r.Notes?.Replace("\"", "\"\"")}\"");
        }

        var bytes = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv", $"Circulation_Loan_Ledger_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv");
    }
}
