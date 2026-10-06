// [Layer: Features/Api/DTOs/Requests]
// CirculationRequests.cs -- Request DTOs for circulation desk checkout, returns, renewals, and fines.
// Data shaping and DataAnnotations attributes ONLY.
// DO NOT put business validation logic or database queries here.

using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Api.DTOs.Requests;

public class CheckoutRequest
{
    [Required]
    public Guid PatronId { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "At least one book barcode must be scanned for checkout.")]
    public List<string> BookBarcodes { get; set; } = new();

    public DateTime? DueDate { get; set; }
}

public class ReturnRequest
{
    [Required]
    public string Barcode { get; set; } = string.Empty;

    public string? ConditionNotes { get; set; }

    [Range(0, 5000)]
    public decimal? DamageFee { get; set; }
}

public class RenewRequest
{
    [Required]
    public Guid LoanId { get; set; }
}

public class CreateReservationRequest
{
    [Required]
    public Guid BookId { get; set; }

    public string? PickupBranch { get; set; }
}

public class AssignLockerRequest
{
    [Required]
    public string LockerBay { get; set; } = string.Empty;

    [Required]
    public string Pin { get; set; } = string.Empty;
}

public class SettleFineRequest
{
    [Required]
    [Range(0.01, 10000.00)]
    public decimal AmountPaid { get; set; }

    [Required]
    public string PaymentMethod { get; set; } = "Cash"; // Cash, GCash, Maya, DebitCard
}

public class WaiveFineRequest
{
    [Required]
    [MaxLength(250)]
    public string Reason { get; set; } = string.Empty;
}

public class TriageReservationRequest
{
    [Required]
    public bool Approved { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }

    public bool Priority { get; set; }
}

public class BatchClearanceRequest
{
    [Required]
    [MinLength(1, ErrorMessage = "At least one reservation hold must be selected.")]
    public List<Guid> HoldIds { get; set; } = new();

    [Required]
    public string Action { get; set; } = "Stage"; // "Stage", "Cancel", "Approve", "Release"

    public string? LockerBay { get; set; }
}

public class NotifyPatronRequest
{
    [Required]
    public string Channel { get; set; } = "Email"; // "SMS", "Email", "Push", "All"

    [MaxLength(1000)]
    public string? CustomMessage { get; set; }
}

public class UpdateReservationStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty; // "Pending", "StagedInLocker", "Fulfilled", "Cancelled", "Expired"

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class AdjustHoldQuotasRequest
{
    [Range(1, 20)]
    public int UndergradLimit { get; set; } = 2;

    [Range(1, 50)]
    public int FacultyLimit { get; set; } = 5;

    public bool EnableSecondaryTriage { get; set; } = true;
}

public class ExportReservationsQuery
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? AlphabeticalFilter { get; set; } // StartsWith, EndsWith, Contains
    public string? IdFilter { get; set; } // StartsWith, EndsWith, Contains
    public string? SortDirection { get; set; } = "asc"; // "asc" or "desc"
    public string? Format { get; set; } = "csv"; // "csv" or "excel"
}

public class LoanOverrideRequest
{
    [Required]
    public string PatronLibraryId { get; set; } = string.Empty;

    [Required]
    public string VolumeBarcode { get; set; } = string.Empty;

    [Required]
    public string ExtensionInterval { get; set; } = "Standard +7 Days Academic Grace";

    [Required]
    [MaxLength(500)]
    public string Justification { get; set; } = string.Empty;
}

public class ForceRenewLoanRequest
{
    [Range(1, 120)]
    public int ExtensionDays { get; set; } = 14;

    [MaxLength(500)]
    public string? SpecialApprovalNote { get; set; }
}

public class ExportBorrowingsQuery
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? AlphabeticalFilter { get; set; } // StartsWith, EndsWith, Contains
    public string? IdFilter { get; set; } // StartsWith, EndsWith, Contains
    public string? SortDirection { get; set; } = "asc"; // "asc" or "desc"
    public string? Format { get; set; } = "csv"; // "csv" or "excel"
}

