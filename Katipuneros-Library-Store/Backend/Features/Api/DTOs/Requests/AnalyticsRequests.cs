// [Layer: Features/Api/DTOs/Requests]
// AnalyticsRequests.cs -- Data contract requests for querying velocity metrics, telemetry refresh, and bulk operations.
// DO NOT put business logic or database queries here.

using System;
using System.Collections.Generic;

namespace Backend.Features.Api.DTOs.Requests;

public class VelocityQueryRequest
{
    public string Granularity { get; set; } = "30D"; // "7D", "30D", "90D", "1Y", "All"
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class BulkOperationsRequest
{
    public List<Guid> SelectedIds { get; set; } = new();
    public string ActionType { get; set; } = "bulk-delete"; // "bulk-delete", "bulk-archive", "bulk-realign"
    public string? Reason { get; set; }
}
