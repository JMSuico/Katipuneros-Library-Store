// [Layer: Backend/Features/Api/Controllers]
// RolesController.cs -- API Controller for RBAC Access Governance, Security Policies, 2FA, and Login Stream.
// Strictly adheres to AGENTS.md, SKILL.md, and universal expression bodies (=>).

using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Features.Api.Controllers;

[ApiController]
[Route("api/admin/roles")]
[Authorize(Roles = "Admin")]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RolesController(IRoleService roleService) => _roleService = roleService;

    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics() =>
        Ok(ApiResponse<SecurityMetricsDto>.Ok(await _roleService.GetSecurityMetricsAsync()));

    [HttpGet("matrix")]
    public async Task<IActionResult> GetMatrix() =>
        Ok(ApiResponse<List<ModulePrivilegeItemDto>>.Ok(await _roleService.GetPrivilegeMatrixAsync()));

    [HttpGet("configs")]
    public async Task<IActionResult> GetConfigs() =>
        Ok(ApiResponse<Dictionary<string, RoleConfigDto>>.Ok(await _roleService.GetRoleConfigsAsync()));

    [HttpGet("configs/{key}")]
    public async Task<IActionResult> GetConfigByKey(string key) =>
        (await _roleService.GetRoleConfigByKeyAsync(key)) is { } config
            ? Ok(ApiResponse<RoleConfigDto>.Ok(config))
            : NotFound(ApiResponse<object>.Fail($"Role configuration for key '{key}' not found."));

    [HttpPut("{key}/policy")]
    public async Task<IActionResult> UpdatePolicy(string key, [FromBody] UpdateRolePolicyRequest request) =>
        await _roleService.UpdateRolePolicyAsync(key, request)
            ? Ok(ApiResponse<object>.Ok(new { key }, "Role policy updated successfully."))
            : NotFound(ApiResponse<object>.Fail($"Role configuration for key '{key}' not found."));

    [HttpPost("custom")]
    public async Task<IActionResult> CreateCustomRole([FromBody] CreateCustomRoleRequest request) =>
        Ok(ApiResponse<RoleConfigDto>.Ok(await _roleService.CreateCustomRoleAsync(request), "Custom role created successfully."));

    [HttpPost("reset-defaults")]
    public async Task<IActionResult> ResetDefaults() =>
        await _roleService.ResetDefaultsAsync()
            ? Ok(ApiResponse<object>.Ok(new { reset = true }, "Security matrix reset to defaults."))
            : StatusCode(500, ApiResponse<object>.Fail("Failed to reset security matrix to defaults."));

    [HttpPost("generate-2fa")]
    public async Task<IActionResult> GenerateTwoFactorKey([FromBody] GenerateTwoFactorKeyRequest request) =>
        Ok(ApiResponse<TwoFactorKeyResponse>.Ok(await _roleService.GenerateTwoFactorKeyAsync(request)));

    [HttpGet("auth-monitor")]
    public async Task<IActionResult> GetAuthMonitorStream() =>
        Ok(ApiResponse<List<UserLoginAuditDto>>.Ok(await _roleService.GetLoginAuditStreamAsync()));

    [HttpGet("anomaly")]
    public async Task<IActionResult> GetCirculationAnomaly() =>
        Ok(ApiResponse<CirculationAnomalyDto>.Ok(await _roleService.GetCirculationAnomalyAsync()));
}
