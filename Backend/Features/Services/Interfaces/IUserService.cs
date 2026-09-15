// [Layer: Features/Services/Interfaces]
// IUserService.cs -- Contract for identity, registration, and patron management workflows.
// Defines business rules for authentication, profiling, and role administration.
// DO NOT put data access, raw SQL, or HTTP concerns here.

using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;

namespace Backend.Features.Services.Interfaces;

public interface IUserService
{
    Task<(User? User, string? Token, string? Error)> AuthenticateAsync(string email, string password);
    Task<(User? User, string? Token, string? Error)> RegisterAsync(string fullName, string email, string password, string? cardNumber, string? department, string? phone);
    Task<User?> GetProfileAsync(Guid userId);
    Task<(bool Success, string? Error)> UpdateProfileAsync(Guid userId, string fullName, string? phone, string? department);
    Task<List<User>> GetAllUsersAsync(UserRole? role = null);
    Task<bool> UpdateUserRoleAsync(Guid userId, UserRole role);
    Task<bool> ToggleUserStatusAsync(Guid userId, bool isActive);
}
