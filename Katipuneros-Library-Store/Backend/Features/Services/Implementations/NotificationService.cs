// [Layer: Features/Services/Implementations]
// NotificationService.cs -- Business logic for administrative communications, campus bulletins, automated dispatch queue, and hardware alerts.
// DO NOT query _context directly -- use repositories only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class NotificationService : INotificationService
{
    private readonly IBookRepository _bookRepository;
    private readonly IBorrowRepository _borrowRepository;
    private readonly IReservationRepository _reservationRepository;
    private readonly IAuditRepository _auditRepository;
    private readonly IUserRepository _userRepository;

    private static readonly List<AnnouncementResponse> _announcements = new();
    private static readonly List<SystemAlertResponse> _systemAlerts = new();
    private static readonly List<DispatchTransactionResponse> _dispatchTransactions = new();
    private static readonly List<DispatchTemplateResponse> _dispatchTemplates = new();

    public NotificationService(
        IBookRepository bookRepository,
        IBorrowRepository borrowRepository,
        IReservationRepository reservationRepository,
        IAuditRepository auditRepository,
        IUserRepository userRepository)
    {
        _bookRepository = bookRepository;
        _borrowRepository = borrowRepository;
        _reservationRepository = reservationRepository;
        _auditRepository = auditRepository;
        _userRepository = userRepository;

        EnsureSeedData();
    }

    private static void EnsureSeedData()
    {
        if (_announcements.Count == 0)
        {
            _announcements.AddRange(new List<AnnouncementResponse>
            {
                new()
                {
                    Id = "ANN-101",
                    Title = "Midterm Extended Stacks Hours & 24/7 Study Hall Access",
                    Content = "In support of the second semester midterm examinations, the General Reference and Reserved Stacks will operate until 23:00 daily through Friday, with Ground Floor Study Hall unlocked 24 hours for verified Katipunan ID cardholders.",
                    Audience = "All Patrons",
                    Channels = new() { "Portal Banner", "Campus Kiosks", "Mobile Push" },
                    Status = "Live • Published",
                    Priority = "Standard Campus Bulletin",
                    ActiveRange = "Oct 21 – Oct 28, 2024 at 23:59",
                    CreatedAt = DateTime.UtcNow.AddDays(-2),
                    ViewsCount = 1420,
                    ReadsCount = 920,
                    OpenRate = 98.4,
                    IsDraft = false
                },
                new()
                {
                    Id = "ANN-102",
                    Title = "Katipunan Rare Filipiniana Manuscript Exhibition & Preservation Tour",
                    Content = "Special collections showcase displaying 19th-century revolutionary manuscripts and annotated journals. Restricted white-glove viewing slots available with pre-booking via research consultation kiosk.",
                    Audience = "Faculty & Undergraduates",
                    Channels = new() { "Portal Banner", "Campus Kiosks" },
                    Status = "Scheduled",
                    Priority = "Standard Campus Bulletin",
                    ActiveRange = "Nov 01 – Nov 15, 2024",
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    ViewsCount = 0,
                    ReadsCount = 0,
                    OpenRate = 0.0,
                    IsDraft = false
                },
                new()
                {
                    Id = "ANN-103",
                    Title = "Quarterly Journal Subscription Renewals & Purchase Requisition",
                    Content = "Departmental heads are requested to review IEEE, JSTOR, and Springer Nature core faculty title requests before FY25 budgetary clearance.",
                    Audience = "Faculty Only",
                    Channels = new() { "Staff Intranet" },
                    Status = "Draft",
                    Priority = "Urgent / Operating Hours Modification",
                    ActiveRange = "Target Publish: Dec 01, 2024",
                    CreatedAt = DateTime.UtcNow.AddHours(-4),
                    ViewsCount = 0,
                    ReadsCount = 0,
                    OpenRate = 0.0,
                    IsDraft = true
                }
            });
        }

        if (_systemAlerts.Count == 0)
        {
            _systemAlerts.AddRange(new List<SystemAlertResponse>
            {
                new()
                {
                    Id = "ALT-201",
                    Type = "deficit",
                    Title = "Computer Science - Clean Code (Robert C. Martin)",
                    Category = "Computer Science & Engineering",
                    Tag = "Critical Reserve Deficit",
                    TriggeredAgo = "Triggered 12m ago",
                    Description = "Current queue has 14 active reservations with only 2 available copies currently present on stacks shelf (Shelf B-402).",
                    Severity = "critical",
                    IsResolved = false,
                    ActiveReservations = 14,
                    AvailableCopies = 2,
                    ShelfBay = "Shelf B-402",
                    DelinquentPatronCount = 0,
                    HardwareIp = null
                },
                new()
                {
                    Id = "ALT-202",
                    Type = "delinquency",
                    Title = "Overdue Delinquency Spike Detected",
                    Category = "Automated Daily Batch Delinquency Monitor",
                    Tag = "Circulation Sanction Warning",
                    TriggeredAgo = "Triggered 46m ago",
                    Description = "18 patrons have passed the strict 14-day hold freeze mark. Automatic system penalties require Dean of Admissions notification clearance.",
                    Severity = "warning",
                    IsResolved = false,
                    ActiveReservations = 0,
                    AvailableCopies = 0,
                    ShelfBay = null,
                    DelinquentPatronCount = 18,
                    HardwareIp = null
                },
                new()
                {
                    Id = "ALT-203",
                    Type = "hardware",
                    Title = "RFID Gate Reader 02 Offline Ping Failure",
                    Category = "IP: 192.168.4.118 (North Turnstile)",
                    Tag = "Facility Hardware Failure",
                    TriggeredAgo = "Triggered 1h 05m ago",
                    Description = "Turnstile scanner #2 stopped responding to heartbeat polling. Patron egress self-checkout validation currently bypassed to prevent foyer congestion.",
                    Severity = "critical",
                    IsResolved = false,
                    ActiveReservations = 0,
                    AvailableCopies = 0,
                    ShelfBay = null,
                    DelinquentPatronCount = 0,
                    HardwareIp = "192.168.4.118"
                }
            });
        }

        if (_dispatchTransactions.Count == 0)
        {
            _dispatchTransactions.AddRange(new List<DispatchTransactionResponse>
            {
                new()
                {
                    DispatchId = "#DSP-90825",
                    RecipientName = "Camilla Santos",
                    RecipientId = "2021-0492",
                    RecipientContact = "c.santos@katipunan.edu.ph",
                    TriggerEvent = "Hold Ready: Smart Locker Bay A-04",
                    Channel = "Email + SMS",
                    DeliveryStatus = "Delivered (200 OK)",
                    StatusSeverity = "success",
                    TimestampFormatted = "Just now",
                    RawPayload = "{\"recipient\":\"c.santos@katipunan.edu.ph\",\"phone\":\"+639171234567\",\"carrier\":\"Twilio\",\"statusCode\":200,\"bay\":\"A-04\",\"pin\":\"8829\"}"
                },
                new()
                {
                    DispatchId = "#DSP-90824",
                    RecipientName = "Lorenzo Tan",
                    RecipientId = "2022-1108",
                    RecipientContact = "+63 918 432 9901",
                    TriggerEvent = "48h Return Reminder",
                    Channel = "SMS",
                    DeliveryStatus = "In Flight",
                    StatusSeverity = "inflight",
                    TimestampFormatted = "42s ago",
                    RawPayload = "{\"recipient\":\"+639184329901\",\"carrier\":\"Twilio\",\"status\":\"queued_in_flight\",\"template\":\"DUE_48H_SMS\"}"
                },
                new()
                {
                    DispatchId = "#DSP-90823",
                    RecipientName = "Maricor Reyes",
                    RecipientId = "2020-0012",
                    RecipientContact = "m.reyes@katipunan.edu.ph",
                    TriggerEvent = "Overdue Tier 1 Notice",
                    Channel = "SMS + Push",
                    DeliveryStatus = "Retrying (Carrier Handshake)",
                    StatusSeverity = "retrying",
                    TimestampFormatted = "2 mins ago",
                    RawPayload = "{\"recipient\":\"m.reyes@katipunan.edu.ph\",\"carrier\":\"Twilio\",\"attempts\":2,\"lastError\":\"Handshake timeout - retrying backoff 30s\"}"
                },
                new()
                {
                    DispatchId = "#DSP-90822",
                    RecipientName = "Beatriz De Leon",
                    RecipientId = "2023-8819",
                    RecipientContact = "b.deleon@katipunan.edu.ph",
                    TriggerEvent = "Reservation Expiry Warning",
                    Channel = "Push",
                    DeliveryStatus = "Queued",
                    StatusSeverity = "queued",
                    TimestampFormatted = "5 mins ago",
                    RawPayload = "{\"recipient\":\"b.deleon@katipunan.edu.ph\",\"carrier\":\"FirebaseCloudMessaging\",\"status\":\"in_queue\",\"priority\":\"high\"}"
                }
            });
        }

        if (_dispatchTemplates.Count == 0)
        {
            _dispatchTemplates.AddRange(new List<DispatchTemplateResponse>
            {
                new()
                {
                    Id = "TPL-01",
                    Category = "Hold & Fulfillment",
                    Name = "Hold Ready for Pickup",
                    Channels = "SMS & Email",
                    Description = "Triggered automatically upon RFID reservation arrival and bay assignment.",
                    Placeholders = new() { "{{patron_name}}", "{{book_title}}", "{{locker_bay}}", "{{expiry_time}}" },
                    DispatchedToday = 142,
                    SmsPreview = "Katipuneros Library: Camilla Santos, your requested book 'Clean Code' is ready at Smart Locker Bay A-04. Please scan PIN 8829 before Oct 25, 18:00 to retrieve.",
                    GsmCharacters = 142,
                    GsmLimit = 160
                },
                new()
                {
                    Id = "TPL-02",
                    Category = "Courtesy Notice",
                    Name = "Upcoming Due Date (48h Warning)",
                    Channels = "Email & Push",
                    Description = "Automated morning cron notification dispatched 48h before borrow timestamp.",
                    Placeholders = new() { "{{patron_name}}", "{{book_title}}", "{{due_date}}", "{{renewal_link}}" },
                    DispatchedToday = 180,
                    SmsPreview = "Katipuneros Library Reminder: Your loan for 'Clean Architecture' is due in 48 hours. Renew online or visit the circulation desk.",
                    GsmCharacters = 132,
                    GsmLimit = 160
                },
                new()
                {
                    Id = "TPL-03",
                    Category = "Sanctions",
                    Name = "Circulation Overdue & Grace Expiry",
                    Channels = "SMS & Email",
                    Description = "Fired on Day 3 and Day 14 of past-due retention cycle with daily fine computations.",
                    Placeholders = new() { "{{patron_name}}", "{{book_title}}", "{{days_overdue}}", "{{fine_rate}}" },
                    DispatchedToday = 18,
                    SmsPreview = "Katipuneros Library Alert: Loan overdue by 3 days. Standard fine of ₱5.00/day applies. Please return book to avoid circulation hold.",
                    GsmCharacters = 141,
                    GsmLimit = 160
                },
                new()
                {
                    Id = "TPL-04",
                    Category = "Circulation Workflow",
                    Name = "Reservation Cancelled / Auto-Reshelved",
                    Channels = "Email",
                    Description = "Sent when 72-hour hold window expires without physical kiosk checkout.",
                    Placeholders = new() { "{{patron_name}}", "{{book_title}}", "{{reorder_url}}" },
                    DispatchedToday = 4,
                    SmsPreview = "Katipuneros Library Notice: Reservation hold for 'Design Patterns' has expired and the copy has been released to stacks.",
                    GsmCharacters = 126,
                    GsmLimit = 160
                }
            });
        }
    }

    public Task<TopBentoMetricsResponse> GetTopBentoMetricsAsync()
    {
        var activeBulletins = _announcements.Count(a => a.Status.Contains("Live") || a.Status.Contains("Published"));
        var urgentAlerts = _systemAlerts.Count(a => !a.IsResolved);
        int totalDispatches = _dispatchTransactions.Count;
        int emailCount = _dispatchTransactions.Count(d => d.Channel.Contains("Email", StringComparison.OrdinalIgnoreCase));
        int smsCount = _dispatchTransactions.Count(d => d.Channel.Contains("SMS", StringComparison.OrdinalIgnoreCase));
        int pushCount = _dispatchTransactions.Count(d => d.Channel.Contains("Push", StringComparison.OrdinalIgnoreCase));
        int delivered = _dispatchTransactions.Count(d => d.StatusSeverity == "success");
        double reliability = totalDispatches > 0 ? Math.Round((double)delivered / totalDispatches * 100.0, 1) : 0.0;
        double failRate = totalDispatches > 0 ? Math.Round(100.0 - reliability, 1) : 0.0;
        int totalViews = _announcements.Sum(a => a.ViewsCount);

        return Task.FromResult(new TopBentoMetricsResponse
        {
            TodayDispatchedTotal = totalDispatches,
            TodayEmail = emailCount,
            TodaySms = smsCount,
            TodayPush = pushCount,
            DeliveryReliability = reliability,
            DeliveryFailRate = failRate,
            UrgentAlertsCount = urgentAlerts,
            ActiveBulletinsCount = activeBulletins,
            PortalViewsToday = totalViews
        });
    }

    public Task<List<SystemAlertResponse>> GetSystemAlertsAsync() =>
        Task.FromResult(_systemAlerts.Where(a => !a.IsResolved).ToList());

    public Task<bool> ResolveAllAlertsAsync()
    {
        foreach (var alert in _systemAlerts)
        {
            alert.IsResolved = true;
        }

        return Task.FromResult(true);
    }

    public async Task<bool> TriggerAcquisitionOrderAsync(TriggerAcquisitionRequest req)
    {
        var targetAlert = _systemAlerts.FirstOrDefault(a => a.Type == "deficit");
        if (targetAlert != null)
        {
            targetAlert.IsResolved = true;
        }

        await _auditRepository.AddAsync(new AuditLogEntry
        {
            Action = "ACQUISITION_ORDER_DISPATCHED",
            TargetEntity = "BookAcquisitions",
            Severity = "Information",
            IpAddress = "127.0.0.1",
            DeltaModification = $"Triggered order for '{req.MonographTitle}' ({req.CopiesRequested} copies). Notes: {req.Notes}"
        });

        return true;
    }

    public async Task<bool> SendRegistrarNoticeAsync(SendRegistrarNoticeRequest req)
    {
        var targetAlert = _systemAlerts.FirstOrDefault(a => a.Type == "delinquency");
        if (targetAlert != null)
        {
            targetAlert.IsResolved = true;
        }

        await _auditRepository.AddAsync(new AuditLogEntry
        {
            Action = "REGISTRAR_SANCTION_NOTICE_SENT",
            TargetEntity = "PatronSanctions",
            Severity = "Warning",
            IpAddress = "127.0.0.1",
            DeltaModification = $"Registrar notice dispatched for {req.AffectedPatronsCount} delinquent patrons. Subject: {req.Subject}"
        });

        return true;
    }

    public async Task<bool> PingHardwareTeamAsync(PingHardwareRequest req)
    {
        var targetAlert = _systemAlerts.FirstOrDefault(a => a.Type == "hardware");
        if (targetAlert != null)
        {
            targetAlert.TriggeredAgo = "Ticket Dispatched";
        }

        await _auditRepository.AddAsync(new AuditLogEntry
        {
            Action = "HARDWARE_SUPPORT_TICKET_CREATED",
            TargetEntity = "TurnstileGateScanner",
            Severity = "Warning",
            IpAddress = req.IpAddress,
            DeltaModification = $"Pinged hardware team regarding {req.DeviceName} ({req.IpAddress}) with urgency {req.Urgency}."
        });

        return true;
    }

    public Task<bool> RepollHardwareSocketAsync()
    {
        var targetAlert = _systemAlerts.FirstOrDefault(a => a.Type == "hardware");
        if (targetAlert != null)
        {
            targetAlert.TriggeredAgo = "Heartbeat Polled Just Now";
        }

        return Task.FromResult(true);
    }

    public Task<AnnouncementsPagedResult> GetAnnouncementsAsync(AnnouncementFilterRequest filter)
    {
        var query = _announcements.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var s = filter.Search.Trim().ToLower();
            query = query.Where(a =>
                a.Title.ToLower().Contains(s) ||
                a.Content.ToLower().Contains(s) ||
                a.Audience.ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(filter.Status) && filter.Status.ToLower() != "all")
        {
            var st = filter.Status.Trim().ToLower();
            query = query.Where(a => a.Status.ToLower().Contains(st));
        }

        query = filter.Sort?.ToLower() switch
        {
            "oldest" => query.OrderBy(a => a.CreatedAt),
            "openrate" => query.OrderByDescending(a => a.OpenRate),
            "az" => query.OrderBy(a => a.Title),
            "za" => query.OrderByDescending(a => a.Title),
            "priority" => query.OrderByDescending(a => a.Priority),
            _ => query.OrderByDescending(a => a.CreatedAt)
        };

        var allItems = query.ToList();
        var totalCount = allItems.Count;
        var pagedItems = allItems
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        return Task.FromResult(new AnnouncementsPagedResult
        {
            Items = pagedItems,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        });
    }

    public Task<AnnouncementResponse> CreateAnnouncementAsync(CreateAnnouncementRequest req)
    {
        var newId = $"ANN-{new Random().Next(104, 999)}";
        var announcement = new AnnouncementResponse
        {
            Id = newId,
            Title = req.Title,
            Content = req.Content,
            Audience = string.IsNullOrWhiteSpace(req.Audience) ? "All Patrons" : req.Audience,
            Channels = req.Channels.Count > 0 ? req.Channels : new() { "Portal Banner", "Mobile App Push" },
            Status = req.IsDraft ? "Draft" : "Live • Published",
            Priority = req.Priority,
            ActiveRange = req.DisplayDuration,
            CreatedAt = DateTime.UtcNow,
            ViewsCount = req.IsDraft ? 0 : 1,
            ReadsCount = 0,
            OpenRate = 0.0,
            IsDraft = req.IsDraft
        };

        _announcements.Insert(0, announcement);
        return Task.FromResult(announcement);
    }

    public Task<AnnouncementResponse?> UpdateAnnouncementAsync(string id, UpdateAnnouncementRequest req)
    {
        var existing = _announcements.FirstOrDefault(a => a.Id == id);
        if (existing == null) return Task.FromResult<AnnouncementResponse?>(null);

        existing.Title = req.Title;
        existing.Content = req.Content;
        existing.Audience = req.Audience;
        existing.Channels = req.Channels;
        existing.Priority = req.Priority;
        existing.ActiveRange = req.DisplayDuration;
        existing.IsDraft = req.IsDraft;
        if (!string.IsNullOrWhiteSpace(req.Status))
        {
            existing.Status = req.Status;
        }

        return Task.FromResult<AnnouncementResponse?>(existing);
    }

    public Task<bool> DeleteAnnouncementAsync(string id)
    {
        var index = _announcements.FindIndex(a => a.Id == id);
        if (index < 0) return Task.FromResult(false);

        _announcements.RemoveAt(index);
        return Task.FromResult(true);
    }

    public Task<int> BulkDeleteAnnouncementsAsync(List<string> ids)
    {
        var count = _announcements.RemoveAll(a => ids.Contains(a.Id));
        return Task.FromResult(count);
    }

    public Task<AnnouncementResponse?> ToggleUnpublishAsync(string id)
    {
        var existing = _announcements.FirstOrDefault(a => a.Id == id);
        if (existing == null) return Task.FromResult<AnnouncementResponse?>(null);

        existing.Status = existing.Status.Contains("Unpublished")
            ? "Live • Published"
            : "Unpublished";

        return Task.FromResult<AnnouncementResponse?>(existing);
    }

    public Task<AnnouncementAnalyticsResponse?> GetAnnouncementAnalyticsAsync(string id)
    {
        var existing = _announcements.FirstOrDefault(a => a.Id == id);
        if (existing == null) return Task.FromResult<AnnouncementAnalyticsResponse?>(null);

        return Task.FromResult<AnnouncementAnalyticsResponse?>(new AnnouncementAnalyticsResponse
        {
            Id = existing.Id,
            Title = existing.Title,
            TotalPortalViews = existing.ViewsCount,
            MobilePushReads = existing.ReadsCount,
            KioskImpressions = (int)(existing.ViewsCount * 0.45),
            OverallOpenRate = existing.OpenRate,
            PrimaryAudience = existing.Audience,
            ActiveChannels = existing.Channels,
            PerformanceSummary = $"Delivered across {existing.Channels.Count} channels with an aggregate {existing.OpenRate}% open rate across active university touchpoints."
        });
    }

    public Task<DispatchQueueTelemetryResponse> GetDispatchQueueTelemetryAsync()
    {
        int pendingEmail = _dispatchTransactions.Count(d => d.StatusSeverity == "queued" && d.Channel.Contains("Email", StringComparison.OrdinalIgnoreCase));
        int pendingSms = _dispatchTransactions.Count(d => d.StatusSeverity == "queued" && d.Channel.Contains("SMS", StringComparison.OrdinalIgnoreCase));
        int totalSms = _dispatchTransactions.Count(d => d.Channel.Contains("SMS", StringComparison.OrdinalIgnoreCase));
        int bounced = _dispatchTransactions.Count(d => d.StatusSeverity == "retrying" || d.StatusSeverity == "failed");
        double retryFailRate = totalSms > 0 ? Math.Round((double)bounced / totalSms * 100.0, 1) : 0.0;
        int queueDepth = pendingEmail + pendingSms;

        return Task.FromResult(new DispatchQueueTelemetryResponse
        {
            NextBatchRunSeconds = 165,
            NextBatchRunFormatted = "in 02m 45s",
            BatchWindowSeconds = 180,
            DaemonRunning = true,
            RetryFailureRate = retryFailRate,
            BouncedCount = bounced,
            TotalSmsCount = totalSms,
            QueueDepth = queueDepth,
            PendingEmailCount = pendingEmail,
            PendingSmsCount = pendingSms,
            QueueStatus = queueDepth > 0 ? "Processing" : "Idle (Nominal)",
            TwilioLimit = "Twilio: 30/min",
            SendGridLimit = "SendGrid: 120/min",
            SesLimit = "SES: 40/sec quota",
            GatewayStatus = "Nominal"
        });
    }

    public Task<List<DispatchTransactionResponse>> GetDispatchTransactionsAsync() =>
        Task.FromResult(_dispatchTransactions.ToList());

    public Task<List<DispatchTemplateResponse>> GetDispatchTemplatesAsync() =>
        Task.FromResult(_dispatchTemplates.ToList());
}
