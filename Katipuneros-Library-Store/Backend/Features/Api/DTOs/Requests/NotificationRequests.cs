// [Layer: Features/Api/DTOs/Requests]
// NotificationRequests.cs -- Data contract requests for campus announcements, system alert triage, and dispatch queue triggers.
// DO NOT put business logic or database queries here.

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Api.DTOs.Requests;

public class CreateAnnouncementRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(4000)]
    public string Content { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Audience { get; set; } = "All Patrons";

    public List<string> Channels { get; set; } = new() { "Portal Banner", "Mobile App Push" };

    [MaxLength(50)]
    public string Priority { get; set; } = "Standard Campus Bulletin";

    [MaxLength(100)]
    public string DisplayDuration { get; set; } = "7 Days (End of Academic Week)";

    public bool IsDraft { get; set; }
}

public class UpdateAnnouncementRequest : CreateAnnouncementRequest
{
    public string? Status { get; set; }
}

public class BulkDeleteAnnouncementsRequest
{
    [Required]
    public List<string> Ids { get; set; } = new();
}

public class AnnouncementFilterRequest
{
    public string? Search { get; set; }
    public string? Status { get; set; } // "all", "published", "scheduled", "draft", "unpublished"
    public string? Sort { get; set; } // "newest", "oldest", "openrate", "az", "za", "priority"
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class TriggerAcquisitionRequest
{
    public string MonographTitle { get; set; } = string.Empty;
    public int CopiesRequested { get; set; } = 5;
    public string? Notes { get; set; }
}

public class SendRegistrarNoticeRequest
{
    public string Subject { get; set; } = "Notice of Circulation Suspension - Hold Freeze Delinquency";
    public string? MemoNotes { get; set; }
    public int AffectedPatronsCount { get; set; } = 18;
}

public class PingHardwareRequest
{
    public string DeviceName { get; set; } = "North Turnstile RFID Gate Reader 02";
    public string IpAddress { get; set; } = "192.168.4.118";
    public string Urgency { get; set; } = "High";
}
