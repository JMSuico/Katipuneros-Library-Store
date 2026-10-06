// [Layer: Backend/Features/Services/Interfaces]
// IRoleService.cs -- Service interface for Roles & Permissions Access Governance.
// Strictly adheres to AGENTS.md and SKILL.md.

using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;

namespace Backend.Features.Services.Interfaces;

public interface IRoleService
{
    Task<SecurityMetricsDto> GetSecurityMetricsAsync();
    Task<List<ModulePrivilegeItemDto>> GetPrivilegeMatrixAsync();
    Task<Dictionary<string, RoleConfigDto>> GetRoleConfigsAsync();
    Task<RoleConfigDto?> GetRoleConfigByKeyAsync(string key);
    Task<bool> UpdateRolePolicyAsync(string key, UpdateRolePolicyRequest request);
    Task<RoleConfigDto> CreateCustomRoleAsync(CreateCustomRoleRequest request);
    Task<bool> ResetDefaultsAsync();
    Task<TwoFactorKeyResponse> GenerateTwoFactorKeyAsync(GenerateTwoFactorKeyRequest request);
    Task<List<UserLoginAuditDto>> GetLoginAuditStreamAsync();
    Task<CirculationAnomalyDto> GetCirculationAnomalyAsync();
}
