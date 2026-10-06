// [Layer: Backend/Features/Api/DTOs/Requests]
// RoleRequests.cs -- Request DTOs for Roles & Permissions Access Governance.
// Strictly adheres to AGENTS.md and SKILL.md.

namespace Backend.Features.Api.DTOs.Requests;

public class PrivilegeItemDto
{
    public string Name { get; set; } = string.Empty;
    public string Desc { get; set; } = string.Empty;
    public bool Enabled { get; set; } = true;
}

public class UpdateRolePolicyRequest
{
    public string RoleId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Desc { get; set; } = string.Empty;
    public string LandingTitle { get; set; } = string.Empty;
    public string LandingSub { get; set; } = string.Empty;
    public string TierBadge { get; set; } = string.Empty;
    public List<PrivilegeItemDto> Privileges { get; set; } = new();
    public string PolicyTitle { get; set; } = string.Empty;
    public string PolicyBadge { get; set; } = string.Empty;
    public string PolicyDesc { get; set; } = string.Empty;
    public bool EmergencyHoldOverride { get; set; }
    public bool CashDrawerKickout { get; set; }
    public bool FineCourtesyWaiver { get; set; }
    public bool HoldStagingClearance { get; set; }
}

public class CreateCustomRoleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string BaseRole { get; set; } = "Staff";
    public List<PrivilegeItemDto> Privileges { get; set; } = new();
}

public class GenerateTwoFactorKeyRequest
{
    public string RoleKey { get; set; } = string.Empty;
    public string? UserId { get; set; }
}
