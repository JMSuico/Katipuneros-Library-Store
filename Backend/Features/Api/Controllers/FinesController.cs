// [Layer: Features/Api/Controllers]
// FinesController.cs -- API endpoints for overdue fine settlements, supervisor waivers, and ledger audits.
// Parses requests, validates DTOs, calls IFineService, and returns IActionResult.
// DO NOT put business logic or direct database queries here.

using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FinesController : ControllerBase
{
    private readonly IFineService _fineService;

    public FinesController(IFineService fineService) =>
        _fineService = fineService;

    [HttpGet("my-fines")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyFines() =>
        !Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var patronId)
            ? Unauthorized(ApiResponse<object>.Fail("Invalid patron identity token."))
            : Ok(ApiResponse<object>.Ok(await _fineService.GetPatronFinesAsync(patronId)));

    [HttpGet]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> GetAllFines([FromQuery] string? status) =>
        Ok(ApiResponse<object>.Ok(await _fineService.GetAllFinesAsync(status)));

    [HttpPost("{id:guid}/settle")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> SettleFine(Guid id, [FromBody] SettleFineRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid settlement payload."))
            : await _fineService.SettleFineAsync(id, request.AmountPaid, request.PaymentMethod) switch
            {
                (true, _) => Ok(ApiResponse<object>.Ok(new { id, request.AmountPaid }, $"Payment of ₱{request.AmountPaid:F2} via {request.PaymentMethod} recorded.")),
                (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Settlement processing failed."))
            };

    [HttpPut("{id:guid}/waive")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> WaiveFine(Guid id, [FromBody] WaiveFineRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid waiver payload."))
            : !Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var supervisorId)
                ? Unauthorized(ApiResponse<object>.Fail("Invalid supervisor identity token."))
                : await _fineService.WaiveFineAsync(id, supervisorId, request.Reason) switch
                {
                    (true, _) => Ok(ApiResponse<object>.Ok(new { id }, "Fine waiver authorized and ledger balance cleared.")),
                    (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Fine waiver authorization failed."))
                };
}
