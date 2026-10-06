// [Layer: Features/Services/Implementations]
// CashierService.cs -- Business logic, queue orchestration, and report generation for Cashier operations.
// Universal lambda expressions (=>) across all methods.
// DO NOT put HTTP concerns or direct DB queries here.

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data.Enums;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class CashierService : ICashierService
{
    private readonly ICashierRepository _cashierRepo;

    public CashierService(ICashierRepository cashierRepo) =>
        _cashierRepo = cashierRepo;

    public async Task<CashierDashboardKpisResponse> GetDashboardKpisAsync() =>
        await _cashierRepo.GetDashboardKpisAsync();

    public async Task<List<CashierIntakeQueueItemResponse>> GetIntakeQueueAsync()
    {
        var raw = await _cashierRepo.GetIntakeQueueReservationsAsync(10);
        return raw.Select(r => new CashierIntakeQueueItemResponse
        {
            Id = r.Id,
            ReferenceCode = $"#KP-RES-{r.ReservationDate:yyyy}-{r.Id.ToString()[..5].ToUpper()}",
            PatronId = r.PatronId,
            PatronName = r.Patron?.FullName ?? "Unknown Patron",
            LibraryCardNumber = r.Patron?.LibraryCardNumber ?? "—",
            PatronStanding = r.Patron?.IsActive == true ? "Good Standing" : "Suspended",
            ActiveLoansCount = 0,
            BookId = r.BookId,
            BookTitle = r.Book?.Title ?? "Untitled Book",
            BookAuthor = r.Book?.Author ?? "Unknown Author",
            CallNumber = r.Book?.DeweyCode ?? "—",
            BookCoverImage = r.Book?.CoverImage,
            AvailableCopies = r.Book?.AvailableCopies ?? 0,
            TotalCopies = r.Book?.TotalCopies ?? 0,
            StacksLocation = !string.IsNullOrWhiteSpace(r.Book?.BayLocation) ? r.Book.BayLocation : "Bay 01 • Stacks Shelf A",
            RequestedPickupDate = r.ReservationDate,
            DurationDays = 14,
            IsPriority = r.ReservationDate.Date == DateTime.UtcNow.Date
        }).ToList();
    }

    public async Task<List<CashierOverdueQueueItemResponse>> GetOverdueQueueAsync()
    {
        var raw = await _cashierRepo.GetOverdueQueueLoansAsync(10);
        var now = DateTime.UtcNow;

        return raw.Select(t =>
        {
            var days = Math.Max(0, (int)(now.Date - t.DueDate.Date).TotalDays);
            var fine = Math.Min(days * 15.00m, 500.00m);

            return new CashierOverdueQueueItemResponse
            {
                Id = t.Id,
                TransactionReference = $"#CIRC-{t.BorrowDate:yyyy}-{t.Id.ToString()[..5].ToUpper()}",
                PatronName = t.Patron?.FullName ?? "Unknown Borrower",
                LibraryCardNumber = t.Patron?.LibraryCardNumber ?? "—",
                BookTitle = t.Book?.Title ?? "Untitled Volume",
                Barcode = t.Book?.IsbnBarcode ?? t.Book?.Isbn ?? "—",
                DueDate = t.DueDate,
                DaysOverdue = days,
                CalculatedFine = fine,
                Status = "Overdue"
            };
        }).ToList();
    }

    public async Task<(List<CashierTransactionItemResponse> Items, int TotalCount)> GetTransactionsLedgerAsync(CashierTransactionFilterRequest request)
    {
        var transactions = await _cashierRepo.GetCirculationLedgerAsync(request.Date, request.Type, request.Search, request.Page, request.PageSize);
        var totalCount = await _cashierRepo.GetCirculationLedgerCountAsync(request.Date, request.Type, request.Search);

        var items = transactions.Select(t => new CashierTransactionItemResponse
        {
            Id = t.Id,
            TransactionReference = $"#CIRC-{t.BorrowDate:yyyy}-{t.Id.ToString()[..5].ToUpper()}",
            TransactionType = t.Status == TransactionStatus.Returned ? "Return" : "Checkout",
            PatronName = t.Patron?.FullName ?? "Unknown Patron",
            LibraryCardNumber = t.Patron?.LibraryCardNumber ?? "—",
            BookTitle = t.Book?.Title ?? "Untitled Book",
            Barcode = t.Book?.IsbnBarcode ?? t.Book?.Isbn ?? "—",
            Amount = 0.00m,
            Status = t.Status.ToString(),
            Timestamp = t.ReturnDate ?? t.BorrowDate,
            CashierName = t.Cashier?.FullName ?? "Station Cashier"
        }).ToList();

        return (items, totalCount);
    }

    public async Task<byte[]> ExportTransactionsCsvAsync(DateTime? date)
    {
        var transactions = await _cashierRepo.GetCirculationLedgerAsync(date, null, null, 1, 1000);
        var sb = new StringBuilder();
        sb.AppendLine("Transaction Reference,Type,Patron Name,Library Card,Book Title,Barcode,Status,Timestamp,Cashier");

        foreach (var t in transactions)
        {
            var refCode = $"#CIRC-{t.BorrowDate:yyyy}-{t.Id.ToString()[..5].ToUpper()}";
            var type = t.Status == TransactionStatus.Returned ? "Return" : "Checkout";
            var patron = EscapeCsv(t.Patron?.FullName ?? "Unknown");
            var card = EscapeCsv(t.Patron?.LibraryCardNumber ?? "—");
            var title = EscapeCsv(t.Book?.Title ?? "Untitled");
            var barcode = EscapeCsv(t.Book?.IsbnBarcode ?? t.Book?.Isbn ?? "—");
            var status = t.Status.ToString();
            var ts = (t.ReturnDate ?? t.BorrowDate).ToString("yyyy-MM-dd HH:mm:ss");
            var cashier = EscapeCsv(t.Cashier?.FullName ?? "Station Cashier");

            sb.AppendLine($"{refCode},{type},{patron},{card},{title},{barcode},{status},{ts},{cashier}");
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    public async Task<CashierShiftSummaryResponse> GetShiftSummaryAsync(string? cashierName)
    {
        var kpis = await _cashierRepo.GetDashboardKpisAsync();
        return new CashierShiftSummaryResponse
        {
            ActiveCashierName = !string.IsNullOrWhiteSpace(cashierName) ? cashierName : "Circulation Desk",
            StationName = "Front Desk Bay 01",
            ShiftLabel = "Shift #01 (Regular)",
            FloatBase = kpis.BaseFloat,
            FinesCollectedToday = kpis.FinesDailyAmount,
            TotalRegisterCash = kpis.TotalRegisterCash,
            IsHardwareScannerActive = true,
            LastSyncedAt = DateTime.UtcNow
        };
    }

    private static string EscapeCsv(string value) =>
        value.Contains(',') || value.Contains('"') || value.Contains('\n')
            ? $"\"{value.Replace("\"", "\"\"")}\""
            : value;
}
