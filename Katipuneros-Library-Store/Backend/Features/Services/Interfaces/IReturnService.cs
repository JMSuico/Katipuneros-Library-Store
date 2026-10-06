// [Layer: Features/Services/Interfaces]
// IReturnService.cs -- Contract for circulation return intake, damaged book assessment, and bindery routing.
// Business rules and workflow contracts ONLY.
// DO NOT put HTTP concerns or raw EF queries here.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;

namespace Backend.Features.Services.Interfaces;

public interface IReturnService
{
    Task<ReturnsMetricsResponse> GetReturnsMetricsAsync();
    Task<List<ReturnJournalItemResponse>> GetReturnsJournalAsync(string? status = null, string? query = null);
    Task<DamagedAssessmentCaseResponse> GetActiveDamagedCaseAsync();
    Task<(bool Success, string Message)> ProcessRoutingActionAsync(RoutingActionRequest request, Guid adminId);
    Task<(bool Success, int CheckedInCount, string Message)> ProcessBulkCheckinAsync(BulkCheckinRequest request, Guid adminId);
}
