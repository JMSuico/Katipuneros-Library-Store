// [Layer: Features/Services/Interfaces]
// IUserService.cs -- Contract for identity, registration, and patron management workflows.
// Defines business rules for authentication, profiling, and role administration.
// DO NOT put data access, raw SQL, or HTTP concerns here.

using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;

namespace Backend.Features.Services.Interfaces;

public interface IUserService
{
    Task<(User? User, string? Token, string? Error)> AuthenticateAsync(string identifier, string password);
    Task<(User? User, string? Token, string? Error)> RegisterCustomerAsync(RegisterRequest request);
    Task<(User? User, string? Token, string? Error)> RegisterAsync(string fullName, string email, string password, string? cardNumber, string? department, string? phone);
    Task<(User? User, string? Error)> CreateCashierByAdminAsync(CreateCashierByAdminRequest request);
    Task<User?> GetProfileAsync(Guid userId);
    Task<(bool Success, string? Error)> UpdateProfileAsync(Guid userId, string fullName, string? phone, string? department);
    Task<(bool Success, string? Error)> UpdateDetailedProfileAsync(Guid userId, UpdateProfileRequest request);
    Task<(bool Success, string? ProfilePictureUrl, string? Error)> UpdateProfilePictureAsync(Guid userId, string pictureData);
    Task<List<User>> GetAllUsersAsync(UserRole? role = null);
    Task<bool> UpdateUserRoleAsync(Guid userId, UserRole role);
    Task<bool> ToggleUserStatusAsync(Guid userId, bool isActive);
    Task<(bool Success, string? Error)> DeleteUserAsync(Guid userId);
    Task<(int DeletedCount, string? Error)> BulkDeleteUsersAsync(List<Guid> userIds);
    Task<(bool Success, string? Error)> AdminUpdateUserAsync(Guid userId, AdminUpdateUserRequest request);
    Task<(User? User, string? Error)> AdminCreateUserAsync(AdminCreateUserRequest request);
}
