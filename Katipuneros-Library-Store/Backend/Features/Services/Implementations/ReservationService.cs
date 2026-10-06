// [Layer: Features/Services/Implementations]
// ReservationService.cs -- Implementation of patron holds, queue priority, smart locker staging, and triage workflows.
// Enforces hold limits, 48h retention countdown, smart locker telemetry, and batch clearance.
// DO NOT access AppDbContext directly -- use IReservationRepository, IBookRepository, IUserRepository only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
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

    public async Task<ReservationMetricsResponse> GetMetricsAsync()
    {
        int activeQueue = await _reservationRepository.GetCountByStatusesAsync(ReservationStatus.Pending, ReservationStatus.StagedInLocker);
        int pendingReview = await _reservationRepository.GetCountByStatusesAsync(ReservationStatus.Pending);
        int stagedReady = await _reservationRepository.GetCountByStatusesAsync(ReservationStatus.StagedInLocker);
        double velocity = await _reservationRepository.GetAverageFulfillmentHoursAsync();
        const int totalLockerSlots = 12;
        double capacityPercent = totalLockerSlots > 0 ? Math.Round(((double)stagedReady / totalLockerSlots) * 100.0, 1) : 0.0;

        return new ReservationMetricsResponse
        {
            ActiveHoldQueue = activeQueue,
            PendingReview = pendingReview,
            StagedReady = stagedReady,
            FulfillmentVelocity = velocity,
            TotalLockerSlots = totalLockerSlots,
            OccupiedLockers = stagedReady,
            LockerCapacityPercent = capacityPercent
        };
    }

    public async Task<List<ReservationDetailResponse>> GetAllAdminReservationsAsync(string? status = null, string? query = null)
    {
        var reservations = await _reservationRepository.GetAllWithDetailsAsync(status, query);
        return reservations.Select(MapToDetailResponse).ToList();
    }

    private static ReservationDetailResponse MapToDetailResponse(Reservation r)
    {
        string priority = "STANDARD";
        if (r.Patron?.Role == UserRole.Admin || r.Patron?.Role == UserRole.Cashier)
            priority = "STAFF PRIORITY";
        else if (r.Patron?.Department?.Contains("Research", StringComparison.OrdinalIgnoreCase) == true || r.Patron?.EmploymentStatus?.Contains("Faculty", StringComparison.OrdinalIgnoreCase) == true)
            priority = "PRIORITY 1";

        return new ReservationDetailResponse
        {
            Id = r.Id,
            PatronId = r.PatronId,
            PatronName = r.Patron?.FullName ?? "Unknown Patron",
            PatronLibraryId = r.Patron?.LibraryCardNumber ?? "N/A",
            PatronDepartment = r.Patron?.Department ?? "General Stacks",
            PatronYearLevel = r.Patron?.EmploymentStatus ?? (r.Patron?.Role == UserRole.Customer ? "Undergraduate" : r.Patron?.Role.ToString() ?? "Patron"),
            BookId = r.BookId,
            BookTitle = r.Book?.Title ?? "Unknown Title",
            BookAuthor = r.Book?.Author ?? "Unknown Author",
            BookCallNumber = r.Book?.DeweyCode ?? "000 GEN",
            BookCoverImage = r.Book?.CoverImage,
            ReservationDate = r.ReservationDate,
            ExpiryDate = r.ExpiryDate,
            FulfilledDate = r.FulfilledDate,
            Status = r.Status.ToString(),
            LockerBay = r.LockerBay,
            LockerPin = r.LockerPin,
            PickupBranch = r.PickupBranch ?? "Main Circulation Desk",
            QueuePosition = r.QueuePosition,
            PriorityLabel = priority
        };
    }

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

        int holdLimit = patron.Role == UserRole.Admin || patron.Department == "Research" ? 5 : 2;
        if (activeHolds.Count >= holdLimit)
            return (false, null, $"Concurrent hold ceiling reached ({activeHolds.Count}/{holdLimit}). Overages queue for secondary Dean approval.");

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

    public async Task<(bool Success, string? Error)> TriageReservationAsync(Guid reservationId, bool approved, string? reason, bool priority)
    {
        if (await _reservationRepository.GetByIdAsync(reservationId) is not { } reservation)
            return (false, "Reservation hold not found.");

        reservation.Status = approved ? ReservationStatus.Pending : ReservationStatus.Cancelled;
        if (priority) reservation.QueuePosition = 1;

        await _reservationRepository.UpdateAsync(reservation);
        var saved = await _reservationRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to update triage decision.");
    }

    public async Task<(bool Success, string? Error)> UpdateStatusAsync(Guid reservationId, string newStatus, string? notes)
    {
        if (await _reservationRepository.GetByIdAsync(reservationId) is not { } reservation)
            return (false, "Reservation hold not found.");

        if (!Enum.TryParse<ReservationStatus>(newStatus, true, out var status))
            return (false, "Invalid reservation status specified.");

        reservation.Status = status;
        if (status == ReservationStatus.Fulfilled)
            reservation.FulfilledDate = DateTime.UtcNow;

        await _reservationRepository.UpdateAsync(reservation);
        var saved = await _reservationRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to transition reservation status.");
    }

    public async Task<(bool Success, int AffectedCount, string? Error)> BatchClearanceAsync(List<Guid> holdIds, string action, string? lockerBay)
    {
        var reservations = await _reservationRepository.GetByIdsAsync(holdIds);
        if (reservations.Count == 0)
            return (false, 0, "No matching reservation records found.");

        int count = 0;
        foreach (var r in reservations)
        {
            switch (action.ToLowerInvariant())
            {
                case "stage":
                    r.Status = ReservationStatus.StagedInLocker;
                    r.LockerBay = string.IsNullOrWhiteSpace(lockerBay) ? "Bay 01 Counter" : lockerBay;
                    r.LockerPin = new Random().Next(1000, 9999).ToString();
                    r.ExpiryDate = DateTime.UtcNow.AddHours(48);
                    count++;
                    break;
                case "cancel":
                    r.Status = ReservationStatus.Cancelled;
                    count++;
                    break;
                case "fulfill":
                case "release":
                    r.Status = ReservationStatus.Fulfilled;
                    r.FulfilledDate = DateTime.UtcNow;
                    count++;
                    break;
            }
            await _reservationRepository.UpdateAsync(r);
        }

        var saved = await _reservationRepository.SaveChangesAsync();
        return (saved, count, saved ? null : "Failed to save batch clearance changes.");
    }

    public async Task<(bool Success, string? Message, string? Error)> NotifyPatronAsync(Guid reservationId, string channel, string? customMessage)
    {
        if (await _reservationRepository.GetByIdAsync(reservationId) is not { } reservation)
            return (false, null, "Reservation hold not found.");

        string patronName = reservation.Patron?.FullName ?? "Patron";
        string title = reservation.Book?.Title ?? "your reserved book";
        string bay = reservation.LockerBay ?? "Main Circulation Desk";
        string pin = reservation.LockerPin ?? "N/A";

        string dispatchDetail = customMessage ?? $"Hello {patronName}, your hold for '{title}' is staged at {bay}. Pickup PIN: {pin}. Claim within 48 hours.";
        return (true, $"Dispatched via {channel}: \"{dispatchDetail}\"", null);
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
        reservation.ExpiryDate = DateTime.UtcNow.AddHours(48);

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

    public async Task<LockerDiagnosticsResponse> GetLockerDiagnosticsAsync()
    {
        var staged = await _reservationRepository.GetAllPendingAsync();
        var stagedInLockers = staged.Where(r => r.Status == ReservationStatus.StagedInLocker).ToList();

        var bayCodes = new[]
        {
            "A-01", "A-02", "A-03", "A-04",
            "B-01", "B-02", "B-03", "B-04",
            "C-01", "C-02", "C-03", "C-04"
        };

        var slots = new List<LockerSlotTelemetry>();
        int vacant = 0;
        int overdue = 0;

        foreach (var code in bayCodes)
        {
            var match = stagedInLockers.FirstOrDefault(r => r.LockerBay != null && r.LockerBay.Contains(code, StringComparison.OrdinalIgnoreCase));
            if (match == null)
            {
                slots.Add(new LockerSlotTelemetry { BayCode = code, Status = "EMPTY" });
                vacant++;
            }
            else
            {
                var remaining = (int)Math.Max(0, (match.ExpiryDate - DateTime.UtcNow).TotalHours);
                bool isOverdue = match.ExpiryDate <= DateTime.UtcNow;
                if (isOverdue) overdue++;

                slots.Add(new LockerSlotTelemetry
                {
                    BayCode = code,
                    Status = isOverdue ? "OVERDUE" : (remaining <= 12 ? "COUNTDOWN" : "READY"),
                    RemainingHours = remaining,
                    ReservationId = match.Id,
                    PatronName = match.Patron?.FullName,
                    BookTitle = match.Book?.Title
                });
            }
        }

        return new LockerDiagnosticsResponse
        {
            ClusterOnline = true,
            TotalSlots = 12,
            VacantSlots = vacant,
            OverdueSlots = overdue,
            Slots = slots
        };
    }

    public async Task<byte[]> ExportReservationsAsync(ExportReservationsQuery query)
    {
        var reservations = await _reservationRepository.GetAllWithDetailsAsync();

        if (query.StartDate.HasValue)
            reservations = reservations.Where(r => r.ReservationDate >= query.StartDate.Value).ToList();
        if (query.EndDate.HasValue)
            reservations = reservations.Where(r => r.ReservationDate <= query.EndDate.Value).ToList();

        if (!string.IsNullOrWhiteSpace(query.AlphabeticalFilter))
        {
            var letter = query.AlphabeticalFilter.Trim().ToLower();
            reservations = reservations.Where(r =>
                (r.Book != null && r.Book.Title.ToLower().Contains(letter)) ||
                (r.Patron != null && r.Patron.FullName.ToLower().Contains(letter))).ToList();
        }

        if (!string.IsNullOrWhiteSpace(query.IdFilter))
        {
            var idTerm = query.IdFilter.Trim().ToLower();
            reservations = reservations.Where(r =>
                r.Id.ToString().ToLower().Contains(idTerm) ||
                (r.Patron != null && r.Patron.LibraryCardNumber.ToLower().Contains(idTerm))).ToList();
        }

        reservations = query.SortDirection?.ToLower() == "desc"
            ? reservations.OrderByDescending(r => r.ReservationDate).ToList()
            : reservations.OrderBy(r => r.ReservationDate).ToList();

        var sb = new StringBuilder();
        sb.AppendLine("Hold ID,Patron Name,Patron ID,Department,Book Title,Call Number,Reservation Date,Expiry Date,Status,Locker Bay,Pickup Branch");

        foreach (var r in reservations)
        {
            sb.AppendLine($"\"{r.Id}\",\"{r.Patron?.FullName ?? "Unknown"}\",\"{r.Patron?.LibraryCardNumber ?? "N/A"}\",\"{r.Patron?.Department ?? "General"}\",\"{r.Book?.Title?.Replace("\"", "\"\"") ?? "N/A"}\",\"{r.Book?.DeweyCode ?? "N/A"}\",\"{r.ReservationDate:yyyy-MM-dd HH:mm}\",\"{r.ExpiryDate:yyyy-MM-dd HH:mm}\",\"{r.Status}\",\"{r.LockerBay ?? "N/A"}\",\"{r.PickupBranch ?? "N/A"}\"");
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }
}
