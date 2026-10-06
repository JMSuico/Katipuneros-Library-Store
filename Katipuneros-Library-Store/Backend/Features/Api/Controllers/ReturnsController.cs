// [Layer: Features/Api/Controllers]
// ReturnsController.cs -- REST API endpoints for admin returns journal, damaged book QA, and bindery routing.
// Parses HTTP requests, validates DTOs, calls IReturnService, and returns IActionResult.
// DO NOT put business logic or direct database queries here.

using System;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Cashier,Admin")]
public class ReturnsController : ControllerBase
{
    private readonly IReturnService _returnService;

    public ReturnsController(IReturnService returnService) =>
        _returnService = returnService;

    /// <summary> Get real-time returns KPI metrics with zero-data fallback </summary>
    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics() =>
        Ok(ApiResponse<ReturnsMetricsResponse>.Ok(await _returnService.GetReturnsMetricsAsync()));

    /// <summary> Get paginated and filtered returns journal </summary>
    [HttpGet("journal")]
    public async Task<IActionResult> GetJournal([FromQuery] string? status, [FromQuery] string? query) =>
        Ok(ApiResponse<object>.Ok(await _returnService.GetReturnsJournalAsync(status, query)));

    /// <summary> Get the active damaged book assessment case for protocol inspection </summary>
    [HttpGet("active-damaged-case")]
    public async Task<IActionResult> GetActiveDamagedCase() =>
        Ok(ApiResponse<DamagedAssessmentCaseResponse>.Ok(await _returnService.GetActiveDamagedCaseAsync()));

    /// <summary> Route damaged volume to Campus Bindery Unit </summary>
    [HttpPost("route-bindery")]
    public async Task<IActionResult> RouteToBindery([FromBody] RoutingActionRequest request) =>
        await ProcessAction(request with { Action = "RouteBindery" });

    /// <summary> Order publisher replacement for unrepairable volume </summary>
    [HttpPost("order-replacement")]
    public async Task<IActionResult> OrderReplacement([FromBody] RoutingActionRequest request) =>
        await ProcessAction(request with { Action = "OrderReplacement" });

    /// <summary> Deaccession copy and route to salvage archive </summary>
    [HttpPost("deaccession-salvage")]
    public async Task<IActionResult> DeaccessionSalvage([FromBody] RoutingActionRequest request) =>
        await ProcessAction(request with { Action = "DeaccessionSalvage" });

    /// <summary> Authorize conservation routing and assess rebind fee </summary>
    [HttpPost("authorize-routing")]
    public async Task<IActionResult> AuthorizeRouting([FromBody] RoutingActionRequest request) =>
        await ProcessAction(request with { Action = "AuthorizeRouting" });

    /// <summary> Place damaged volume on administrative hold </summary>
    [HttpPost("hold")]
    public async Task<IActionResult> HoldCase([FromBody] RoutingActionRequest request) =>
        await ProcessAction(request with { Action = "Hold" });

    /// <summary> Process bulk intake check-in </summary>
    [HttpPost("bulk-checkin")]
    public async Task<IActionResult> BulkCheckin([FromBody] BulkCheckinRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid bulk check-in payload."))
            : await _returnService.ProcessBulkCheckinAsync(
                request,
                Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty
            ) switch
            {
                (true, var count, var msg) => Ok(ApiResponse<object>.Ok(new { count }, msg)),
                (false, _, var err) => BadRequest(ApiResponse<object>.Fail(err))
            };

    /// <summary> Export returns journal with date range, alphabetical, and ID filters </summary>
    [HttpGet("export")]
    public async Task<IActionResult> ExportReturns([FromQuery] ExportReturnsQuery query)
    {
        var records = await _returnService.GetReturnsJournalAsync();

        if (query.StartDate.HasValue)
            records = records.Where(r => r.ReturnTimestamp >= query.StartDate.Value).ToList();
        if (query.EndDate.HasValue)
            records = records.Where(r => r.ReturnTimestamp <= query.EndDate.Value).ToList();

        if (!string.IsNullOrWhiteSpace(query.AlphabeticalFilter))
        {
            var letter = query.AlphabeticalFilter.Trim().ToLower();
            records = records.Where(r =>
                r.BookTitle.ToLower().Contains(letter) ||
                r.PatronName.ToLower().Contains(letter)).ToList();
        }

        if (!string.IsNullOrWhiteSpace(query.IdFilter))
        {
            var idPart = query.IdFilter.Trim().ToLower();
            records = records.Where(r =>
                r.ReturnCode.ToLower().Contains(idPart) ||
                r.PatronLibraryId.ToLower().Contains(idPart) ||
                r.BookBarcode.ToLower().Contains(idPart)).ToList();
        }

        if (string.Equals(query.SortDirection, "desc", StringComparison.OrdinalIgnoreCase))
            records = records.OrderByDescending(r => r.ReturnTimestamp).ToList();
        else
            records = records.OrderBy(r => r.ReturnTimestamp).ToList();

        var sb = new StringBuilder();
        sb.AppendLine("ReturnCode,PatronName,PatronLibraryId,PatronProgram,BookTitle,BookBarcode,ReturnDate,DueDate,OverdueDays,AssessedFine,ConditionGrade,ClearanceStatus,StationDesk,TerminalId");
        foreach (var r in records)
        {
            sb.AppendLine($"\"{r.ReturnCode}\",\"{r.PatronName.Replace("\"", "\"\"")}\",\"{r.PatronLibraryId}\",\"{r.PatronProgram}\",\"{r.BookTitle.Replace("\"", "\"\"")}\",\"{r.BookBarcode}\",\"{r.ReturnTimestamp:yyyy-MM-dd HH:mm}\",\"{r.DueDate:yyyy-MM-dd}\",{r.OverdueDays},{r.AssessedFine:F2},\"{r.ConditionGrade}\",\"{r.ClearanceStatus}\",\"{r.StationDesk}\",\"{r.TerminalId}\"");
        }

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv", $"Returns_Journal_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv");
    }

    private async Task<IActionResult> ProcessAction(RoutingActionRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid routing payload."))
            : await _returnService.ProcessRoutingActionAsync(
                request,
                Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty
            ) switch
            {
                (true, var msg) => Ok(ApiResponse<object>.Ok(new { status = "Success" }, msg)),
                (false, var err) => BadRequest(ApiResponse<object>.Fail(err))
            };
}
