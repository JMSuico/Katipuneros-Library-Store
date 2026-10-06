// [Layer: Api/DTOs/Responses]
// SettingsResponses.cs -- Outgoing response DTOs for system settings, policy governance, archives, and CIDR subnets.
// Contains data transfer shapes ONLY.
// DO NOT put business logic or persistence code here.

using Backend.Features.Api.DTOs.Requests;

namespace Backend.Features.Api.DTOs.Responses;

public class CirculationPolicyResponse
{
    public TierPolicyDto Tier1 { get; set; } = new()
    {
        DaysDuration = 14,
        MaxConcurrency = 4,
        RenewalLimit = "1 Time (7d)",
        HoldQueueLimit = 2,
        OverdueTariff = "Standard Daily"
    };

    public TierPolicyDto Tier2 { get; set; } = new()
    {
        DaysDuration = 28,
        MaxConcurrency = 8,
        RenewalLimit = "2 Times (14d)",
        HoldQueueLimit = 5,
        OverdueTariff = "Standard Daily"
    };

    public TierPolicyDto Tier3 { get; set; } = new()
    {
        DaysDuration = 60,
        MaxConcurrency = 15,
        RenewalLimit = "Auto Semester",
        HoldQueueLimit = 10,
        OverdueTariff = "Waived 1st Cycle"
    };

    public int GracePeriodHours { get; set; } = 24;
    public int ActiveBorrowersCovered { get; set; }
    public int CirculatingTitleCatalog { get; set; }
    public string InterLibraryLoanProtocol { get; set; } = "Katipunan Consortium";
}

public class ReservationSetupsResponse
{
    public bool InstantReshelveNotice { get; set; } = true;
    public bool ThesisScholarPriority { get; set; } = true;
    public string PickupNotificationCadence { get; set; } = "3 Alerts (Deposit / 24h / 6h)";
}

public class FineTariffsResponse
{
    public decimal DailyOverdueTariff { get; set; } = 15.00m;
    public decimal MaxPenaltyCap { get; set; } = 500.00m;
    public decimal BindingRepairTariff { get; set; } = 280.00m;
    public decimal LostBookAdministrativeFee { get; set; } = 150.00m;
    public bool MedicalWaiverEnabled { get; set; } = true;
    public bool TyphoonWaiverEnabled { get; set; } = true;
}

public class SecurityGovernanceResponse
{
    public int PosAutoLogoffMinutes { get; set; } = 15;
    public int SuperAdminTimeoutMinutes { get; set; } = 60;
    public string AuditNodeStatus { get; set; } = "Nominal";
    public int HashChainLength { get; set; }
    public string HmacKeyStatus { get; set; } = "Rotated (3d ago)";
}

public class SystemSettingsResponse
{
    public CirculationPolicyResponse Circulation { get; set; } = new();
    public ReservationSetupsResponse Reservations { get; set; } = new();
    public FineTariffsResponse Fines { get; set; } = new();
    public SecurityGovernanceResponse Security { get; set; } = new();
    public SecurityTelemetryDto Telemetry { get; set; } = new();
}

public class CidrSubnetDto
{
    public Guid Id { get; set; }
    public string CidrRange { get; set; } = string.Empty;
    public string NetworkClassification { get; set; } = string.Empty;
    public string AccessLevel { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ArchiveModuleSummaryDto
{
    public string ModuleName { get; set; } = string.Empty;
    public int ActiveRecords { get; set; }
    public int ArchivedRecords { get; set; }
    public long StorageFootprintBytes { get; set; }
    public DateTime? LastArchivedDate { get; set; }
    public int RetentionDays { get; set; }
    public string Sha256Seal { get; set; } = string.Empty;
}

public class SecurityTelemetryDto
{
    public int TotalSystemEvents24h { get; set; }
    public double EventsGrowthRate { get; set; }
    public int SecurityAnomalies { get; set; }
    public string HashChainStatus { get; set; } = "100%";
    public string LastValidatedBlock { get; set; } = "Block #41,922 validated 2m ago";
    public int ActiveSuperAdminSessions { get; set; }
}
