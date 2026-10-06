// [Layer: Features/Repositories/Implementations]
// CashierRepository.cs -- High-performance EF Core queries for Cashier circulation metrics, queues, and ledger.
// Universal lambda expressions (=>) across all methods.
// DO NOT put business logic, controller endpoints, or UI concerns here.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data;
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;

namespace Backend.Features.Repositories.Implementations;

public class CashierRepository : ICashierRepository
{
    private readonly AppDbContext _context;

    public CashierRepository(AppDbContext context) =>
        _context = context;

    public async Task<CashierDashboardKpisResponse> GetDashboardKpisAsync()
    {
        var now = DateTime.UtcNow;
        var today = now.Date;

        var pendingHolds = await _context.Reservations.CountAsync(r => r.Status == ReservationStatus.Pending);
        var urgentHolds = await _context.Reservations.CountAsync(r => r.Status == ReservationStatus.Pending && r.ReservationDate.Date == today);
        var approvedToday = await _context.Reservations.CountAsync(r => r.Status == ReservationStatus.StagedInLocker && r.ReservationDate.Date == today);
        var toRelease = await _context.Reservations.CountAsync(r => r.Status == ReservationStatus.StagedInLocker && r.FulfilledDate == null);

        var activeLoans = await _context.BorrowTransactions.CountAsync(t => t.Status == TransactionStatus.Active);
        var dueToday = await _context.BorrowTransactions.CountAsync(t => t.Status == TransactionStatus.Active && t.DueDate.Date == today);
        var overdueLoans = await _context.BorrowTransactions.CountAsync(t => t.Status == TransactionStatus.Active && t.DueDate < now);
        var returnsToday = await _context.BorrowTransactions.CountAsync(t => t.Status == TransactionStatus.Returned && t.ReturnDate.HasValue && t.ReturnDate.Value.Date == today);

        var settledTodayFines = await _context.FineTransactions
            .Where(f => f.Status == "Settled" && f.SettledAt.HasValue && f.SettledAt.Value.Date == today)
            .ToListAsync();

        var finesAmount = settledTodayFines.Sum(f => f.Amount - f.BalanceRemaining);
        var receiptsCount = settledTodayFines.Count;

        const decimal baseFloat = 1000.00m;

        return new CashierDashboardKpisResponse
        {
            PendingHoldsCount = pendingHolds,
            UrgentTodayHoldsCount = urgentHolds,
            ApprovedTodayCount = approvedToday,
            ToReleaseCount = toRelease,
            ActiveLoansCount = activeLoans,
            DueTodayCount = dueToday,
            OverdueLoansCount = overdueLoans,
            ReturnsTodayCount = returnsToday,
            FinesDailyAmount = finesAmount,
            FinesDailyReceiptsCount = receiptsCount,
            BaseFloat = baseFloat,
            TotalRegisterCash = baseFloat + finesAmount
        };
    }

    public async Task<List<Reservation>> GetIntakeQueueReservationsAsync(int limit = 5) =>
        await _context.Reservations
            .Include(r => r.Patron)
            .Include(r => r.Book)
            .Where(r => r.Status == ReservationStatus.Pending)
            .OrderBy(r => r.ReservationDate)
            .Take(limit)
            .ToListAsync();

    public async Task<List<BorrowTransaction>> GetOverdueQueueLoansAsync(int limit = 5) =>
        await _context.BorrowTransactions
            .Include(t => t.Patron)
            .Include(t => t.Book)
            .Where(t => t.Status == TransactionStatus.Active && t.DueDate < DateTime.UtcNow)
            .OrderBy(t => t.DueDate)
            .Take(limit)
            .ToListAsync();

    public async Task<List<BorrowTransaction>> GetCirculationLedgerAsync(DateTime? date, string? type, string? search, int page = 1, int pageSize = 20)
    {
        var query = _context.BorrowTransactions
            .Include(t => t.Patron)
            .Include(t => t.Book)
            .Include(t => t.Cashier)
            .AsQueryable();

        if (date.HasValue)
        {
            var targetDate = date.Value.Date;
            query = query.Where(t => t.BorrowDate.Date == targetDate || (t.ReturnDate.HasValue && t.ReturnDate.Value.Date == targetDate));
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            query = type.ToLower() switch
            {
                "active" or "checkout" => query.Where(t => t.Status == TransactionStatus.Active),
                "returned" or "return" => query.Where(t => t.Status == TransactionStatus.Returned),
                "overdue" => query.Where(t => t.Status == TransactionStatus.Active && t.DueDate < DateTime.UtcNow),
                _ => query
            };
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(t =>
                (t.Patron != null && (t.Patron.FullName.ToLower().Contains(s) || t.Patron.LibraryCardNumber.ToLower().Contains(s))) ||
                (t.Book != null && (t.Book.Title.ToLower().Contains(s) || (t.Book.IsbnBarcode != null && t.Book.IsbnBarcode.ToLower().Contains(s)) || t.Book.Isbn.ToLower().Contains(s))));
        }

        return await query
            .OrderByDescending(t => t.BorrowDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetCirculationLedgerCountAsync(DateTime? date, string? type, string? search)
    {
        var query = _context.BorrowTransactions.AsQueryable();

        if (date.HasValue)
        {
            var targetDate = date.Value.Date;
            query = query.Where(t => t.BorrowDate.Date == targetDate || (t.ReturnDate.HasValue && t.ReturnDate.Value.Date == targetDate));
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            query = type.ToLower() switch
            {
                "active" or "checkout" => query.Where(t => t.Status == TransactionStatus.Active),
                "returned" or "return" => query.Where(t => t.Status == TransactionStatus.Returned),
                "overdue" => query.Where(t => t.Status == TransactionStatus.Active && t.DueDate < DateTime.UtcNow),
                _ => query
            };
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(t =>
                (t.Patron != null && (t.Patron.FullName.ToLower().Contains(s) || t.Patron.LibraryCardNumber.ToLower().Contains(s))) ||
                (t.Book != null && (t.Book.Title.ToLower().Contains(s) || (t.Book.IsbnBarcode != null && t.Book.IsbnBarcode.ToLower().Contains(s)) || t.Book.Isbn.ToLower().Contains(s))));
        }

        return await query.CountAsync();
    }

    public async Task<List<FineTransaction>> GetDailySettledFinesAsync(DateTime date) =>
        await _context.FineTransactions
            .Include(f => f.Patron)
            .Include(f => f.BorrowTransaction)
            .Where(f => f.Status == "Settled" && f.SettledAt.HasValue && f.SettledAt.Value.Date == date.Date)
            .OrderByDescending(f => f.SettledAt)
            .ToListAsync();
}
