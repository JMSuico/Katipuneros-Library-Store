// [Layer: Api/Controllers]
// SettingsController.cs -- REST API endpoints for system settings, policy governance, and CIDR management.
// Uses clean expression-bodied lambda syntax (=>) across all actions.
// DO NOT put business logic, validation algorithms, or direct DB queries here.

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Api.Controllers;

[ApiController]
[Route("api/admin/settings")]
[Authorize(Roles = "Admin")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService) => _settingsService = settingsService;

    /// <summary> Retrieve active system governance policies and parameters </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<SystemSettingsResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSettings() =>
        Ok(ApiResponse<SystemSettingsResponse>.Ok(await _settingsService.GetSystemSettingsAsync()));

    /// <summary> Update circulation durations and patron tier caps </summary>
    [HttpPut("circulation")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateCirculation([FromBody] UpdateCirculationPolicyRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid circulation policy parameters."))
            : Ok(ApiResponse<object>.Ok(
                new { success = await _settingsService.UpdateCirculationPolicyAsync(request, User?.Identity?.Name ?? "Admin") },
                "Circulation policies updated successfully."
            ));

    /// <summary> Update reservation hold rules and notification cadences </summary>
    [HttpPut("reservations")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateReservations([FromBody] UpdateReservationSetupsRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid reservation setup parameters."))
            : Ok(ApiResponse<object>.Ok(
                new { success = await _settingsService.UpdateReservationSetupsAsync(request, User?.Identity?.Name ?? "Admin") },
                "Reservation setups updated successfully."
            ));

    /// <summary> Update overdue fine tariffs, repair fees, and waiver policies </summary>
    [HttpPut("fines")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateFines([FromBody] UpdateFineTariffsRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid fine tariff parameters."))
            : Ok(ApiResponse<object>.Ok(
                new { success = await _settingsService.UpdateFineTariffsAsync(request, User?.Identity?.Name ?? "Admin") },
                "Fine calculation tariffs updated successfully."
            ));

    /// <summary> Update security session timeouts and access governance </summary>
    [HttpPut("security")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateSecurity([FromBody] UpdateSecurityGovernanceRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid security governance parameters."))
            : Ok(ApiResponse<object>.Ok(
                new { success = await _settingsService.UpdateSecurityGovernanceAsync(request, User?.Identity?.Name ?? "Admin") },
                "Security governance policies updated successfully."
            ));

    /// <summary> Retrieve centralized system archives telemetry across all modules </summary>
    [HttpGet("archives")]
    [ProducesResponseType(typeof(ApiResponse<List<ArchiveModuleSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetArchives() =>
        Ok(ApiResponse<List<ArchiveModuleSummaryDto>>.Ok(await _settingsService.GetSystemArchivesSummaryAsync()));

    /// <summary> List whitelisted campus CIDR subnet ranges </summary>
    [HttpGet("cidr")]
    [ProducesResponseType(typeof(ApiResponse<List<CidrSubnetDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCidrSubnets() =>
        Ok(ApiResponse<List<CidrSubnetDto>>.Ok(await _settingsService.GetCidrSubnetsAsync()));

    /// <summary> Add a new campus CIDR subnet rule </summary>
    [HttpPost("cidr")]
    [ProducesResponseType(typeof(ApiResponse<CidrSubnetDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddCidrSubnet([FromBody] AddCidrSubnetRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid CIDR format or network classification."))
            : CreatedAtAction(nameof(GetCidrSubnets), ApiResponse<CidrSubnetDto>.Ok(
                await _settingsService.AddCidrSubnetAsync(request, User?.Identity?.Name ?? "Admin"),
                "Campus subnet whitelisted."
            ));

    /// <summary> Bulk delete whitelisted CIDR subnets </summary>
    [HttpPost("cidr/bulk-delete")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> BulkDeleteCidr([FromBody] BulkDeleteCidrRequest request) =>
        request.Ids.Count == 0
            ? BadRequest(ApiResponse<object>.Fail("No subnet IDs provided."))
            : Ok(ApiResponse<object>.Ok(
                new { deletedCount = request.Ids.Count, success = await _settingsService.BulkDeleteCidrSubnetsAsync(request.Ids) },
                $"{request.Ids.Count} subnet(s) removed from whitelist."
            ));

    /// <summary> Retrieve real-time security node and WAL telemetry </summary>
    [HttpGet("telemetry")]
    [ProducesResponseType(typeof(ApiResponse<SecurityTelemetryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTelemetry() =>
        Ok(ApiResponse<SecurityTelemetryDto>.Ok(await _settingsService.GetSecurityTelemetryAsync()));

    /// <summary> Save full system governance configuration bundle </summary>
    [HttpPost("save")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SaveAll([FromBody] SystemSettingsResponse request) =>
        Ok(ApiResponse<object>.Ok(
            new { success = await _settingsService.SaveAllSettingsAsync(request, User?.Identity?.Name ?? "Admin") },
            "All system configurations saved and applied across campus nodes."
        ));

    /// <summary> Reset governance configurations to active default policies </summary>
    [HttpPost("reset")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Reset([FromBody] ResetSettingsRequest request) =>
        Ok(ApiResponse<object>.Ok(
            new { success = await _settingsService.ResetSettingsAsync(request.Modules, User?.Identity?.Name ?? "Admin") },
            "Settings successfully reverted to system defaults."
        ));
}
