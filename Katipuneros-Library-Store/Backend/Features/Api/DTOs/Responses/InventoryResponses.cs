// [Layer: Features/Api/DTOs/Responses]
// InventoryResponses.cs -- DTO response contracts for physical stacks inventory and barcode audits.
// Expresses all contracts cleanly per AGENTS.md and SKILL.md.

namespace Backend.Features.Api.DTOs.Responses;

public class InventoryMetricsResponse
{
    public int TotalRegistered { get; set; }
    public int OnShelfActive { get; set; }
    public double OnShelfPercentage { get; set; }
    public int CirculatingLoan { get; set; }
    public double CirculatingPercentage { get; set; }
    public int StagedForHolds { get; set; }
    public double StagedPercentage { get; set; }
    public int InMaintenance { get; set; }
    public double MaintenancePercentage { get; set; }
    public int LostDiscrepancy { get; set; }
    public double LostPercentage { get; set; }
}

public class PhysicalInventoryItemResponse
{
    public string Id { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public string RfidTag { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Edition { get; set; } = string.Empty;
    public string DeweyCode { get; set; } = string.Empty;
    public string BayLocation { get; set; } = string.Empty;
    public string Wing { get; set; } = string.Empty;
    public string Condition { get; set; } = "Mint / Good";
    public string ConditionStatus { get; set; } = "good";
    public string Status { get; set; } = "Available";
    public string CustodyDetails { get; set; } = "Public shelf inventory";
    public string AcquiredDate { get; set; } = string.Empty;
    public string? LabelDescription { get; set; }
    public bool IsAuditRequired { get; set; }
}

public class ReplacementItemResponse
{
    public string Id { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string DeweyCode { get; set; } = string.Empty;
    public int CurrentWearCycles { get; set; }
    public int CycleThreshold { get; set; } = 50;
    public string WearSeverity { get; set; } = "Moderate";
    public int EstimatedCost { get; set; }
    public string PreservationWing { get; set; } = "Preservation Wing";
}
