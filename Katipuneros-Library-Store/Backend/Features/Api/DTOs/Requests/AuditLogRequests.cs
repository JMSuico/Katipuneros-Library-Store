// [Layer: Backend/Features/Api/DTOs/Requests]
// AuditLogRequests.cs -- Request DTOs for Audit Logs filtering and operations.
// Strictly adheres to AGENTS.md and SKILL.md.

namespace Backend.Features.Api.DTOs.Requests;

public class AuditLogQueryRequest
{
    public string? SearchTerm { get; set; }
    public string? Severity { get; set; } // All Severities, Info, Warning, Critical
    public string? Module { get; set; } // All Modules, or specific module
    public string? Timeframe { get; set; } // Today, 7D, 30D, Custom
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class BulkDeleteAuditLogsRequest
{
    public List<Guid> Ids { get; set; } = new();
}
