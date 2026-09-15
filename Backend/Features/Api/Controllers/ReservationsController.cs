// [Layer: Features/Api/Controllers]
// ReservationsController.cs -- API endpoints for patron holds, waitlist queue, and smart locker staging.
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
}
