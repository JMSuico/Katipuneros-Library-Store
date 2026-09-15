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

    public async Task AddAsync(Reservation reservation) =>
        await _context.Reservations.AddAsync(reservation);

    public Task UpdateAsync(Reservation reservation) =>
        Task.FromResult(_context.Reservations.Update(reservation));

    public Task DeleteAsync(Reservation reservation) =>
        Task.FromResult(_context.Reservations.Remove(reservation));

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() > 0;
}
