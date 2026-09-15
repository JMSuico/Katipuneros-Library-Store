// [Layer: Features/Repositories/Interfaces]
// IReservationRepository.cs -- Contract for holds and smart locker data access via EF Core.
// Defines queries for active holds, queue positioning, and pending fulfillment.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;

namespace Backend.Features.Repositories.Interfaces;

public interface IReservationRepository
{
    Task<Reservation?> GetByIdAsync(Guid id);
    Task<List<Reservation>> GetActiveByPatronIdAsync(Guid patronId);
    Task<List<Reservation>> GetPendingQueueByBookIdAsync(Guid bookId);
    Task<List<Reservation>> GetAllPendingAsync();
    Task AddAsync(Reservation reservation);
    Task UpdateAsync(Reservation reservation);
    Task DeleteAsync(Reservation reservation);
    Task<bool> SaveChangesAsync();
}
