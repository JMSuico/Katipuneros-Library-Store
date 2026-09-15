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
}
