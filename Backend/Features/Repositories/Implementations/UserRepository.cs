// [Layer: Features/Repositories/Implementations]
// UserRepository.cs -- Data access implementation for User entity via EF Core.
// Queries AppDbContext directly.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using Microsoft.EntityFrameworkCore;
using Backend.Features.Data;
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;

namespace Backend.Features.Repositories.Implementations;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context) =>
        _context = context;

    public async Task<User?> GetByIdAsync(Guid id) =>
        await _context.Users.FindAsync(id);

    public async Task<User?> GetByEmailAsync(string email) =>
        await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

    public async Task<User?> GetByCardNumberAsync(string cardNumber) =>
        await _context.Users.FirstOrDefaultAsync(u => u.LibraryCardNumber == cardNumber);

    public async Task<List<User>> GetAllAsync(UserRole? role = null, bool? isActive = null) =>
        await _context.Users
            .Where(u => !role.HasValue || u.Role == role.Value)
            .Where(u => !isActive.HasValue || u.IsActive == isActive.Value)
            .OrderBy(u => u.FullName)
            .ToListAsync();

    public async Task AddAsync(User user) =>
        await _context.Users.AddAsync(user);

    public Task UpdateAsync(User user) =>
        Task.FromResult(_context.Users.Update(user));

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() > 0;

    public async Task<bool> CanConnectAsync() =>
        await _context.Database.CanConnectAsync();
}
