// [Layer: Features/Services/Interfaces]
// IInventoryService.cs -- Service interface for administrative physical stacks inventory and barcode audits.
// Expresses all sync and async routines via clean lambda expressions.
// DO NOT put HTTP concerns or direct DB queries here.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Responses;

namespace Backend.Features.Services.Interfaces;

public interface IInventoryService
{
    Task<InventoryMetricsResponse> GetMetricsAsync();
    Task<List<PhysicalInventoryItemResponse>> GetAuditListAsync();
    Task<List<ReplacementItemResponse>> GetReplacementsAsync();
    Task<(bool Success, string? Error)> UpdateStatusAsync(Guid id, string status, string? condition, string? rationale);
    Task<(bool Success, string? Error)> AddLabelDescriptionAsync(Guid id, string labelDescription, string? spineNote, bool? markForPrintQueue);
    Task<(int Count, string? Error)> IngestBarcodesAsync(string bookTitle, string? deweyCode, string bayLocation, List<string> barcodes);
    Task<(int Count, string? Error)> BulkDeleteAsync(List<Guid> ids);
    Task<(int SyncedCount, string Message)> TriggerMarcSyncAsync();
}
