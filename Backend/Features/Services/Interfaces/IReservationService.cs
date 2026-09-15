// [Layer: Features/Services/Interfaces]
// IReservationService.cs -- Contract for book holds, smart locker staging, and pickup fulfillment.
// Defines business rules for queue rank, reservation expiration, and pickup validation.
// DO NOT put data access, raw SQL, or HTTP concerns here.

using Backend.Features.Data.Models;

namespace Backend.Features.Services.Interfaces;

public interface IReservationService
{
    Task<(bool Success, Reservation? Reservation, string? Error)> CreateReservationAsync(Guid patronId, Guid bookId, string? pickupBranch);
    Task<(bool Success, string? Error)> CancelReservationAsync(Guid reservationId, Guid patronId);
    Task<(bool Success, string? Error)> AssignLockerAsync(Guid reservationId, string lockerBay, string pin);
    Task<(bool Success, string? Error)> FulfillReservationAsync(Guid reservationId);
    Task<List<Reservation>> GetPatronReservationsAsync(Guid patronId);
    Task<List<Reservation>> GetPendingReservationsAsync();
}
