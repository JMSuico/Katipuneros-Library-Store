// [Layer: Backend/Features/Api/Controllers]
// RolesController.cs -- API Controller for RBAC Access Governance, Security Policies, 2FA, and Login Stream.
// Strictly adheres to AGENTS.md, SKILL.md, and universal expression bodies (=>).

using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Features.Api.Controllers;

[ApiController]
[Route("api/admin/roles")]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RolesController(IRoleService roleService) => _roleService = roleService;

    [HttpGet("metrics")]
    public async Task<ActionResult<SecurityMetricsDto>> GetMetrics() =>
        Ok(await _roleService.GetSecurityMetricsAsync());

    [HttpGet("matrix")]
    public async Task<ActionResult<List<ModulePrivilegeItemDto>>> GetMatrix() =>
        Ok(await _roleService.GetPrivilegeMatrixAsync());

    [HttpGet("configs")]
    public async Task<ActionResult<Dictionary<string, RoleConfigDto>>> GetConfigs() =>
        Ok(await _roleService.GetRoleConfigsAsync());

    [HttpGet("configs/{key}")]
    public async Task<ActionResult<RoleConfigDto>> GetConfigByKey(string key) =>
        (await _roleService.GetRoleConfigByKeyAsync(key)) is { } config ? Ok(config) : NotFound();

    [HttpPut("{key}/policy")]
    public async Task<ActionResult> UpdatePolicy(string key, [FromBody] UpdateRolePolicyRequest request) =>
        await _roleService.UpdateRolePolicyAsync(key, request) ? Ok(new { message = "Role policy updated successfully." }) : NotFound();

    [HttpPost("custom")]
    public async Task<ActionResult<RoleConfigDto>> CreateCustomRole([FromBody] CreateCustomRoleRequest request) =>
        Ok(await _roleService.CreateCustomRoleAsync(request));

    [HttpPost("reset-defaults")]
    public async Task<ActionResult> ResetDefaults() =>
        await _roleService.ResetDefaultsAsync() ? Ok(new { message = "Security matrix reset to defaults." }) : StatusCode(500);

    [HttpPost("generate-2fa")]
    public async Task<ActionResult<TwoFactorKeyResponse>> GenerateTwoFactorKey([FromBody] GenerateTwoFactorKeyRequest request) =>
        Ok(await _roleService.GenerateTwoFactorKeyAsync(request));

    [HttpGet("auth-monitor")]
    public async Task<ActionResult<List<UserLoginAuditDto>>> GetAuthMonitorStream() =>
        Ok(await _roleService.GetLoginAuditStreamAsync());

    [HttpGet("anomaly")]
    public async Task<ActionResult<CirculationAnomalyDto>> GetCirculationAnomaly() =>
        Ok(await _roleService.GetCirculationAnomalyAsync());
}
