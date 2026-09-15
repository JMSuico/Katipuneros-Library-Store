// [Layer: Features/Repositories/Interfaces]
// IUserRepository.cs -- Contract for user data access via EF Core.
// Defines queries for patrons, cashiers, and administrators.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;

namespace Backend.Features.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByCardNumberAsync(string cardNumber);
    Task<List<User>> GetAllAsync(UserRole? role = null, bool? isActive = null);
    Task AddAsync(User user);
    Task UpdateAsync(User user);
    Task<bool> SaveChangesAsync();
    Task<bool> CanConnectAsync();
}
