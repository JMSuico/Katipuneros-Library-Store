// [Layer: Features/Services/Implementations]
// UserService.cs -- Implementation of patron and staff identity workflows.
// Validates credentials, manages registration, and coordinates with IUserRepository.
// DO NOT access AppDbContext directly -- use IUserRepository only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Helpers.Infrastructure;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;

    public UserService(IUserRepository userRepository, IConfiguration configuration) =>
        (_userRepository, _configuration) = (userRepository, configuration);

    public async Task<User?> GetProfileAsync(Guid userId) =>
        await _userRepository.GetByIdAsync(userId);

    public async Task<List<User>> GetAllUsersAsync(UserRole? role = null) =>
        await _userRepository.GetAllAsync(role);

    public async Task<(User? User, string? Token, string? Error)> AuthenticateAsync(string email, string password)
    {
        string cleanEmail = InputSanitizer.SanitizeEmail(email);
        var user = await _userRepository.GetByEmailAsync(cleanEmail);

        if (user == null || !PasswordHelper.VerifyPassword(password, user.PasswordHash))
            return (null, null, "Invalid email or password credentials.");

        if (!user.IsActive)
            return (null, null, "Account has been suspended. Please visit the circulation desk.");

        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        string token = JwtHelper.GenerateToken(user, _configuration);
        return (user, token, null);
    }

    public async Task<(User? User, string? Token, string? Error)> RegisterAsync(string fullName, string email, string password, string? cardNumber, string? department, string? phone)
    {
        string cleanEmail = InputSanitizer.SanitizeEmail(email);
        string cleanName = InputSanitizer.SanitizeText(fullName);

        var existing = await _userRepository.GetByEmailAsync(cleanEmail);
        if (existing != null)
            return (null, null, "An account with this email address already exists.");

        string cardNo = !string.IsNullOrWhiteSpace(cardNumber)
            ? cardNumber.Trim()
            : $"KP-LIB-{DateTime.UtcNow:yyyy}-{Random.Shared.Next(10000, 99999)}";

        var user = new User
        {
            FullName = cleanName,
            Email = cleanEmail,
            PasswordHash = PasswordHelper.HashPassword(password),
            Role = UserRole.Customer,
            LibraryCardNumber = cardNo,
            Department = InputSanitizer.SanitizeText(department ?? "General Patron"),
            PhoneNumber = phone?.Trim(),
            IsActive = true
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        string token = JwtHelper.GenerateToken(user, _configuration);
        return (user, token, null);
    }

    public async Task<(bool Success, string? Error)> UpdateProfileAsync(Guid userId, string fullName, string? phone, string? department) =>
        await _userRepository.GetByIdAsync(userId) is not { } user
            ? (false, "User account not found.")
            : await ExecuteProfileUpdateAsync(user, fullName, phone, department);

    private async Task<(bool Success, string? Error)> ExecuteProfileUpdateAsync(User user, string fullName, string? phone, string? department)
    {
        user.FullName = InputSanitizer.SanitizeText(fullName);
        if (!string.IsNullOrWhiteSpace(phone))
            user.PhoneNumber = phone.Trim();
        if (!string.IsNullOrWhiteSpace(department))
            user.Department = InputSanitizer.SanitizeText(department);

        await _userRepository.UpdateAsync(user);
        var saved = await _userRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to update profile.");
    }

    public async Task<bool> UpdateUserRoleAsync(Guid userId, UserRole role) =>
        await _userRepository.GetByIdAsync(userId) is { } user && await ExecuteRoleUpdateAsync(user, role);

    private async Task<bool> ExecuteRoleUpdateAsync(User user, UserRole role)
    {
        user.Role = role;
        await _userRepository.UpdateAsync(user);
        return await _userRepository.SaveChangesAsync();
    }

    public async Task<bool> ToggleUserStatusAsync(Guid userId, bool isActive) =>
        await _userRepository.GetByIdAsync(userId) is { } user && await ExecuteStatusToggleAsync(user, isActive);

    private async Task<bool> ExecuteStatusToggleAsync(User user, bool isActive)
    {
        user.IsActive = isActive;
        await _userRepository.UpdateAsync(user);
        return await _userRepository.SaveChangesAsync();
    }
}
