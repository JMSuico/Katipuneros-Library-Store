// [Layer: Features/Services/Implementations]
// ReservationService.cs -- Implementation of patron holds and smart locker management workflows.
// Enforces hold limits, queue positions, smart locker assignments, and hold fulfillment.
// DO NOT access AppDbContext directly -- use IReservationRepository, IBookRepository, IUserRepository only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Helpers.Infrastructure;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _reservationRepository;
    private readonly IBookRepository _bookRepository;
    private readonly IUserRepository _userRepository;

    public ReservationService(
        IReservationRepository reservationRepository,
        IBookRepository bookRepository,
        IUserRepository userRepository) =>
        (_reservationRepository, _bookRepository, _userRepository) =
        (reservationRepository, bookRepository, userRepository);

    public async Task<List<Reservation>> GetPatronReservationsAsync(Guid patronId) =>
        await _reservationRepository.GetActiveByPatronIdAsync(patronId);

    public async Task<List<Reservation>> GetPendingReservationsAsync() =>
        await _reservationRepository.GetAllPendingAsync();

    public async Task<(bool Success, Reservation? Reservation, string? Error)> CreateReservationAsync(Guid patronId, Guid bookId, string? pickupBranch)
    {
        var patron = await _userRepository.GetByIdAsync(patronId);
        if (patron == null || !patron.IsActive)
            return (false, null, "Patron record is invalid or suspended.");

        var book = await _bookRepository.GetByIdAsync(bookId);
        if (book == null)
            return (false, null, "Book asset not found.");

        var activeHolds = await _reservationRepository.GetActiveByPatronIdAsync(patronId);
        if (activeHolds.Any(h => h.BookId == bookId))
            return (false, null, "You already have an active hold on this catalog title.");

        var existingQueue = await _reservationRepository.GetPendingQueueByBookIdAsync(bookId);
        int nextPosition = existingQueue.Count + 1;

        var reservation = new Reservation
        {
            PatronId = patronId,
            BookId = bookId,
            ReservationDate = DateTime.UtcNow,
            ExpiryDate = DateTime.UtcNow.AddHours(48),
            Status = ReservationStatus.Pending,
            PickupBranch = InputSanitizer.SanitizeText(pickupBranch ?? "Main Circulation Desk"),
            QueuePosition = nextPosition
        };

        await _reservationRepository.AddAsync(reservation);
        await _reservationRepository.SaveChangesAsync();

        return (true, reservation, null);
    }

    public async Task<(bool Success, string? Error)> CancelReservationAsync(Guid reservationId, Guid patronId) =>
        await _reservationRepository.GetByIdAsync(reservationId) is not { } reservation || reservation.PatronId != patronId
            ? (false, "Reservation hold not found.")
            : await ExecuteReservationCancelAsync(reservation);

    private async Task<(bool Success, string? Error)> ExecuteReservationCancelAsync(Reservation reservation)
    {
        reservation.Status = ReservationStatus.Cancelled;
        await _reservationRepository.UpdateAsync(reservation);
        var saved = await _reservationRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to cancel reservation.");
    }

    public async Task<(bool Success, string? Error)> AssignLockerAsync(Guid reservationId, string lockerBay, string pin) =>
        await _reservationRepository.GetByIdAsync(reservationId) is not { } reservation
            ? (false, "Reservation hold not found.")
            : await ExecuteLockerAssignmentAsync(reservation, lockerBay, pin);

    private async Task<(bool Success, string? Error)> ExecuteLockerAssignmentAsync(Reservation reservation, string lockerBay, string pin)
    {
        reservation.LockerBay = InputSanitizer.SanitizeText(lockerBay);
        reservation.LockerPin = pin.Trim();
        reservation.Status = ReservationStatus.StagedInLocker;

        await _reservationRepository.UpdateAsync(reservation);
        var saved = await _reservationRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to assign smart locker.");
    }

    public async Task<(bool Success, string? Error)> FulfillReservationAsync(Guid reservationId) =>
        await _reservationRepository.GetByIdAsync(reservationId) is not { } reservation
            ? (false, "Reservation hold not found.")
            : await ExecuteReservationFulfillmentAsync(reservation);

    private async Task<(bool Success, string? Error)> ExecuteReservationFulfillmentAsync(Reservation reservation)
    {
        reservation.Status = ReservationStatus.Fulfilled;
        reservation.FulfilledDate = DateTime.UtcNow;

        await _reservationRepository.UpdateAsync(reservation);
        var saved = await _reservationRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to fulfill reservation.");
    }
}
