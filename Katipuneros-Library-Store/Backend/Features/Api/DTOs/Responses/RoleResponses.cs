// [Layer: Backend/Features/Api/DTOs/Responses]
// RoleResponses.cs -- Response DTOs for Roles, Privileges, 2FA, and Login/Logout Monitor.
// Strictly adheres to AGENTS.md and SKILL.md.

using Backend.Features.Api.DTOs.Requests;

namespace Backend.Features.Api.DTOs.Responses;

public class SecurityMetricsDto
{
    public int ConfiguredRolesCount { get; set; }
    public int DefaultRolesCount { get; set; }
    public int CustomRolesCount { get; set; }
    public int ActiveIdentitiesCount { get; set; }
    public double IdentityGrowthRate { get; set; }
    public int SuperAdminsCount { get; set; }
    public double TwoFactorEnforcementRate { get; set; }
}

public class RoleConfigDto
{
    public string Id { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Desc { get; set; } = string.Empty;
    public string LandingTitle { get; set; } = string.Empty;
    public string LandingSub { get; set; } = string.Empty;
    public string TierBadge { get; set; } = string.Empty;
    public List<PrivilegeItemDto> Privileges { get; set; } = new();
    public string PolicyTitle { get; set; } = string.Empty;
    public string PolicyBadge { get; set; } = string.Empty;
    public string PolicyDesc { get; set; } = string.Empty;
    public string AssignedCount { get; set; } = string.Empty;
    public string AvatarBadge { get; set; } = string.Empty;
    public string AvatarSub { get; set; } = string.Empty;
    public bool EmergencyHoldOverride { get; set; }
    public bool CashDrawerKickout { get; set; }
    public bool FineCourtesyWaiver { get; set; }
    public bool HoldStagingClearance { get; set; }
}

public class ModulePrivilegeItemDto
{
    public string ModuleId { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public string Subsystem { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string ScopeDesc { get; set; } = string.Empty;
    public string AdminGrant { get; set; } = "Full";
    public string CashierGrant { get; set; } = "Scoped";
    public string PatronGrant { get; set; } = "Restricted";
    public string CuratorGrant { get; set; } = "Scoped";
}

public class TwoFactorKeyResponse
{
    public string SecretKey { get; set; } = string.Empty;
    public string OtpAuthUri { get; set; } = string.Empty;
    public string QrSeed { get; set; } = string.Empty;
    public List<string> RecoveryCodes { get; set; } = new();
    public DateTime GeneratedAt { get; set; }
}

public class UserLoginAuditDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Action { get; set; } = "LOGIN"; // LOGIN or LOGOUT
    public DateTime Timestamp { get; set; }
    public string FormattedTimeAgo { get; set; } = string.Empty;
    public string TwoFactorMethod { get; set; } = "FIDO2 Hardware Key";
    public string IpAddress { get; set; } = string.Empty;
    public string Workstation { get; set; } = "Branch Alpha";
    public bool IsSuccess { get; set; } = true;
}

public class CirculationAnomalyDto
{
    public bool Detected { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double HoldVolumeIncreasePercent { get; set; }
    public int ZeroAvailabilityTitlesCount { get; set; }
    public string CategoryName { get; set; } = string.Empty;
}
