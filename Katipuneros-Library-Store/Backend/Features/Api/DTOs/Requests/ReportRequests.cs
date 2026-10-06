// [Layer: Features/Api/DTOs/Requests]
// ReportRequests.cs -- Request DTOs for official dossier generation, seal verification, bulk operations, and schedule triggers.
// DO NOT put business logic or validation algorithms here.

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Api.DTOs.Requests;

public class GenerateReportRequest
{
    [Required]
    public string TemplateId { get; set; } = "circulation";

    [Required]
    public string Timeframe { get; set; } = "monthly"; // "daily", "weekly", "monthly", "yearly", "custom"

    public string Discipline { get; set; } = "Universal";

    public string ExportFormat { get; set; } = "PDF"; // "PDF", "CSV", "XLSX"

    public bool AppendDelinquencyBreakdown { get; set; } = true;

    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
}

public class VerifySealRequest
{
    [Required]
    public string HashOrId { get; set; } = string.Empty;
}

public class ReportBulkActionRequest
{
    [Required]
    public string Action { get; set; } = "Delete"; // "Delete", "Archive", "Reseal"

    [Required]
    public List<string> DossierIds { get; set; } = new();
}

public class CreateScheduleRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Required]
    public string CronExpression { get; set; } = "0 5 * * *";

    public string Channel { get; set; } = "Encrypted Mail";

    public string Recipients { get; set; } = string.Empty;
}

public class ReportFilterRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public string? Status { get; set; }
    public string? Sort { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string? Format { get; set; }
    public string? IdFilter { get; set; }
    public string? AlphaFilter { get; set; }
}

public class CreateReportSuiteRequest
{
    [Required]
    public string SuiteCode { get; set; } = string.Empty;

    [Required]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
    public string Standard { get; set; } = "ISO/DIS 11620";
    public string ScopeLabel { get; set; } = "Data Scope:";
    public string ScopeValue { get; set; } = string.Empty;
    public string Icon { get; set; } = "description";
    public List<string> SupportedFormats { get; set; } = new() { "PDF", "CSV", "XLSX" };
}

