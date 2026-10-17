// [Layer: Features/Api/Controllers]
// NotificationsController.cs -- REST API endpoints for institutional communications, campus bulletins, automated dispatch queue, and hardware alerts.
// Parses HTTP requests, calls INotificationService, returns IActionResult.
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
// Authorization is applied per-action rather than at the class level.
//
// The circulation desk needs READ access to the alert feed and top metrics so its
// terminal can show live circulation alerts. Everything that mutates institutional
// state -- resolving alerts, publishing or deleting campus announcements, registrar
// notices, acquisition orders, hardware tickets -- stays Admin-only.
//
// A blanket class-level [Authorize(Roles="Admin")] made every Cashier request 403,
// and because the frontend apiClient never throws, those failures rendered as an
// empty alert list indistinguishable from "no alerts".
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService) =>
        _notificationService = notificationService;

    /// <summary> Get Top 4 Bento Mosaic metrics </summary>
    [HttpGet("top-metrics")]
    [Authorize(Roles = "Admin, Cashier")]
    [ProducesResponseType(typeof(ApiResponse<TopBentoMetricsResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTopMetrics() =>
        Ok(ApiResponse<TopBentoMetricsResponse>.Ok(await _notificationService.GetTopBentoMetricsAsync()));

    /// <summary> Retrieve active real-time administrative system alerts feed </summary>
    [HttpGet("alerts")]
    [Authorize(Roles = "Admin, Cashier")]
    [ProducesResponseType(typeof(ApiResponse<List<SystemAlertResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAlerts() =>
        Ok(ApiResponse<List<SystemAlertResponse>>.Ok(await _notificationService.GetSystemAlertsAsync()));

    /// <summary> Mark all active administrative alerts resolved </summary>
    [HttpPost("alerts/resolve-all")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ResolveAllAlerts() =>
        Ok(ApiResponse<bool>.Ok(await _notificationService.ResolveAllAlertsAsync(), "All administrative alerts successfully resolved."));

    /// <summary> Trigger acquisition order for monographs with critical reserve deficit </summary>
    [HttpPost("alerts/trigger-acquisition")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> TriggerAcquisition([FromBody] TriggerAcquisitionRequest req) =>
        Ok(ApiResponse<bool>.Ok(await _notificationService.TriggerAcquisitionOrderAsync(req), "Acquisition order dispatched to library acquisitions team."));

    /// <summary> Send formal registrar notice regarding delinquent patrons </summary>
    [HttpPost("alerts/send-registrar-notice")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SendRegistrarNotice([FromBody] SendRegistrarNoticeRequest req) =>
        Ok(ApiResponse<bool>.Ok(await _notificationService.SendRegistrarNoticeAsync(req), "Formal notice dispatched to Registrar and Dean of Admissions."));

    /// <summary> Ping hardware maintenance team regarding equipment failure </summary>
    [HttpPost("alerts/ping-hardware")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> PingHardware([FromBody] PingHardwareRequest req) =>
        Ok(ApiResponse<bool>.Ok(await _notificationService.PingHardwareTeamAsync(req), "Urgent hardware ticket dispatched to Facilities & IT team."));

    /// <summary> Re-poll turnstile/RFID hardware socket heartbeat </summary>
    [HttpPost("alerts/repoll-hardware")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RepollHardware() =>
        Ok(ApiResponse<bool>.Ok(await _notificationService.RepollHardwareSocketAsync(), "Hardware reader ping test completed successfully."));

    /// <summary> Retrieve paginated campus announcements with search and status filtering </summary>
    [HttpGet("announcements")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<AnnouncementsPagedResult>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAnnouncements([FromQuery] AnnouncementFilterRequest filter) =>
        Ok(ApiResponse<AnnouncementsPagedResult>.Ok(await _notificationService.GetAnnouncementsAsync(filter)));

    /// <summary> Create a new campus announcement </summary>
    [HttpPost("announcements")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<AnnouncementResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateAnnouncement([FromBody] CreateAnnouncementRequest req)
    {
        var created = await _notificationService.CreateAnnouncementAsync(req);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<AnnouncementResponse>.Ok(created, "Announcement published successfully."));
    }

    /// <summary> Update an existing campus announcement </summary>
    [HttpPut("announcements/{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<AnnouncementResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAnnouncement(string id, [FromBody] UpdateAnnouncementRequest req)
    {
        var updated = await _notificationService.UpdateAnnouncementAsync(id, req);
        if (updated == null)
            return NotFound(ApiResponse<string>.Fail($"Announcement with ID '{id}' was not found."));

        return Ok(ApiResponse<AnnouncementResponse>.Ok(updated, "Announcement updated successfully."));
    }

    /// <summary> Delete a campus announcement </summary>
    [HttpDelete("announcements/{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAnnouncement(string id)
    {
        var deleted = await _notificationService.DeleteAnnouncementAsync(id);
        if (!deleted)
            return NotFound(ApiResponse<string>.Fail($"Announcement with ID '{id}' was not found."));

        return Ok(ApiResponse<bool>.Ok(true, "Announcement deleted successfully."));
    }

    /// <summary> Bulk delete campus announcements </summary>
    [HttpPost("announcements/bulk-delete")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> BulkDeleteAnnouncements([FromBody] BulkDeleteAnnouncementsRequest req) =>
        Ok(ApiResponse<int>.Ok(await _notificationService.BulkDeleteAnnouncementsAsync(req.Ids), $"Successfully deleted {req.Ids.Count} announcements."));

    /// <summary> Toggle publish / unpublish status of an announcement </summary>
    [HttpPut("announcements/{id}/unpublish")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<AnnouncementResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleUnpublish(string id)
    {
        var result = await _notificationService.ToggleUnpublishAsync(id);
        if (result == null)
            return NotFound(ApiResponse<string>.Fail($"Announcement with ID '{id}' was not found."));

        return Ok(ApiResponse<AnnouncementResponse>.Ok(result, $"Announcement status updated to '{result.Status}'."));
    }

    /// <summary> Get analytics breakdown for a specific announcement </summary>
    [HttpGet("announcements/{id}/analytics")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<AnnouncementAnalyticsResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAnnouncementAnalytics(string id)
    {
        var result = await _notificationService.GetAnnouncementAnalyticsAsync(id);
        if (result == null)
            return NotFound(ApiResponse<string>.Fail($"Announcement with ID '{id}' was not found."));

        return Ok(ApiResponse<AnnouncementAnalyticsResponse>.Ok(result));
    }

    /// <summary> Retrieve automated dispatch queue telemetry metrics </summary>
    [HttpGet("dispatch-queue/telemetry")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<DispatchQueueTelemetryResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDispatchTelemetry() =>
        Ok(ApiResponse<DispatchQueueTelemetryResponse>.Ok(await _notificationService.GetDispatchQueueTelemetryAsync()));

    /// <summary> Retrieve live dispatch transaction stream </summary>
    [HttpGet("dispatch-queue/transactions")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<List<DispatchTransactionResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDispatchTransactions() =>
        Ok(ApiResponse<List<DispatchTransactionResponse>>.Ok(await _notificationService.GetDispatchTransactionsAsync()));

    /// <summary> Retrieve patron dispatch templates </summary>
    [HttpGet("dispatch-queue/templates")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<List<DispatchTemplateResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDispatchTemplates() =>
        Ok(ApiResponse<List<DispatchTemplateResponse>>.Ok(await _notificationService.GetDispatchTemplatesAsync()));
}
