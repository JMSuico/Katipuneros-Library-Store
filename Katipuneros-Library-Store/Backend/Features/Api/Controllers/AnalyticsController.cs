// [Layer: Features/Api/Controllers]
// AnalyticsController.cs -- REST API endpoints for circulation analytics, velocity metrics, inventory density, community flow, and operational telemetry.
// Parses HTTP requests, calls IAnalyticsService, returns IActionResult.
// DO NOT put business logic or direct database queries here.

using System;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Features.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService) =>
        _analyticsService = analyticsService;

    /// <summary> Retrieve circulation anomaly alert status </summary>
    [HttpGet("anomaly")]
    [ProducesResponseType(typeof(ApiResponse<CirculationAnomalyResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAnomalyAlert() =>
        Ok(ApiResponse<CirculationAnomalyResponse>.Ok(await _analyticsService.GetAnomalyAlertAsync()));

    /// <summary> Retrieve multi-series circulation velocity curves </summary>
    [HttpGet("velocity")]
    [ProducesResponseType(typeof(ApiResponse<CoreVelocityResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVelocityMetrics([FromQuery] string? granularity = "30D", [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null) =>
        Ok(ApiResponse<CoreVelocityResponse>.Ok(await _analyticsService.GetVelocityMetricsAsync(granularity ?? "30D", startDate, endDate)));

    /// <summary> Retrieve physical stacks inventory density proportions </summary>
    [HttpGet("inventory-density")]
    [ProducesResponseType(typeof(ApiResponse<InventoryDensityResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInventoryDensity() =>
        Ok(ApiResponse<InventoryDensityResponse>.Ok(await _analyticsService.GetInventoryDensityAsync()));

    /// <summary> Retrieve community flow, footfall histogram, and turnstile telemetry </summary>
    [HttpGet("community-flow")]
    [ProducesResponseType(typeof(ApiResponse<CommunityFlowResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCommunityFlow() =>
        Ok(ApiResponse<CommunityFlowResponse>.Ok(await _analyticsService.GetCommunityFlowAsync()));

    /// <summary> Retrieve top titles in circulation demand ranking </summary>
    [HttpGet("demand")]
    [ProducesResponseType(typeof(ApiResponse<CirculationDemandResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCirculationDemand() =>
        Ok(ApiResponse<CirculationDemandResponse>.Ok(await _analyticsService.GetCirculationDemandAsync()));

    /// <summary> Retrieve live operational desk feed ticker and sync countdown </summary>
    [HttpGet("telemetry")]
    [ProducesResponseType(typeof(ApiResponse<TelemetryFeedResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTelemetryFeed() =>
        Ok(ApiResponse<TelemetryFeedResponse>.Ok(await _analyticsService.GetTelemetryFeedAsync()));

    /// <summary> Manually trigger operational telemetry refresh </summary>
    [HttpPost("refresh-telemetry")]
    [ProducesResponseType(typeof(ApiResponse<TelemetryFeedResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RefreshTelemetry() =>
        Ok(ApiResponse<TelemetryFeedResponse>.Ok(await _analyticsService.GetTelemetryFeedAsync(), "Telemetry refreshed."));

    /// <summary> Process bulk deletion or reallocation on selected analytical records </summary>
    [HttpPost("bulk-action")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ProcessBulkAction([FromBody] BulkOperationsRequest request) =>
        await _analyticsService.ProcessBulkOperationAsync(request.SelectedIds, request.ActionType, request.Reason)
            ? Ok(ApiResponse<object>.Ok(new { processed = request.SelectedIds.Count }, "Bulk operation successfully dispatched."))
            : BadRequest(ApiResponse<object>.Fail("Failed to process bulk operation. No valid records specified."));
}
