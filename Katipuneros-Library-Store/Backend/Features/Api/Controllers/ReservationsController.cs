// [Layer: Features/Api/Controllers]
// ReservationsController.cs -- API endpoints for patron holds, waitlist queue, smart locker staging, and triage.
// Parses requests, validates DTOs, calls IReservationService, and returns IActionResult.
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
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservationsController(IReservationService reservationService) =>
        _reservationService = reservationService;

    [HttpGet("metrics")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> GetMetrics() =>
        Ok(ApiResponse<ReservationMetricsResponse>.Ok(await _reservationService.GetMetricsAsync()));

    [HttpGet]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? query) =>
        Ok(ApiResponse<object>.Ok(await _reservationService.GetAllAdminReservationsAsync(status, query)));

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid reservation payload."))
            : !Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var patronId)
                ? Unauthorized(ApiResponse<object>.Fail("Invalid patron identity token."))
                : await _reservationService.CreateReservationAsync(patronId, request.BookId, request.PickupBranch) switch
                {
                    (true, var reservation, _) when reservation != null => Ok(ApiResponse<object>.Ok(reservation, "Hold requested successfully. Available for pickup for 48 hours once staged.")),
                    (_, _, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to place reservation hold."))
                };

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> CancelReservation(Guid id) =>
        !Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var patronId)
            ? Unauthorized(ApiResponse<object>.Fail("Invalid patron identity token."))
            : await _reservationService.CancelReservationAsync(id, patronId) switch
            {
                (true, _) => Ok(ApiResponse<object>.Ok(new { id }, "Reservation hold cancelled.")),
                (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to cancel hold."))
            };

    [HttpGet("my-holds")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyReservations() =>
        !Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var patronId)
            ? Unauthorized(ApiResponse<object>.Fail("Invalid patron identity token."))
            : Ok(ApiResponse<object>.Ok(await _reservationService.GetPatronReservationsAsync(patronId)));

    [HttpGet("pending")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> GetPendingQueue() =>
        Ok(ApiResponse<object>.Ok(await _reservationService.GetPendingReservationsAsync()));

    [HttpPost("{id:guid}/assign-locker")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> AssignLocker(Guid id, [FromBody] AssignLockerRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid locker assignment payload."))
            : await _reservationService.AssignLockerAsync(id, request.LockerBay, request.Pin) switch
            {
                (true, _) => Ok(ApiResponse<object>.Ok(new { id, request.LockerBay }, $"Book staged in smart locker {request.LockerBay}. Notification dispatched to patron.")),
                (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to assign smart locker."))
            };

    [HttpPut("{id:guid}/fulfill")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> FulfillReservation(Guid id) =>
        await _reservationService.FulfillReservationAsync(id) switch
        {
            (true, _) => Ok(ApiResponse<object>.Ok(new { id }, "Hold marked as fulfilled and picked up.")),
            (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to fulfill hold."))
        };

    [HttpPut("{id:guid}/triage")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> Triage(Guid id, [FromBody] TriageReservationRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid triage payload."))
            : await _reservationService.TriageReservationAsync(id, request.Approved, request.Reason, request.Priority) switch
            {
                (true, _) => Ok(ApiResponse<object>.Ok(new { id, request.Approved }, request.Approved ? "Hold approved and queued for staging." : "Hold request rejected.")),
                (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to process triage."))
            };

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateReservationStatusRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid status transition payload."))
            : await _reservationService.UpdateStatusAsync(id, request.Status, request.Notes) switch
            {
                (true, _) => Ok(ApiResponse<object>.Ok(new { id, request.Status }, $"Hold status transitioned to {request.Status}.")),
                (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to update reservation status."))
            };

    [HttpPost("batch-clearance")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> BatchClearance([FromBody] BatchClearanceRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid batch clearance payload."))
            : await _reservationService.BatchClearanceAsync(request.HoldIds, request.Action, request.LockerBay) switch
            {
                (true, var count, _) => Ok(ApiResponse<object>.Ok(new { count, request.Action }, $"{count} reservation holds updated via batch {request.Action}.")),
                (false, _, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to process batch clearance."))
            };

    [HttpPost("{id:guid}/notify")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> NotifyPatron(Guid id, [FromBody] NotifyPatronRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid notification dispatch payload."))
            : await _reservationService.NotifyPatronAsync(id, request.Channel, request.CustomMessage) switch
            {
                (true, var message, _) => Ok(ApiResponse<object>.Ok(new { id, request.Channel }, message ?? "Notification dispatched successfully.")),
                (false, _, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to dispatch notification."))
            };

    [HttpGet("diagnostics")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> GetLockerDiagnostics() =>
        Ok(ApiResponse<LockerDiagnosticsResponse>.Ok(await _reservationService.GetLockerDiagnosticsAsync()));

    [HttpGet("export")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> Export([FromQuery] ExportReservationsQuery query)
    {
        var csvBytes = await _reservationService.ExportReservationsAsync(query);
        return File(csvBytes, "text/csv", $"katipuneros_reservations_{DateTime.UtcNow:yyyyMMdd_HHmm}.csv");
    }
}
