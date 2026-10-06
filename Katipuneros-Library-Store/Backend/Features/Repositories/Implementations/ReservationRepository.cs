// [Layer: Features/Repositories/Implementations]
// ReservationRepository.cs -- Data access implementation for Reservation entity via EF Core.
// Queries AppDbContext directly.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Microsoft.EntityFrameworkCore;
using Backend.Features.Data;
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;

namespace Backend.Features.Repositories.Implementations;

public class ReservationRepository : IReservationRepository
{
    private readonly AppDbContext _context;

    public ReservationRepository(AppDbContext context) =>
        _context = context;

    public async Task<Reservation?> GetByIdAsync(Guid id) =>
        await _context.Reservations
            .Include(r => r.Book)
            .Include(r => r.Patron)
            .FirstOrDefaultAsync(r => r.Id == id);

    public async Task<List<Reservation>> GetActiveByPatronIdAsync(Guid patronId) =>
        await _context.Reservations
            .Include(r => r.Book)
            .Where(r => r.PatronId == patronId && (r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.StagedInLocker))
            .OrderByDescending(r => r.ReservationDate)
            .ToListAsync();

    public async Task<List<Reservation>> GetPendingQueueByBookIdAsync(Guid bookId) =>
        await _context.Reservations
            .Where(r => r.BookId == bookId && r.Status == ReservationStatus.Pending)
            .OrderBy(r => r.QueuePosition)
            .ToListAsync();

    public async Task<List<Reservation>> GetAllPendingAsync() =>
        await _context.Reservations
            .Include(r => r.Book)
            .Include(r => r.Patron)
            .Where(r => r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.StagedInLocker)
            .OrderBy(r => r.ReservationDate)
            .ToListAsync();

    public async Task<List<Reservation>> GetAllWithDetailsAsync(string? status = null, string? query = null)
    {
        var q = _context.Reservations
            .Include(r => r.Book)
            .Include(r => r.Patron)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ReservationStatus>(status, true, out var parsedStatus))
            q = q.Where(r => r.Status == parsedStatus);

        if (!string.IsNullOrWhiteSpace(query))
        {
            var term = query.Trim().ToLower();
            q = q.Where(r =>
                (r.Book != null && (r.Book.Title.ToLower().Contains(term) || r.Book.Author.ToLower().Contains(term) || r.Book.DeweyCode.ToLower().Contains(term))) ||
                (r.Patron != null && (r.Patron.FullName.ToLower().Contains(term) || r.Patron.LibraryCardNumber.ToLower().Contains(term))) ||
                (r.LockerBay != null && r.LockerBay.ToLower().Contains(term)));
        }

        return await q.OrderByDescending(r => r.ReservationDate).ToListAsync();
    }

    public async Task<List<Reservation>> GetByIdsAsync(IEnumerable<Guid> ids) =>
        await _context.Reservations
            .Include(r => r.Book)
            .Include(r => r.Patron)
            .Where(r => ids.Contains(r.Id))
            .ToListAsync();

    public async Task<int> GetCountByStatusesAsync(params ReservationStatus[] statuses) =>
        statuses.Length == 0
            ? await _context.Reservations.AsNoTracking().CountAsync()
            : await _context.Reservations.AsNoTracking().CountAsync(r => statuses.Contains(r.Status));

    public async Task<double> GetAverageFulfillmentHoursAsync()
    {
        var hoursList = await _context.Reservations.AsNoTracking()
            .Where(r => (r.Status == ReservationStatus.Fulfilled || r.Status == ReservationStatus.StagedInLocker) && r.FulfilledDate != null)
            .Select(r => (r.FulfilledDate!.Value - r.ReservationDate).TotalHours)
            .ToListAsync();

        return hoursList.Count > 0 ? Math.Round(hoursList.Average(), 1) : 0.0;
    }

    public async Task AddAsync(Reservation reservation) =>
        await _context.Reservations.AddAsync(reservation);

    public Task UpdateAsync(Reservation reservation) =>
        Task.FromResult(_context.Reservations.Update(reservation));

    public Task DeleteAsync(Reservation reservation) =>
        Task.FromResult(_context.Reservations.Remove(reservation));

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() > 0;
}

