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
