// [Layer: Features/Api/DTOs/Requests]
// CashierRequests.cs -- Strongly-typed request contracts for Cashier operations, filters, and shift reconciliation.
// DO NOT put business logic or database queries here.

using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Api.DTOs.Requests;

public class CashierTransactionFilterRequest
{
    public DateTime? Date { get; set; }
    public string? Type { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class ApproveReservationRequest
{
    public string? LockerBay { get; set; } = "Bay 01 Locker #A-01";
    public string? Notes { get; set; }
}

public class RejectReservationRequest
{
    [Required]
    public string Reason { get; set; } = string.Empty;
}

public class ReconcileRegisterDrawerRequest
{
    [Range(0, 1000000)]
    public decimal ActualCashCount { get; set; }
    public string? ShiftNotes { get; set; }
}
