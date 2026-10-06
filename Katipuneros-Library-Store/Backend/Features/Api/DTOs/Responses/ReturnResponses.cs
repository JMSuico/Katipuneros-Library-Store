// [Layer: Features/Api/DTOs/Responses]
// ReturnResponses.cs -- Response DTOs for returns circulation, damaged inspection cases, and settlement logs.
// Data contracts ONLY.
// DO NOT put business logic or database queries here.

using System;
using System.Collections.Generic;

namespace Backend.Features.Api.DTOs.Responses;

public class ReturnsMetricsResponse
{
    public int VolumesCheckedIn { get; set; }
    public double CapacityPercent { get; set; }
    public double TrendingVsAvg { get; set; }
    public double OnTimeReturnRate { get; set; }
    public double RateDelta { get; set; }
    public int OnTimeCount { get; set; }
    public int LateCount { get; set; }
    public string SlaStatus { get; set; } = "Within SLA";
    public decimal DelinquencyFinesTally { get; set; }
    public decimal PendingLedgerAmount { get; set; }
    public int UnsettledCount { get; set; }
    public double CollectionRate { get; set; }
    public int FlaggedForBinderyCount { get; set; }
    public int SpineDamageCount { get; set; }
    public int WaterWarpCount { get; set; }
}

public class ReturnJournalItemResponse
{
    public Guid Id { get; set; }
    public string ReturnCode { get; set; } = string.Empty;
    public DateTime ReturnTimestamp { get; set; }
    public string PatronName { get; set; } = string.Empty;
    public string PatronLibraryId { get; set; } = string.Empty;
    public string PatronProgram { get; set; } = "Undergrad";
    public string BookTitle { get; set; } = string.Empty;
    public string BookBarcode { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public int OverdueDays { get; set; }
    public decimal AssessedFine { get; set; }
    public string FineNote { get; set; } = string.Empty;
    public string ConditionGrade { get; set; } = "Good Condition";
    public string ClearanceStatus { get; set; } = "Cleared";
    public string StationDesk { get; set; } = "Cashier Bay 01";
    public string TerminalId { get; set; } = "T-04";
    public string? ConditionNotes { get; set; }
}

public class DamagedAssessmentCaseResponse
{
    public Guid Id { get; set; }
    public string CaseReference { get; set; } = "#CASE-QA-3194";
    public string Severity { get; set; } = "Severe Fault";
    public string BookTitle { get; set; } = "Philippine Flora & Forest";
    public string BookBarcode { get; set; } = "#KP-BC-3194-02";
    public string? BookCoverImage { get; set; }
    public string ReportedBy { get; set; } = "Bay 01 Specialist";
    public string DamageType { get; set; } = "Spine Separation";
    public decimal AssessedPenalty { get; set; } = 280.00m;
    public string PatronResponsible { get; set; } = "C. M. Ilustre";
    public string PatronLibraryId { get; set; } = "#KP-2021-04288";
    public string PatronStatus { get; set; } = "Scholar";
    public string EstRepairTime { get; set; } = "3-5 Workdays";
    public string Status { get; set; } = "Active Triage";
    public string? RoutingDestination { get; set; }
    public DateTime FlaggedDate { get; set; }
}
