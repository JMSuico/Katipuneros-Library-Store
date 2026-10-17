// [Layer: Features/Services/Implementations]
// AnalyticsService.cs -- Business logic for circulation analytics, velocity metrics, inventory density, and telemetry.
// DO NOT query _context directly -- use repositories only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class AnalyticsService : IAnalyticsService
{
    private readonly IBookRepository _bookRepository;
    private readonly IBorrowRepository _borrowRepository;
    private readonly IReservationRepository _reservationRepository;
    private readonly IAuditRepository _auditRepository;

    public AnalyticsService(
        IBookRepository bookRepository,
        IBorrowRepository borrowRepository,
        IReservationRepository reservationRepository,
        IAuditRepository auditRepository)
    {
        _bookRepository = bookRepository;
        _borrowRepository = borrowRepository;
        _reservationRepository = reservationRepository;
        _auditRepository = auditRepository;
    }

    public async Task<CirculationAnomalyResponse> GetAnomalyAlertAsync()
    {
        var pendingHolds = (await _reservationRepository.GetAllPendingAsync()).Count;
        var books = await _bookRepository.GetAllAsync();
        var zeroShelfBooks = books.Count(b => b.AvailableCopies == 0 && b.TotalCopies > 0);

        bool isAnomaly = pendingHolds >= 10 && zeroShelfBooks >= 3;

        // Report the measured conditions, not an invented rate or subject heading.
        // The previous implementation asserted a fixed "22.0%" increase and pinned
        // every event to "Computer Science literature" regardless of the real data.
        string msg = isAnomaly
            ? $"{pendingHolds} pending holds alongside {zeroShelfBooks} titles at zero shelf availability."
            : pendingHolds == 0 && zeroShelfBooks == 0
                ? "No pending holds and full shelf availability across the catalog."
                : $"{pendingHolds} pending holds, {zeroShelfBooks} titles at zero shelf availability.";

        return new CirculationAnomalyResponse
        {
            AnomalyDetected = isAnomaly,
            // No historical window is persisted for hold volume, so an honest system
            // reports no measured change rather than fabricating one.
            PercentageIncrease = 0.0,
            Discipline = "All Disciplines",
            KeyTitlesWithZeroShelf = zeroShelfBooks,
            Message = msg
        };
    }

    public async Task<CoreVelocityResponse> GetVelocityMetricsAsync(string granularity, DateTime? startDate, DateTime? endDate)
    {
        var allLoans = await _borrowRepository.GetAllWithDetailsAsync();
        var allPending = await _reservationRepository.GetAllPendingAsync();
        var now = DateTime.UtcNow;

        if (allLoans.Count == 0 && allPending.Count == 0)
        {
            return new CoreVelocityResponse
            {
                Granularity = string.IsNullOrWhiteSpace(granularity) ? "30D" : granularity,
                DateRangeLabel = startDate.HasValue && endDate.HasValue
                    ? $"{startDate.Value:MMM dd} – {endDate.Value:MMM dd, yyyy}"
                    : $"{now.AddDays(-30):MMM dd} – {now:MMM dd, yyyy}",
                Points = new List<VelocityPointResponse>(),
                TotalBorrowings = 0,
                TotalReservations = 0,
                TotalReturns = 0,
                TotalOverdue = 0
            };
        }

        var daysBack = granularity switch
        {
            "7D" => 7,
            "90D" => 90,
            "1Y" => 365,
            _ => 30
        };

        var points = new List<VelocityPointResponse>();
        var intervalCount = 6;
        var stepDays = Math.Max(1, daysBack / intervalCount);

        for (int i = intervalCount - 1; i >= 0; i--)
        {
            var pDate = now.AddDays(-i * stepDays);
            var nextDate = pDate.AddDays(stepDays);

            int borrows = allLoans.Count(l => l.BorrowDate >= pDate && l.BorrowDate < nextDate);
            int returns = allLoans.Count(l => l.Status == TransactionStatus.Returned && l.ReturnDate.HasValue && l.ReturnDate.Value >= pDate && l.ReturnDate.Value < nextDate);
            int overdue = allLoans.Count(l => l.Status == TransactionStatus.Active && l.DueDate < now && l.DueDate >= pDate && l.DueDate < nextDate);
            int reservations = allPending.Count(r => r.ReservationDate >= pDate && r.ReservationDate < nextDate);

            points.Add(new VelocityPointResponse
            {
                DateLabel = pDate.ToString("MMM dd"),
                IsoDate = pDate.ToString("yyyy-MM-dd"),
                Borrowings = borrows,
                Reservations = reservations,
                Returns = returns,
                Overdue = overdue
            });
        }

        return new CoreVelocityResponse
        {
            Granularity = string.IsNullOrWhiteSpace(granularity) ? "30D" : granularity,
            DateRangeLabel = startDate.HasValue && endDate.HasValue
                ? $"{startDate.Value:MMM dd} – {endDate.Value:MMM dd, yyyy}"
                : $"{now.AddDays(-daysBack):MMM dd} – {now:MMM dd, yyyy}",
            Points = points,
            TotalBorrowings = points.Sum(p => p.Borrowings),
            TotalReservations = points.Sum(p => p.Reservations),
            TotalReturns = points.Sum(p => p.Returns),
            TotalOverdue = points.Sum(p => p.Overdue)
        };
    }

    public async Task<InventoryDensityResponse> GetInventoryDensityAsync()
    {
        var books = await _bookRepository.GetAllAsync();
        var totalVolumes = books.Sum(b => b.TotalCopies);
        var availableCount = books.Sum(b => b.AvailableCopies);

        if (totalVolumes == 0)
        {
            return new InventoryDensityResponse
            {
                TotalVolumes = 0,
                AvailablePercent = 0.0,
                AvailableCount = 0,
                ActiveLoansPercent = 0.0,
                ActiveLoansCount = 0,
                StagedHoldsPercent = 0.0,
                StagedHoldsCount = 0,
                MaintenancePercent = 0.0,
                MaintenanceCount = 0,
                RfidSyncActive = true,
                RfidStatusText = "Inventory registry empty (0 volumes registered)"
            };
        }

        var activeLoans = (await _borrowRepository.GetAllLedgerAsync(TransactionStatus.Active)).Count;
        var stagedHolds = (await _reservationRepository.GetAllPendingAsync()).Count;
        var maintenance = Math.Max(0, totalVolumes - (availableCount + activeLoans + stagedHolds));

        return new InventoryDensityResponse
        {
            TotalVolumes = totalVolumes,
            AvailablePercent = Math.Round(((double)availableCount / totalVolumes) * 100.0, 1),
            AvailableCount = availableCount,
            ActiveLoansPercent = Math.Round(((double)activeLoans / totalVolumes) * 100.0, 1),
            ActiveLoansCount = activeLoans,
            StagedHoldsPercent = Math.Round(((double)stagedHolds / totalVolumes) * 100.0, 1),
            StagedHoldsCount = stagedHolds,
            MaintenancePercent = Math.Round(((double)maintenance / totalVolumes) * 100.0, 1),
            MaintenanceCount = maintenance,
            RfidSyncActive = true,
            RfidStatusText = "Real-time RFID sync active"
        };
    }

    public async Task<CommunityFlowResponse> GetCommunityFlowAsync()
    {
        var recentAudits = await _auditRepository.GetAllAsync(limit: 500);
        int logins = recentAudits.Count(a => a.Action.Contains("LOGIN", StringComparison.OrdinalIgnoreCase));

        if (recentAudits.Count == 0)
        {
            return new CommunityFlowResponse
            {
                DigitalLogins = 0,
                DigitalLoginsVsLastMo = 0.0,
                RecordedVisits = 0,
                TurnstileCounterLabel = "Turnstile counter (idle)",
                PeakWindow = "No peak footfall recorded",
                WifiConcurrences = 0,
                HourlyFootfall = new List<HourlyFootfallPointResponse>
                {
                    new() { HourLabel = "8A", HeightPercent = 0, Count = 0, IsPeak = false },
                    new() { HourLabel = "10A", HeightPercent = 0, Count = 0, IsPeak = false },
                    new() { HourLabel = "12P", HeightPercent = 0, Count = 0, IsPeak = false },
                    new() { HourLabel = "2P", HeightPercent = 0, Count = 0, IsPeak = false },
                    new() { HourLabel = "4P", HeightPercent = 0, Count = 0, IsPeak = false },
                    new() { HourLabel = "6P", HeightPercent = 0, Count = 0, IsPeak = false },
                    new() { HourLabel = "8P", HeightPercent = 0, Count = 0, IsPeak = false }
                }
            };
        }

        var today = DateTime.UtcNow.Date;
        var todayAudits = recentAudits.Where(a => a.Timestamp.Date == today).ToList();

        int c8 = todayAudits.Count(a => a.Timestamp.Hour >= 8 && a.Timestamp.Hour < 10);
        int c10 = todayAudits.Count(a => a.Timestamp.Hour >= 10 && a.Timestamp.Hour < 12);
        int c12 = todayAudits.Count(a => a.Timestamp.Hour >= 12 && a.Timestamp.Hour < 14);
        int c2 = todayAudits.Count(a => a.Timestamp.Hour >= 14 && a.Timestamp.Hour < 16);
        int c4 = todayAudits.Count(a => a.Timestamp.Hour >= 16 && a.Timestamp.Hour < 18);
        int c6 = todayAudits.Count(a => a.Timestamp.Hour >= 18 && a.Timestamp.Hour < 20);
        int c8p = todayAudits.Count(a => a.Timestamp.Hour >= 20);

        int maxC = Math.Max(1, Math.Max(c8, Math.Max(c10, Math.Max(c12, Math.Max(c2, Math.Max(c4, Math.Max(c6, c8p)))))));

        // Month-over-month comparison is measured against the previous calendar
        // month's audit rows, not asserted as a constant.
        var monthStart = new DateTime(today.Year, today.Month, 1);
        var prevMonthStart = monthStart.AddMonths(-1);
        int thisMonthLogins = recentAudits.Count(a => a.Timestamp >= monthStart);
        int lastMonthLogins = recentAudits.Count(a => a.Timestamp >= prevMonthStart && a.Timestamp < monthStart);
        double loginGrowth = lastMonthLogins == 0
            ? 0.0
            : Math.Round((thisMonthLogins - lastMonthLogins) / (double)lastMonthLogins * 100, 2);

        // Identify the genuine peak window from the bucket that actually leads.
        var peakWindow = (label: "", count: 0);
        foreach (var bucket in new[] { ("8:00 – 10:00 AM", c8), ("10:00 AM – 12:00 PM", c10),
                                       ("12:00 – 2:00 PM", c12), ("2:00 – 4:00 PM", c2),
                                       ("4:00 – 6:00 PM", c4), ("6:00 – 8:00 PM", c6),
                                       ("8:00 PM onwards", c8p) })
        {
            if (bucket.Item2 > peakWindow.count) peakWindow = (bucket.Item1, bucket.Item2);
        }

        // Wi-Fi concurrencies are only counted when the audit trail actually
        // records a wifi/network event. The previous 0.27-of-logins multiplier
        // was an invented constant presented as a measurement.
        int wifiConcurrences = recentAudits.Count(a =>
            a.Action.Contains("WIFI", StringComparison.OrdinalIgnoreCase)
            || a.TargetEntity.Contains("WIFI", StringComparison.OrdinalIgnoreCase));

        return new CommunityFlowResponse
        {
            DigitalLogins = logins,
            DigitalLoginsVsLastMo = loginGrowth,
            RecordedVisits = todayAudits.Count,
            TurnstileCounterLabel = "Turnstile counter",
            PeakWindow = peakWindow.count > 0 ? $"Peak: {peakWindow.label} ({peakWindow.count} visits)" : "Idle",
            WifiConcurrences = wifiConcurrences,
            HourlyFootfall = new List<HourlyFootfallPointResponse>
            {
                new() { HourLabel = "8A", HeightPercent = (int)Math.Round((double)c8 / maxC * 100), Count = c8, IsPeak = c8 == maxC && c8 > 0 },
                new() { HourLabel = "10A", HeightPercent = (int)Math.Round((double)c10 / maxC * 100), Count = c10, IsPeak = c10 == maxC && c10 > 0 },
                new() { HourLabel = "12P", HeightPercent = (int)Math.Round((double)c12 / maxC * 100), Count = c12, IsPeak = c12 == maxC && c12 > 0 },
                new() { HourLabel = "2P", HeightPercent = (int)Math.Round((double)c2 / maxC * 100), Count = c2, IsPeak = c2 == maxC && c2 > 0 },
                new() { HourLabel = "4P", HeightPercent = (int)Math.Round((double)c4 / maxC * 100), Count = c4, IsPeak = c4 == maxC && c4 > 0 },
                new() { HourLabel = "6P", HeightPercent = (int)Math.Round((double)c6 / maxC * 100), Count = c6, IsPeak = c6 == maxC && c6 > 0 },
                new() { HourLabel = "8P", HeightPercent = (int)Math.Round((double)c8p / maxC * 100), Count = c8p, IsPeak = c8p == maxC && c8p > 0 }
            }
        };
    }

    public async Task<CirculationDemandResponse> GetCirculationDemandAsync()
    {
        var allLoans = await _borrowRepository.GetAllWithDetailsAsync();
        if (allLoans.Count == 0)
        {
            return new CirculationDemandResponse
            {
                ShowingCount = 0,
                TotalRanked = 0,
                TopTitles = new List<RankedBookResponse>()
            };
        }

        var topGroup = allLoans
            .Where(l => l.Book != null)
            .GroupBy(l => l.BookId)
            .Select(g => new { BookId = g.Key, Book = g.First().Book!, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(4)
            .ToList();

        int maxCheckouts = topGroup.Count > 0 ? topGroup.First().Count : 1;
        int rank = 1;

        var ranked = topGroup.Select(x => new RankedBookResponse
        {
            Rank = rank++,
            BookId = x.BookId,
            Title = x.Book.Title,
            Author = x.Book.Author,
            CoverImageUrl = x.Book.CoverImage,
            Checkouts = x.Count,
            BarPercent = Math.Round(((double)x.Count / maxCheckouts) * 100.0, 1)
        }).ToList();

        return new CirculationDemandResponse
        {
            ShowingCount = ranked.Count,
            TotalRanked = allLoans.Select(l => l.BookId).Distinct().Count(),
            TopTitles = ranked
        };
    }

    public async Task<TelemetryFeedResponse> GetTelemetryFeedAsync()
    {
        var secondsRemaining = 300 - ((int)(DateTimeOffset.UtcNow.ToUnixTimeSeconds() % 300));
        var minutes = secondsRemaining / 60;
        var seconds = secondsRemaining % 60;

        var recentAudit = (await _auditRepository.GetAllAsync(limit: 1)).FirstOrDefault();
        string eventText = recentAudit != null
            ? $"{recentAudit.Action}: {recentAudit.DeltaModification}"
            : "Operational telemetry active. Circulation desks online.";

        return new TelemetryFeedResponse
        {
            LatestEventText = eventText,
            LatestEventTime = recentAudit?.Timestamp ?? DateTime.UtcNow,
            NextSyncSecondsRemaining = secondsRemaining,
            NextSyncCountdownFormatted = $"{minutes:D2}:{seconds:D2}",
            IsOnline = true
        };
    }

    public async Task<bool> ProcessBulkOperationAsync(List<Guid> ids, string actionType, string? reason)
    {
        if (ids == null || ids.Count == 0) return false;

        await _auditRepository.AddAsync(new AuditLogEntry
        {
            Id = Guid.NewGuid(),
            Action = $"BULK_{actionType.ToUpperInvariant()}",
            TargetEntity = "AnalyticsRecord",
            Severity = "Warning",
            DeltaModification = $"Processed bulk action '{actionType}' on {ids.Count} records. Reason: {reason ?? "Administrative batch triage"}",
            Timestamp = DateTime.UtcNow
        });

        await _auditRepository.SaveChangesAsync();
        return true;
    }
}
