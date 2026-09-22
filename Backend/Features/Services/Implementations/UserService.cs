// [Layer: Features/Services/Implementations]
// UserService.cs -- Implementation of patron and staff identity workflows.
// Validates credentials, manages registration, and coordinates with IUserRepository.
// DO NOT access AppDbContext directly -- use IUserRepository only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using Backend.Features.Api.DTOs.Requests;
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

    public async Task<(User? User, string? Token, string? Error)> AuthenticateAsync(string identifier, string password) =>
        string.IsNullOrWhiteSpace(identifier) || string.IsNullOrWhiteSpace(password)
            ? (null, null, "Email/Username and password are required.")
            : await ExecuteAuthenticationAsync(identifier.Trim(), password);

    private async Task<(User? User, string? Token, string? Error)> ExecuteAuthenticationAsync(string identifier, string password) =>
        await _userRepository.GetByIdentifierAsync(identifier) switch
        {
            null => (null, null, "Invalid credentials. No account found with that email or username."),
            var user when !PasswordHelper.VerifyPassword(password, user.PasswordHash) => (null, null, "Invalid credentials. Incorrect password."),
            var user when !user.IsActive => (null, null, "Account has been suspended. Please visit the circulation desk."),
            var user => await CompleteAuthenticationAsync(user)
        };

    private async Task<(User? User, string? Token, string? Error)> CompleteAuthenticationAsync(User user)
    {
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();
        string token = JwtHelper.GenerateToken(user, _configuration);
        return (user, token, null);
    }

    public async Task<(User? User, string? Token, string? Error)> RegisterCustomerAsync(RegisterRequest request) =>
        await _userRepository.GetByEmailAsync(InputSanitizer.SanitizeEmail(request.Email)) is not null
            ? (null, null, "An account with this email address already exists.")
            : await _userRepository.GetByUsernameAsync(request.Username.Trim()) is not null
                ? (null, null, "An account with this username already exists.")
                : await ExecuteCustomerRegistrationAsync(request);

    private async Task<(User? User, string? Token, string? Error)> ExecuteCustomerRegistrationAsync(RegisterRequest request)
    {
        string cleanEmail = InputSanitizer.SanitizeEmail(request.Email);
        string cleanFirst = InputSanitizer.SanitizeText(request.FirstName);
        string? cleanMiddle = !string.IsNullOrWhiteSpace(request.MiddleName) ? InputSanitizer.SanitizeText(request.MiddleName) : null;
        string cleanLast = InputSanitizer.SanitizeText(request.LastName);
        string fullName = string.IsNullOrWhiteSpace(cleanMiddle) ? $"{cleanFirst} {cleanLast}" : $"{cleanFirst} {cleanMiddle} {cleanLast}";
        string cardNo = !string.IsNullOrWhiteSpace(request.LibraryCardNumber)
            ? request.LibraryCardNumber.Trim()
            : $"KP-LIB-{DateTime.UtcNow:yyyy}-{Random.Shared.Next(10000, 99999)}";

        var user = new User
        {
            FirstName = cleanFirst,
            MiddleName = cleanMiddle,
            LastName = cleanLast,
            FullName = fullName,
            Username = request.Username.Trim(),
            Email = cleanEmail,
            PasswordHash = PasswordHelper.HashPassword(request.Password),
            Role = UserRole.Customer,
            EmploymentStatus = InputSanitizer.SanitizeText(request.EmploymentStatus),
            CurrentAddress = InputSanitizer.SanitizeText(request.CurrentAddress),
            PermanentAddress = InputSanitizer.SanitizeText(request.PermanentAddress),
            LibraryCardNumber = cardNo,
            Department = InputSanitizer.SanitizeText(request.Department ?? "General Patron"),
            PhoneNumber = request.PhoneNumber?.Trim(),
            IsActive = true
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();
        string token = JwtHelper.GenerateToken(user, _configuration);
        return (user, token, null);
    }

    public async Task<(User? User, string? Token, string? Error)> RegisterAsync(string fullName, string email, string password, string? cardNumber, string? department, string? phone) =>
        await RegisterCustomerAsync(new RegisterRequest
        {
            FirstName = fullName.Split(' ').FirstOrDefault() ?? fullName,
            LastName = fullName.Split(' ').Skip(1).FirstOrDefault() ?? "Patron",
            FullName = fullName,
            Email = email,
            Username = email.Split('@').FirstOrDefault() ?? $"user{Random.Shared.Next(1000, 9999)}",
            Password = password,
            EmploymentStatus = "Student",
            CurrentAddress = "Main Campus",
            PermanentAddress = "Main Campus",
            LibraryCardNumber = cardNumber,
            Department = department,
            PhoneNumber = phone
        });

    public async Task<(User? User, string? Error)> CreateCashierByAdminAsync(CreateCashierByAdminRequest request) =>
        await _userRepository.GetByEmailAsync(InputSanitizer.SanitizeEmail(request.Email)) is not null
            ? (null, "An account with this email address already exists.")
            : await _userRepository.GetByUsernameAsync(request.Username.Trim()) is not null
                ? (null, "An account with this username already exists.")
                : await ExecuteCashierCreationAsync(request);

    private async Task<(User? User, string? Error)> ExecuteCashierCreationAsync(CreateCashierByAdminRequest request)
    {
        string cleanEmail = InputSanitizer.SanitizeEmail(request.Email);
        string cleanFirst = InputSanitizer.SanitizeText(request.FirstName);
        string? cleanMiddle = !string.IsNullOrWhiteSpace(request.MiddleName) ? InputSanitizer.SanitizeText(request.MiddleName) : null;
        string cleanLast = InputSanitizer.SanitizeText(request.LastName);
        string fullName = string.IsNullOrWhiteSpace(cleanMiddle) ? $"{cleanFirst} {cleanLast}" : $"{cleanFirst} {cleanMiddle} {cleanLast}";
        string cardNo = !string.IsNullOrWhiteSpace(request.LibraryCardNumber)
            ? request.LibraryCardNumber.Trim()
            : $"KP-CSH-{DateTime.UtcNow:yyyy}-{Random.Shared.Next(10000, 99999)}";

        var user = new User
        {
            FirstName = cleanFirst,
            MiddleName = cleanMiddle,
            LastName = cleanLast,
            FullName = fullName,
            Username = request.Username.Trim(),
            Email = cleanEmail,
            PasswordHash = PasswordHelper.HashPassword(request.Password),
            Role = UserRole.Cashier,
            EmploymentStatus = "Employee",
            CurrentAddress = "Staff Residence / Circulation",
            PermanentAddress = "Staff Residence / Circulation",
            LibraryCardNumber = cardNo,
            Department = InputSanitizer.SanitizeText(request.Department ?? "Circulation & Stacks Terminal"),
            PhoneNumber = request.PhoneNumber?.Trim(),
            IsActive = true
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();
        return (user, null);
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

    public async Task<(bool Success, string? Error)> UpdateDetailedProfileAsync(Guid userId, UpdateProfileRequest request) =>
        await _userRepository.GetByIdAsync(userId) is not { } user
            ? (false, "User account not found.")
            : await ExecuteDetailedProfileUpdateAsync(user, request);

    private async Task<(bool Success, string? Error)> ExecuteDetailedProfileUpdateAsync(User user, UpdateProfileRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.FirstName)) user.FirstName = InputSanitizer.SanitizeText(request.FirstName);
        if (request.MiddleName != null) user.MiddleName = InputSanitizer.SanitizeText(request.MiddleName);
        if (!string.IsNullOrWhiteSpace(request.LastName)) user.LastName = InputSanitizer.SanitizeText(request.LastName);
        if (!string.IsNullOrWhiteSpace(request.FullName)) user.FullName = InputSanitizer.SanitizeText(request.FullName);
        else if (user.FirstName != null && user.LastName != null)
            user.FullName = string.IsNullOrWhiteSpace(user.MiddleName) ? $"{user.FirstName} {user.LastName}" : $"{user.FirstName} {user.MiddleName} {user.LastName}";

        if (!string.IsNullOrWhiteSpace(request.EmploymentStatus)) user.EmploymentStatus = InputSanitizer.SanitizeText(request.EmploymentStatus);
        if (!string.IsNullOrWhiteSpace(request.CurrentAddress)) user.CurrentAddress = InputSanitizer.SanitizeText(request.CurrentAddress);
        if (!string.IsNullOrWhiteSpace(request.PermanentAddress)) user.PermanentAddress = InputSanitizer.SanitizeText(request.PermanentAddress);
        if (!string.IsNullOrWhiteSpace(request.PhoneNumber)) user.PhoneNumber = request.PhoneNumber.Trim();
        if (!string.IsNullOrWhiteSpace(request.Department)) user.Department = InputSanitizer.SanitizeText(request.Department);

        await _userRepository.UpdateAsync(user);
        var saved = await _userRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to update profile details.");
    }

    public async Task<(bool Success, string? ProfilePictureUrl, string? Error)> UpdateProfilePictureAsync(Guid userId, string pictureData) =>
        await _userRepository.GetByIdAsync(userId) is not { } user
            ? (false, null, "User account not found.")
            : await ExecutePictureUpdateAsync(user, pictureData);

    private async Task<(bool Success, string? ProfilePictureUrl, string? Error)> ExecutePictureUpdateAsync(User user, string pictureData)
    {
        user.ProfilePictureUrl = pictureData;
        await _userRepository.UpdateAsync(user);
        var saved = await _userRepository.SaveChangesAsync();
        return (saved, saved ? user.ProfilePictureUrl : null, saved ? null : "Failed to persist profile picture.");
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
