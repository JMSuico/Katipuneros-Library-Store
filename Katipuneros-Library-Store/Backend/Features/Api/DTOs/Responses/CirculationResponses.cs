// [Layer: Features/Api/DTOs/Responses]
// CirculationResponses.cs -- Response DTOs for reservation queue, hold metrics, and smart locker telemetry.
// Data contracts ONLY.
// DO NOT put business logic or database queries here.

using System;
using System.Collections.Generic;

namespace Backend.Features.Api.DTOs.Responses;

public class ReservationMetricsResponse
{
    public int ActiveHoldQueue { get; set; }
    public int PendingReview { get; set; }
    public int StagedReady { get; set; }
    public double FulfillmentVelocity { get; set; }
    public int TotalLockerSlots { get; set; } = 12;
    public int OccupiedLockers { get; set; }
    public double LockerCapacityPercent { get; set; }
}

public class ReservationDetailResponse
{
    public Guid Id { get; set; }
    public Guid PatronId { get; set; }
    public string PatronName { get; set; } = string.Empty;
    public string PatronLibraryId { get; set; } = string.Empty;
    public string PatronDepartment { get; set; } = string.Empty;
    public string PatronYearLevel { get; set; } = string.Empty;
    public Guid BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public string BookAuthor { get; set; } = string.Empty;
    public string BookCallNumber { get; set; } = string.Empty;
    public string? BookCoverImage { get; set; }
    public DateTime ReservationDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public DateTime? FulfilledDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? LockerBay { get; set; }
    public string? LockerPin { get; set; }
    public string? PickupBranch { get; set; }
    public int QueuePosition { get; set; } = 1;
    public string PriorityLabel { get; set; } = "STANDARD";
}

public class LockerSlotTelemetry
{
    public string BayCode { get; set; } = string.Empty; // e.g. "A-01", "C-04"
    public string Status { get; set; } = "EMPTY"; // "READY", "COUNTDOWN", "EMPTY", "ASSIGN", "OVERDUE"
    public int? RemainingHours { get; set; }
    public Guid? ReservationId { get; set; }
    public string? PatronName { get; set; }
    public string? BookTitle { get; set; }
}

public class LockerDiagnosticsResponse
{
    public bool ClusterOnline { get; set; } = true;
    public string ClusterLocation { get; set; } = "Ground Floor Circulation Wing";
    public int TotalSlots { get; set; } = 12;
    public int VacantSlots { get; set; }
    public int OverdueSlots { get; set; }
    public List<LockerSlotTelemetry> Slots { get; set; } = new();
}

public class BorrowingMetricsResponse
{
    public int TotalActiveBorrowings { get; set; }
    public double TrendingPercent { get; set; }
    public int DueToday48h { get; set; }
    public int UndergradDueCount { get; set; }
    public int GraduateDueCount { get; set; }
    public int ApproachingExpiry { get; set; }
    public int OverdueDelinquencies { get; set; }
    public decimal CumulativeFines { get; set; }
}

public class BorrowingDetailResponse
{
    public Guid Id { get; set; }
    public string LoanCode { get; set; } = string.Empty;
    public Guid PatronId { get; set; }
    public string PatronName { get; set; } = string.Empty;
    public string PatronLibraryId { get; set; } = string.Empty;
    public string PatronRole { get; set; } = "Undergrad";
    public string? PatronAvatar { get; set; }
    public Guid BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public string BookBarcode { get; set; } = string.Empty;
    public string BookCallNumber { get; set; } = string.Empty;
    public string? BookCoverImage { get; set; }
    public DateTime BorrowDate { get; set; }
    public DateTime DueDate { get; set; }
    public int DaysRemaining { get; set; }
    public int RenewalCount { get; set; }
    public int MaxRenewals { get; set; } = 2;
    public string Status { get; set; } = "Active";
    public decimal AssessedFine { get; set; }
    public string? Notes { get; set; }
}
