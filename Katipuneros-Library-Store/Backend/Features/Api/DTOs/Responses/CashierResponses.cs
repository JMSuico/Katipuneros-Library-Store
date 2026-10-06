// [Layer: Features/Api/DTOs/Responses]
// CashierResponses.cs -- Strongly-typed response contracts for Cashier operations, dashboard KPIs, and circulation ledgers.
// DO NOT put business logic or database queries here.

using System;
using System.Collections.Generic;

namespace Backend.Features.Api.DTOs.Responses;

public class CashierDashboardKpisResponse
{
    public int PendingHoldsCount { get; set; }
    public int UrgentTodayHoldsCount { get; set; }
    public int ApprovedTodayCount { get; set; }
    public int ToReleaseCount { get; set; }
    public int ActiveLoansCount { get; set; }
    public int DueTodayCount { get; set; }
    public int OverdueLoansCount { get; set; }
    public int ReturnsTodayCount { get; set; }
    public decimal FinesDailyAmount { get; set; }
    public int FinesDailyReceiptsCount { get; set; }
    public decimal TotalRegisterCash { get; set; }
    public decimal BaseFloat { get; set; } = 1000.00m;
}

public class CashierTransactionItemResponse
{
    public Guid Id { get; set; }
    public string TransactionReference { get; set; } = string.Empty;
    public string TransactionType { get; set; } = string.Empty; // "Checkout", "Return", "Fine Payment", "Hold Approved"
    public string PatronName { get; set; } = string.Empty;
    public string LibraryCardNumber { get; set; } = string.Empty;
    public string BookTitle { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string CashierName { get; set; } = string.Empty;
}

public class CashierIntakeQueueItemResponse
{
    public Guid Id { get; set; }
    public string ReferenceCode { get; set; } = string.Empty; // e.g. "#KP-RES-2026-00914"
    public Guid PatronId { get; set; }
    public string PatronName { get; set; } = string.Empty;
    public string LibraryCardNumber { get; set; } = string.Empty;
    public string PatronStanding { get; set; } = "Good Standing";
    public int ActiveLoansCount { get; set; }
    public Guid BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public string BookAuthor { get; set; } = string.Empty;
    public string CallNumber { get; set; } = string.Empty;
    public string? BookCoverImage { get; set; }
    public int AvailableCopies { get; set; }
    public int TotalCopies { get; set; }
    public string StacksLocation { get; set; } = "Bay 01 • Stacks Shelf A";
    public DateTime RequestedPickupDate { get; set; }
    public int DurationDays { get; set; } = 14;
    public bool IsPriority { get; set; }
}

public class CashierOverdueQueueItemResponse
{
    public Guid Id { get; set; }
    public string TransactionReference { get; set; } = string.Empty;
    public string PatronName { get; set; } = string.Empty;
    public string LibraryCardNumber { get; set; } = string.Empty;
    public string BookTitle { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public int DaysOverdue { get; set; }
    public decimal CalculatedFine { get; set; }
    public string Status { get; set; } = "Overdue";
}

public class CashierShiftSummaryResponse
{
    public string ActiveCashierName { get; set; } = "Circulation Desk";
    public string StationName { get; set; } = "Front Desk Bay 01";
    public string ShiftLabel { get; set; } = "Shift #01 (Regular)";
    public decimal FloatBase { get; set; } = 1000.00m;
    public decimal FinesCollectedToday { get; set; }
    public decimal TotalRegisterCash { get; set; }
    public bool IsHardwareScannerActive { get; set; } = true;
    public DateTime LastSyncedAt { get; set; } = DateTime.UtcNow;
}
