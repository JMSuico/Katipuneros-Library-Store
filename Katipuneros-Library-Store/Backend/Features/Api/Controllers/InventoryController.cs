// [Layer: Features/Api/Controllers]
// InventoryController.cs -- API endpoints for administrative physical inventory, stacks audits, and barcode maintenance.
// Parses requests, validates DTOs, calls IInventoryService, and returns IActionResult.
// Expresses all sync and async routines via clean lambda expressions (=>).
// DO NOT put business logic or direct database queries here.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Api.Controllers;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Cashier,Admin")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService) =>
        _inventoryService = inventoryService;

    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics() =>
        Ok(ApiResponse<InventoryMetricsResponse>.Ok(await _inventoryService.GetMetricsAsync(), "Physical stacks metrics retrieved."));

    [HttpGet("audit")]
    public async Task<IActionResult> GetAuditList() =>
        Ok(ApiResponse<List<PhysicalInventoryItemResponse>>.Ok(await _inventoryService.GetAuditListAsync(), "Inventory audit records retrieved."));

    [HttpGet("replacements")]
    public async Task<IActionResult> GetReplacements() =>
        Ok(ApiResponse<List<ReplacementItemResponse>>.Ok(await _inventoryService.GetReplacementsAsync(), "Replacement inventory records retrieved."));

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateInventoryStatusRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid status update payload."))
            : await _inventoryService.UpdateStatusAsync(id, request.Status, request.Condition, request.Rationale) switch
            {
                (true, _) => Ok(ApiResponse<object>.Ok(new { id, request.Status }, $"Inventory status updated to {request.Status}.")),
                (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to update inventory status."))
            };

    [HttpPut("{id:guid}/label")]
    public async Task<IActionResult> AddLabel(Guid id, [FromBody] AddLabelDescriptionRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid label description payload."))
            : await _inventoryService.AddLabelDescriptionAsync(id, request.LabelDescription, request.SpineNote, request.MarkForPrintQueue) switch
            {
                (true, _) => Ok(ApiResponse<object>.Ok(new { id }, "Label description updated.")),
                (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to update label."))
            };

    [HttpPost("barcodes")]
    public async Task<IActionResult> IngestBarcodes([FromBody] IngestBarcodesRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid barcode ingestion payload."))
            : await _inventoryService.IngestBarcodesAsync(request.BookTitle, request.DeweyCode, request.BayLocation, request.Barcodes) switch
            {
                (var count, null) => Ok(ApiResponse<object>.Ok(new { count }, $"{count} barcodes ingested into stacks registry.")),
                (_, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to ingest barcodes."))
            };

    [HttpPost("bulk-delete")]
    public async Task<IActionResult> BulkDelete([FromBody] BulkDeleteInventoryRequest request)
    {
        var guids = new List<Guid>();
        foreach (var idStr in request.Ids)
        {
            if (Guid.TryParse(idStr, out var g)) guids.Add(g);
        }
        return await _inventoryService.BulkDeleteAsync(guids) switch
        {
            (var count, null) => Ok(ApiResponse<object>.Ok(new { count }, $"{count} volumes de-accessioned.")),
            (_, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to delete inventory volumes."))
        };
    }

    [HttpPost("marc-sync")]
    public async Task<IActionResult> TriggerMarcSync()
    {
        var (syncedCount, message) = await _inventoryService.TriggerMarcSyncAsync();
        return Ok(ApiResponse<object>.Ok(new { syncedCount, message }));
    }
}
