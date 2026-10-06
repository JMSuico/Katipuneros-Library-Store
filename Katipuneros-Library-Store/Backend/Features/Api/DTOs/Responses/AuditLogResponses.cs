// [Layer: Backend/Features/Api/DTOs/Responses]
// AuditLogResponses.cs -- Response DTOs for Audit Logs, Merkle Root, and Security Metrics.
// Strictly adheres to AGENTS.md and SKILL.md.

namespace Backend.Features.Api.DTOs.Responses;

public class AuditLogTableEntryDto
{
    public string Id { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string FormattedTimestamp { get; set; } = string.Empty;
    public string UserIdentity { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // ADMIN, CASHIER, CUSTOMER
    public string ModuleScope { get; set; } = string.Empty;
    public string EventAction { get; set; } = string.Empty;
    public string RecordRef { get; set; } = string.Empty;
    public string DeltaModification { get; set; } = string.Empty;
    public string NodeIp { get; set; } = string.Empty;
    public string IntegritySeal { get; set; } = string.Empty;
    public string IntegritySealShort { get; set; } = string.Empty;
    public string Severity { get; set; } = "Info"; // Info, Warning, Critical
    public string RawPayloadJson { get; set; } = string.Empty;
}

public class AuditMetricsResponseDto
{
    public int TotalEvents24h { get; set; }
    public double EventsGrowthRate { get; set; }
    public int SecurityAnomaliesCount { get; set; }
    public double HashChainStatusPercent { get; set; }
    public int LastValidatedBlock { get; set; }
    public int ActiveSuperAdminSessions { get; set; }
    public string SuperAdminLocations { get; set; } = "HQ Console & Terminal Alpha";
}

public class MerkleRootResponseDto
{
    public string MerkleRoot { get; set; } = string.Empty;
    public int VerifiedRecordsCount { get; set; }
    public bool IsChainIntact { get; set; }
    public string StatusMessage { get; set; } = string.Empty;
    public string LastValidatedTimeAgo { get; set; } = "2m ago";
}

public class PagedAuditLogsResponseDto
{
    public List<AuditLogTableEntryDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}
