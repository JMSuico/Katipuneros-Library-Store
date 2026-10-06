// [Layer: Features/Services/Interfaces]
// IAnalyticsService.cs -- Service interface for administrative circulation analytics and velocity telemetry.
// DO NOT put business logic or database queries here.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Responses;

namespace Backend.Features.Services.Interfaces;

public interface IAnalyticsService
{
    Task<CirculationAnomalyResponse> GetAnomalyAlertAsync();
    Task<CoreVelocityResponse> GetVelocityMetricsAsync(string granularity, DateTime? startDate, DateTime? endDate);
    Task<InventoryDensityResponse> GetInventoryDensityAsync();
    Task<CommunityFlowResponse> GetCommunityFlowAsync();
    Task<CirculationDemandResponse> GetCirculationDemandAsync();
    Task<TelemetryFeedResponse> GetTelemetryFeedAsync();
    Task<bool> ProcessBulkOperationAsync(List<Guid> ids, string actionType, string? reason);
}
