// [Layer: Features/Api/DTOs/Responses]
// NotificationResponses.cs -- Data contract responses for campus announcements, system alerts feed, dispatch telemetry, and template catalogs.
// DO NOT put business logic or database queries here.

using System;
using System.Collections.Generic;

namespace Backend.Features.Api.DTOs.Responses;

public class AnnouncementResponse
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Audience { get; set; } = "All Patrons";
    public List<string> Channels { get; set; } = new();
    public string Status { get; set; } = "Live • Published";
    public string Priority { get; set; } = "Standard Campus Bulletin";
    public string ActiveRange { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int ViewsCount { get; set; }
    public int ReadsCount { get; set; }
    public double OpenRate { get; set; }
    public bool IsDraft { get; set; }
}

public class AnnouncementAnalyticsResponse
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int TotalPortalViews { get; set; }
    public int MobilePushReads { get; set; }
    public int KioskImpressions { get; set; }
    public double OverallOpenRate { get; set; }
    public string PrimaryAudience { get; set; } = string.Empty;
    public List<string> ActiveChannels { get; set; } = new();
    public string PerformanceSummary { get; set; } = string.Empty;
}

public class SystemAlertResponse
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = "system"; // "deficit", "delinquency", "hardware", "system"
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Tag { get; set; } = string.Empty;
    public string TriggeredAgo { get; set; } = "Just now";
    public string Description { get; set; } = string.Empty;
    public string Severity { get; set; } = "warning"; // "critical", "warning", "info"
    public bool IsResolved { get; set; }
    public int ActiveReservations { get; set; }
    public int AvailableCopies { get; set; }
    public string? ShelfBay { get; set; }
    public int DelinquentPatronCount { get; set; }
    public string? HardwareIp { get; set; }
}

public class TopBentoMetricsResponse
{
    public int TodayDispatchedTotal { get; set; } = 342;
    public int TodayEmail { get; set; } = 210;
    public int TodaySms { get; set; } = 98;
    public int TodayPush { get; set; } = 34;
    public double DeliveryReliability { get; set; } = 99.4;
    public double DeliveryFailRate { get; set; } = 0.6;
    public int UrgentAlertsCount { get; set; } = 3;
    public int ActiveBulletinsCount { get; set; } = 2;
    public int PortalViewsToday { get; set; } = 1420;
}

public class DispatchQueueTelemetryResponse
{
    public int NextBatchRunSeconds { get; set; } = 165;
    public string NextBatchRunFormatted { get; set; } = "in 02m 45s";
    public int BatchWindowSeconds { get; set; } = 180;
    public bool DaemonRunning { get; set; } = true;
    public double RetryFailureRate { get; set; } = 0.2;
    public int BouncedCount { get; set; } = 1;
    public int TotalSmsCount { get; set; } = 480;
    public int QueueDepth { get; set; } = 14;
    public int PendingEmailCount { get; set; } = 9;
    public int PendingSmsCount { get; set; } = 5;
    public string QueueStatus { get; set; } = "Processing";
    public string TwilioLimit { get; set; } = "Twilio: 30/min";
    public string SendGridLimit { get; set; } = "SendGrid: 120/min";
    public string SesLimit { get; set; } = "SES: 40/sec quota";
    public string GatewayStatus { get; set; } = "Nominal";
}

public class DispatchTransactionResponse
{
    public string DispatchId { get; set; } = string.Empty;
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientId { get; set; } = string.Empty;
    public string RecipientContact { get; set; } = string.Empty;
    public string TriggerEvent { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public string DeliveryStatus { get; set; } = string.Empty;
    public string StatusSeverity { get; set; } = "success"; // "success", "inflight", "retrying", "queued"
    public string TimestampFormatted { get; set; } = "Just now";
    public string RawPayload { get; set; } = string.Empty;
}

public class DispatchTemplateResponse
{
    public string Id { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Channels { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Placeholders { get; set; } = new();
    public int DispatchedToday { get; set; }
    public string SmsPreview { get; set; } = string.Empty;
    public int GsmCharacters { get; set; }
    public int GsmLimit { get; set; } = 160;
}

public class AnnouncementsPagedResult
{
    public List<AnnouncementResponse> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / Math.Max(1, PageSize));
}
