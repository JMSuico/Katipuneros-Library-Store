// [Layer: Features/Api/DTOs/Requests]
// ReturnRequests.cs -- Request DTOs for returns processing, bindery routing actions, and journal export.
// Data contracts ONLY.
// DO NOT put business logic or database queries here.

using System;
using System.Collections.Generic;

namespace Backend.Features.Api.DTOs.Requests;

public record RoutingActionRequest
{
    public Guid? CaseId { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // "RouteBindery", "OrderReplacement", "DeaccessionSalvage", "AuthorizeRouting", "Hold"
    public string? Notes { get; set; }
    public decimal? CostOverride { get; set; }
    public string? TechnicianOrVendor { get; set; }
}

public class BulkCheckinRequest
{
    public List<string> Barcodes { get; set; } = new();
    public string? StationDesk { get; set; }
    public string? ConditionGrade { get; set; }
}

public class ExportReturnsQuery
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? AlphabeticalFilter { get; set; }
    public string? IdFilter { get; set; }
    public string? SortDirection { get; set; } = "desc";
    public string? Format { get; set; } = "csv";
}
