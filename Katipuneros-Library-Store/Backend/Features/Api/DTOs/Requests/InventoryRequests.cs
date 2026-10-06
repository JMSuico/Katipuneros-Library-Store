// [Layer: Features/Api/DTOs/Requests]
// InventoryRequests.cs -- DTO request contracts for physical stacks updates, barcode ingestion, and auditing.
// Expresses all contracts cleanly per AGENTS.md and SKILL.md.

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Api.DTOs.Requests;

public class UpdateInventoryStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;
    public string? Condition { get; set; }
    public string? Rationale { get; set; }
}

public class AddLabelDescriptionRequest
{
    [Required]
    public string LabelDescription { get; set; } = string.Empty;
    public string? SpineNote { get; set; }
    public bool? MarkForPrintQueue { get; set; }
}

public class IngestBarcodesRequest
{
    [Required]
    public string BookTitle { get; set; } = string.Empty;
    public string? DeweyCode { get; set; }
    [Required]
    public string BayLocation { get; set; } = string.Empty;
    public List<string> Barcodes { get; set; } = [];
}

public class BulkDeleteInventoryRequest
{
    public List<string> Ids { get; set; } = [];
}
