// [Layer: Features/Api/Controllers]
// ReportsController.cs -- REST API endpoints for administrative reports, statutory dossiers, audit attestation ledger, and schedule automation.
// Parses HTTP requests, calls IReportService, returns IActionResult.
// DO NOT put business logic or direct database queries here.

using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Features.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly IUserService _userService;
    private readonly IBookService _bookService;
    private readonly IBorrowService _borrowService;
    private readonly IReservationService _reservationService;

    public ReportsController(
        IReportService reportService,
        IUserService userService,
        IBookService bookService,
        IBorrowService borrowService,
        IReservationService reservationService) =>
        (_reportService, _userService, _bookService, _borrowService, _reservationService) =
        (reportService, userService, bookService, borrowService, reservationService);

    /// <summary> Retrieve executive analytics summary counts for reports dashboard </summary>
    [HttpGet("/api/admin/metrics")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAdminMetricsSummary()
    {
        var users = await _userService.GetAllUsersAsync(null);
        var books = await _bookService.GetCatalogAsync(null, null, null);
        var borrowMetrics = await _borrowService.GetMetricsAsync();
        var resMetrics = await _reservationService.GetMetricsAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            totalUsers = users.Count,
            totalBooks = books.Count,
            activeLoans = borrowMetrics.TotalActiveBorrowings,
            pendingReservations = resMetrics.PendingReview,
            finesCollected = borrowMetrics.CumulativeFines
        }));
    }

    /// <summary> Retrieve official report suites and statutory configurations </summary>
    [HttpGet("suites")]
    [ProducesResponseType(typeof(ApiResponse<List<ReportSuiteResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSuites() =>
        Ok(ApiResponse<List<ReportSuiteResponse>>.Ok(await _reportService.GetReportSuitesAsync()));

    /// <summary> Create a new official report suite configuration </summary>
    [HttpPost("suites")]
    [ProducesResponseType(typeof(ApiResponse<ReportSuiteResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateSuite([FromBody] CreateReportSuiteRequest req)
    {
        var created = await _reportService.CreateReportSuiteAsync(req);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<ReportSuiteResponse>.Ok(created));
    }

    /// <summary> Update an existing official report suite configuration </summary>
    [HttpPut("suites/{id}")]
    [ProducesResponseType(typeof(ApiResponse<ReportSuiteResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSuite(string id, [FromBody] CreateReportSuiteRequest req)
    {
        var updated = await _reportService.UpdateReportSuiteAsync(id, req);
        if (updated == null)
            return NotFound(ApiResponse<string>.Fail($"Report suite with ID '{id}' was not found."));

        return Ok(ApiResponse<ReportSuiteResponse>.Ok(updated));
    }

    /// <summary> Delete an official report suite configuration </summary>
    [HttpDelete("suites/{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSuite(string id)
    {
        var deleted = await _reportService.DeleteReportSuiteAsync(id);
        if (!deleted)
            return NotFound(ApiResponse<string>.Fail($"Report suite with ID '{id}' was not found."));

        return Ok(ApiResponse<bool>.Ok(true));
    }

    /// <summary> Retrieve paginated completed dossiers ledger with multi-filters </summary>
    [HttpGet("ledger")]
    [ProducesResponseType(typeof(ApiResponse<ReportPagedResult<CompletedDossierResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLedger([FromQuery] ReportFilterRequest req) =>
        Ok(ApiResponse<ReportPagedResult<CompletedDossierResponse>>.Ok(await _reportService.GetCompletedDossiersAsync(req)));

    /// <summary> Retrieve curricular disciplinary share and equilibrium index </summary>
    [HttpGet("disciplinary-share")]
    [ProducesResponseType(typeof(ApiResponse<DisciplinaryShareResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDisciplinaryShare() =>
        Ok(ApiResponse<DisciplinaryShareResponse>.Ok(await _reportService.GetDisciplinaryShareAsync()));

    /// <summary> Retrieve cryptographic audit ledger stats </summary>
    [HttpGet("audit-stats")]
    [ProducesResponseType(typeof(ApiResponse<AuditStatsResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditStats() =>
        Ok(ApiResponse<AuditStatsResponse>.Ok(await _reportService.GetAuditStatsAsync()));

    /// <summary> Retrieve attestation records and SHA-256 signatures </summary>
    [HttpGet("audit-attestations")]
    [ProducesResponseType(typeof(ApiResponse<List<AuditAttestationResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditAttestations() =>
        Ok(ApiResponse<List<AuditAttestationResponse>>.Ok(await _reportService.GetAuditAttestationsAsync()));

    /// <summary> Retrieve recurring statutory dispatch schedules </summary>
    [HttpGet("schedules")]
    [ProducesResponseType(typeof(ApiResponse<List<ScheduleTriggerResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSchedules() =>
        Ok(ApiResponse<List<ScheduleTriggerResponse>>.Ok(await _reportService.GetScheduleTriggersAsync()));

    /// <summary> Generate official report dossier with SHA-256 cryptographic watermark </summary>
    [HttpPost("generate")]
    [ProducesResponseType(typeof(ApiResponse<CompletedDossierResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GenerateDossier([FromBody] GenerateReportRequest req) =>
        Ok(ApiResponse<CompletedDossierResponse>.Ok(await _reportService.GenerateDossierAsync(req)));

    /// <summary> Verify SHA-256 seal against immutable ledger without biometrics </summary>
    [HttpPost("verify-seal")]
    [ProducesResponseType(typeof(ApiResponse<VerifySealResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerifySeal([FromBody] VerifySealRequest req) =>
        Ok(ApiResponse<VerifySealResponse>.Ok(await _reportService.VerifySealAsync(req)));

    /// <summary> Execute bulk deletion or archival on selected dossier IDs </summary>
    [HttpPost("bulk-action")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> BulkAction([FromBody] ReportBulkActionRequest req) =>
        Ok(ApiResponse<bool>.Ok(await _reportService.ExecuteBulkActionAsync(req)));

    /// <summary> Dispatch recurring schedule task immediately </summary>
    [HttpPost("schedules/{id}/run-now")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RunScheduleNow(string id) =>
        Ok(ApiResponse<bool>.Ok(await _reportService.RunScheduleNowAsync(id)));
}
