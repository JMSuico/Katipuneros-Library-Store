// [Layer: Features/Api/DTOs/Responses]
// AnalyticsResponses.cs -- Data contract responses for circulation analytics, velocity metrics, inventory density, community footprint, and operational telemetry.
// DO NOT put business logic or database queries here.

using System;
using System.Collections.Generic;

namespace Backend.Features.Api.DTOs.Responses;

public class CirculationAnomalyResponse
{
    public bool AnomalyDetected { get; set; } = true;
    public double PercentageIncrease { get; set; } = 22.0;
    public string Discipline { get; set; } = "Computer Science literature";
    public int KeyTitlesWithZeroShelf { get; set; } = 3;
    public string Message { get; set; } = "Pending hold volume increased by 22% this week for Computer Science literature. 3 key titles currently report 0 shelf availability.";
}

public class VelocityPointResponse
{
    public string DateLabel { get; set; } = string.Empty;
    public string IsoDate { get; set; } = string.Empty;
    public int Borrowings { get; set; }
    public int Reservations { get; set; }
    public int Returns { get; set; }
    public int Overdue { get; set; }
}

public class CoreVelocityResponse
{
    public string Granularity { get; set; } = "30D";
    public string DateRangeLabel { get; set; } = "Oct 01 – Oct 31, 2026";
    public List<VelocityPointResponse> Points { get; set; } = new();
    public int TotalBorrowings { get; set; }
    public int TotalReservations { get; set; }
    public int TotalReturns { get; set; }
    public int TotalOverdue { get; set; }
}

public class InventoryDensityResponse
{
    public int TotalVolumes { get; set; } = 4850;
    public double AvailablePercent { get; set; } = 64.2;
    public int AvailableCount { get; set; } = 3114;
    public double ActiveLoansPercent { get; set; } = 28.5;
    public int ActiveLoansCount { get; set; } = 1382;
    public double StagedHoldsPercent { get; set; } = 5.1;
    public int StagedHoldsCount { get; set; } = 247;
    public double MaintenancePercent { get; set; } = 2.2;
    public int MaintenanceCount { get; set; } = 107;
    public bool RfidSyncActive { get; set; } = true;
    public string RfidStatusText { get; set; } = "Real-time RFID sync active";
}

public class HourlyFootfallPointResponse
{
    public string HourLabel { get; set; } = string.Empty; // "8A", "10A", "12P", "2P", "4P", "6P", "8P"
    public int HeightPercent { get; set; }
    public int Count { get; set; }
    public bool IsPeak { get; set; }
}

public class CommunityFlowResponse
{
    public int DigitalLogins { get; set; } = 3120;
    public double DigitalLoginsVsLastMo { get; set; } = 14.8;
    public int RecordedVisits { get; set; } = 14890;
    public string TurnstileCounterLabel { get; set; } = "Turnstile counter";
    public string PeakWindow { get; set; } = "Peak: 10:00 AM – 2:00 PM";
    public List<HourlyFootfallPointResponse> HourlyFootfall { get; set; } = new();
    public int WifiConcurrences { get; set; } = 842;
}

public class RankedBookResponse
{
    public int Rank { get; set; }
    public Guid BookId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public int Checkouts { get; set; }
    public double BarPercent { get; set; }
}

public class CirculationDemandResponse
{
    public List<RankedBookResponse> TopTitles { get; set; } = new();
    public int ShowingCount { get; set; } = 4;
    public int TotalRanked { get; set; } = 42;
}

public class TelemetryFeedResponse
{
    public string LatestEventText { get; set; } = "Desk #2 processed Return (ID #LN-8942) 3 mins ago";
    public DateTime LatestEventTime { get; set; } = DateTime.UtcNow.AddMinutes(-3);
    public int NextSyncSecondsRemaining { get; set; } = 262;
    public string NextSyncCountdownFormatted { get; set; } = "04:22";
    public bool IsOnline { get; set; } = true;
}
