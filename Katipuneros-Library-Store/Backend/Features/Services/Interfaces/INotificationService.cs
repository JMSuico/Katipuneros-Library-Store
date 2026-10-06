// [Layer: Features/Services/Interfaces]
// INotificationService.cs -- Service interface for administrative notifications, campus announcements CRUD, automated dispatch queue, and system alerts.
// DO NOT put business logic, controllers, or database implementations here.

using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;

namespace Backend.Features.Services.Interfaces;

public interface INotificationService
{
    Task<TopBentoMetricsResponse> GetTopBentoMetricsAsync();
    Task<List<SystemAlertResponse>> GetSystemAlertsAsync();
    Task<bool> ResolveAllAlertsAsync();
    Task<bool> TriggerAcquisitionOrderAsync(TriggerAcquisitionRequest req);
    Task<bool> SendRegistrarNoticeAsync(SendRegistrarNoticeRequest req);
    Task<bool> PingHardwareTeamAsync(PingHardwareRequest req);
    Task<bool> RepollHardwareSocketAsync();

    Task<AnnouncementsPagedResult> GetAnnouncementsAsync(AnnouncementFilterRequest filter);
    Task<AnnouncementResponse> CreateAnnouncementAsync(CreateAnnouncementRequest req);
    Task<AnnouncementResponse?> UpdateAnnouncementAsync(string id, UpdateAnnouncementRequest req);
    Task<bool> DeleteAnnouncementAsync(string id);
    Task<int> BulkDeleteAnnouncementsAsync(List<string> ids);
    Task<AnnouncementResponse?> ToggleUnpublishAsync(string id);
    Task<AnnouncementAnalyticsResponse?> GetAnnouncementAnalyticsAsync(string id);

    Task<DispatchQueueTelemetryResponse> GetDispatchQueueTelemetryAsync();
    Task<List<DispatchTransactionResponse>> GetDispatchTransactionsAsync();
    Task<List<DispatchTemplateResponse>> GetDispatchTemplatesAsync();
}
