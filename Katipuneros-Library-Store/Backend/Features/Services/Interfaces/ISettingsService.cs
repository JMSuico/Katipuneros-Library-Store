// [Layer: Services/Interfaces]
// ISettingsService.cs -- Service contract for system settings, policy governance, and archive orchestration.
// Validates business rules, orchestrates repository operations, and computes telemetry.
// DO NOT touch AppDbContext directly -- use Repositories only.

using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;

namespace Backend.Features.Services.Interfaces;

public interface ISettingsService
{
    Task<SystemSettingsResponse> GetSystemSettingsAsync();
    Task<bool> UpdateCirculationPolicyAsync(UpdateCirculationPolicyRequest request, string updatedBy);
    Task<bool> UpdateReservationSetupsAsync(UpdateReservationSetupsRequest request, string updatedBy);
    Task<bool> UpdateFineTariffsAsync(UpdateFineTariffsRequest request, string updatedBy);
    Task<bool> UpdateSecurityGovernanceAsync(UpdateSecurityGovernanceRequest request, string updatedBy);
    Task<List<ArchiveModuleSummaryDto>> GetSystemArchivesSummaryAsync();
    Task<List<CidrSubnetDto>> GetCidrSubnetsAsync();
    Task<CidrSubnetDto> AddCidrSubnetAsync(AddCidrSubnetRequest request, string createdBy);
    Task<bool> BulkDeleteCidrSubnetsAsync(List<Guid> ids);
    Task<SecurityTelemetryDto> GetSecurityTelemetryAsync();
    Task<bool> SaveAllSettingsAsync(SystemSettingsResponse settings, string updatedBy);
    Task<bool> ResetSettingsAsync(List<string> modules, string updatedBy);
}
