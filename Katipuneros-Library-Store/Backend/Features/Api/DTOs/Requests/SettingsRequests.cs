// [Layer: Api/DTOs/Requests]
// SettingsRequests.cs -- Incoming request DTOs for system settings, policy governance, and CIDR subnets.
// Contains data transfer shapes and validation attributes ONLY.
// DO NOT put business validation logic or entity mapping here.

using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Api.DTOs.Requests;

public class TierPolicyDto
{
    [Range(1, 365)]
    public int DaysDuration { get; set; }

    [Range(1, 100)]
    public int MaxConcurrency { get; set; }

    [MaxLength(50)]
    public string RenewalLimit { get; set; } = string.Empty;

    [Range(1, 50)]
    public int HoldQueueLimit { get; set; }

    [MaxLength(50)]
    public string OverdueTariff { get; set; } = string.Empty;
}

public class UpdateCirculationPolicyRequest
{
    [Required]
    public TierPolicyDto Tier1 { get; set; } = new();

    [Required]
    public TierPolicyDto Tier2 { get; set; } = new();

    [Required]
    public TierPolicyDto Tier3 { get; set; } = new();

    [Range(0, 168)]
    public int GracePeriodHours { get; set; } = 24;
}

public class UpdateReservationSetupsRequest
{
    public bool InstantReshelveNotice { get; set; } = true;
    public bool ThesisScholarPriority { get; set; } = true;

    [MaxLength(100)]
    public string PickupNotificationCadence { get; set; } = "3 Alerts (Deposit / 24h / 6h)";
}

public class UpdateFineTariffsRequest
{
    [Range(0, 1000)]
    public decimal DailyOverdueTariff { get; set; } = 15.00m;

    [Range(0, 10000)]
    public decimal MaxPenaltyCap { get; set; } = 500.00m;

    [Range(0, 5000)]
    public decimal BindingRepairTariff { get; set; } = 280.00m;

    [Range(0, 5000)]
    public decimal LostBookAdministrativeFee { get; set; } = 150.00m;

    public bool MedicalWaiverEnabled { get; set; } = true;
    public bool TyphoonWaiverEnabled { get; set; } = true;
}

public class AddCidrSubnetRequest
{
    [Required]
    [MaxLength(50)]
    public string CidrRange { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string NetworkClassification { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string AccessLevel { get; set; } = "Staff";
}

public class BulkDeleteCidrRequest
{
    [Required]
    public List<Guid> Ids { get; set; } = new();
}

public class UpdateUserPreferencesRequest
{
    [Required]
    public string ThemeMode { get; set; } = "light";

    [Required]
    public string AccentColor { get; set; } = "#287EA7";

    [Required]
    public string DisplayDensity { get; set; } = "comfortable";

    [Required]
    public string FontSizeMultiplier { get; set; } = "100%";
}

public class ResetSettingsRequest
{
    public List<string> Modules { get; set; } = new();
}

public class UpdateSecurityGovernanceRequest
{
    [Range(1, 1440)]
    public int PosAutoLogoffMinutes { get; set; } = 15;

    [Range(1, 1440)]
    public int SuperAdminTimeoutMinutes { get; set; } = 60;
}
