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
using Microsoft.EntityFrameworkCore;

namespace Backend.Features.Services.Implementations;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IBorrowRepository _borrowRepository;
    private readonly IReservationRepository _reservationRepository;
    private readonly IFineRepository _fineRepository;
    private readonly IConfiguration _configuration;

    public UserService(
        IUserRepository userRepository,
        IBorrowRepository borrowRepository,
        IReservationRepository reservationRepository,
        IFineRepository fineRepository,
        IConfiguration configuration) =>
        (_userRepository, _borrowRepository, _reservationRepository, _fineRepository, _configuration) =
        (userRepository, borrowRepository, reservationRepository, fineRepository, configuration);

    public async Task<User?> GetProfileAsync(Guid userId) =>
        await _userRepository.GetByIdAsync(userId);

    public async Task<List<User>> GetAllUsersAsync(UserRole? role = null) =>
        await _userRepository.GetAllAsync(role);

    public async Task<(User? User, string? Token, string? Error)> AuthenticateAsync(string identifier, string password) =>
        string.IsNullOrWhiteSpace(identifier) || string.IsNullOrWhiteSpace(password)
            ? (null, null, "Email/Username and password are required.")
            : await ExecuteAuthenticationAsync(identifier.Trim(), password);

    private async Task<(User? User, string? Token, string? Error)> ExecuteAuthenticationAsync(string identifier, string password)
    {
        var user = await _userRepository.GetByIdentifierAsync(identifier);
        if (user == null)
            return (null, null, "Invalid credentials. No account found with that email or username.");

        bool isPasswordValid = PasswordHelper.VerifyPassword(password, user.PasswordHash);
        if (!isPasswordValid)
            return (null, null, "Invalid credentials. Incorrect password.");

        if (!user.IsActive)
            return (null, null, "Account has been suspended. Please visit the circulation desk.");

        return await CompleteAuthenticationAsync(user);
    }

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

        if (await _userRepository.GetByCardNumberAsync(cardNo) != null)
        {
            cardNo = $"KP-CSH-{DateTime.UtcNow:yyyy}-{Random.Shared.Next(10000, 99999)}";
            while (await _userRepository.GetByCardNumberAsync(cardNo) != null)
            {
                cardNo = $"KP-CSH-{DateTime.UtcNow:yyyy}-{Random.Shared.Next(10000, 99999)}";
            }
        }

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
        if (!string.IsNullOrWhiteSpace(request.Username) && request.Username.Trim() != user.Username)
        {
            var existingUser = await _userRepository.GetByUsernameAsync(request.Username.Trim());
            if (existingUser != null && existingUser.Id != user.Id)
                return (false, "Username is already taken by another account.");
            user.Username = InputSanitizer.SanitizeText(request.Username.Trim());
        }

        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email.Trim() != user.Email)
        {
            string cleanEmail = InputSanitizer.SanitizeEmail(request.Email.Trim());
            var existingUser = await _userRepository.GetByEmailAsync(cleanEmail);
            if (existingUser != null && existingUser.Id != user.Id)
                return (false, "Email is already taken by another account.");
            user.Email = cleanEmail;
        }

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
        if (request.Age.HasValue) user.Age = request.Age.Value.ToString();

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
        await _userRepository.GetByIdAsync(userId) is { } user &&
        (!user.IsProtected || isActive) &&
        await ExecuteStatusToggleAsync(user, isActive);

    private async Task<bool> ExecuteStatusToggleAsync(User user, bool isActive)
    {
        user.IsActive = isActive;
        await _userRepository.UpdateAsync(user);
        return await _userRepository.SaveChangesAsync();
    }

    public async Task<(bool Success, string? Error)> DeleteUserAsync(Guid userId) =>
        await _userRepository.GetByIdAsync(userId) is not { } user
            ? (false, "User account not found.")
            : user.IsProtected
                ? (false, "Protected CLI root account cannot be deleted via the Web UI. Administrative CLI terminal authority is required.")
                : (await _borrowRepository.GetActiveByPatronIdAsync(userId)).Any()
                    ? (false, "Cannot delete user account: patron has active book loans.")
                    : (await _reservationRepository.GetActiveByPatronIdAsync(userId)).Any(r => r.Status is ReservationStatus.Pending or ReservationStatus.StagedInLocker)
                        ? (false, "Cannot delete user account: patron has active book reservations.")
                        : (await _fineRepository.GetByPatronIdAsync(userId)).Any(f => f.BalanceRemaining > 0 || f.Status == "Unpaid")
                            ? (false, "Cannot delete user account: patron has unpaid fines.")
                            : await ExecuteUserDeleteAsync(user);

    private async Task<(bool Success, string? Error)> ExecuteUserDeleteAsync(User user)
    {
        try
        {
            await _userRepository.DeleteAsync(user);
            var saved = await _userRepository.SaveChangesAsync();
            return (saved, saved ? null : "Failed to delete user account.");
        }
        catch (DbUpdateException)
        {
            return (false, "Cannot delete user account: historical circulation or audit records are linked.");
        }
    }

    public async Task<(int DeletedCount, string? Error)> BulkDeleteUsersAsync(List<Guid> userIds)
    {
        if (userIds == null || userIds.Count == 0) return (0, "No user IDs provided for deletion.");
        var toDelete = new List<User>();
        foreach (var id in userIds)
        {
            if (await _userRepository.GetByIdAsync(id) is { } user)
            {
                if (!user.IsProtected)
                {
                    toDelete.Add(user);
                }
            }
        }
        if (toDelete.Count == 0) return (0, "No eligible user accounts found to delete (Protected CLI root accounts cannot be deleted via Web UI).");
        await _userRepository.DeleteRangeAsync(toDelete);
        await _userRepository.SaveChangesAsync();
        return (toDelete.Count, null);
    }

    public async Task<(bool Success, string? Error)> AdminUpdateUserAsync(Guid userId, AdminUpdateUserRequest request) =>
        await _userRepository.GetByIdAsync(userId) is not { } user
            ? (false, "User account not found.")
            : await ExecuteAdminUpdateAsync(user, request);

    private async Task<(bool Success, string? Error)> ExecuteAdminUpdateAsync(User user, AdminUpdateUserRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email.Trim() != user.Email)
        {
            string cleanEmail = InputSanitizer.SanitizeEmail(request.Email.Trim());
            var existingUser = await _userRepository.GetByEmailAsync(cleanEmail);
            if (existingUser != null && existingUser.Id != user.Id)
                return (false, "Email is already taken by another account.");
            user.Email = cleanEmail;
        }

        if (request.FirstName != null) user.FirstName = InputSanitizer.SanitizeText(request.FirstName);
        if (request.MiddleName != null) user.MiddleName = InputSanitizer.SanitizeText(request.MiddleName);
        if (request.LastName != null) user.LastName = InputSanitizer.SanitizeText(request.LastName);
        
        string fullName = string.IsNullOrWhiteSpace(user.MiddleName)
            ? $"{user.FirstName} {user.LastName}".Trim()
            : $"{user.FirstName} {user.MiddleName} {user.LastName}".Trim();
        user.FullName = fullName;

        if (request.Username != null) user.Username = InputSanitizer.SanitizeText(request.Username);
        if (request.Department != null) user.Department = InputSanitizer.SanitizeText(request.Department);
        if (request.LibraryCardNumber != null) user.LibraryCardNumber = request.LibraryCardNumber.Trim();
        if (request.PhoneNumber != null) user.PhoneNumber = request.PhoneNumber.Trim();
        if (request.CurrentAddress != null) user.CurrentAddress = InputSanitizer.SanitizeText(request.CurrentAddress);
        if (request.PermanentAddress != null) user.PermanentAddress = InputSanitizer.SanitizeText(request.PermanentAddress);
        if (request.EmploymentStatus != null) user.EmploymentStatus = InputSanitizer.SanitizeText(request.EmploymentStatus);
        if (!string.IsNullOrWhiteSpace(request.ProfilePictureUrl)) user.ProfilePictureUrl = request.ProfilePictureUrl;
        if (request.Age != null) user.Age = request.Age.Trim();
        if (!string.IsNullOrWhiteSpace(request.Password)) user.PasswordHash = PasswordHelper.HashPassword(request.Password);

        user.Role = request.Role;
        user.IsActive = request.IsActive;
        await _userRepository.UpdateAsync(user);
        var saved = await _userRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to update user account.");
    }

    public async Task<(User? User, string? Error)> AdminCreateUserAsync(AdminCreateUserRequest request)
    {
        string cleanEmail = InputSanitizer.SanitizeEmail(request.Email);
        if (await _userRepository.GetByEmailAsync(cleanEmail) != null)
            return (null, "A user with this email address already exists.");

        string username = !string.IsNullOrWhiteSpace(request.Username)
            ? request.Username.Trim()
            : cleanEmail.Split('@')[0];

        if (await _userRepository.GetByUsernameAsync(username) != null)
            return (null, "A user with this username already exists.");

        string cardNo = !string.IsNullOrWhiteSpace(request.LibraryCardNumber)
            ? request.LibraryCardNumber.Trim()
            : $"KP-{DateTime.UtcNow:yyyy}-{Random.Shared.Next(10000, 99999)}";

        if (await _userRepository.GetByCardNumberAsync(cardNo) != null)
        {
            var prefix = request.Role == UserRole.Admin ? "KP-ADM" : request.Role == UserRole.Cashier ? "KP-CSH" : "KP-LIB";
            cardNo = $"{prefix}-{DateTime.UtcNow:yyyy}-{Random.Shared.Next(10000, 99999)}";
            while (await _userRepository.GetByCardNumberAsync(cardNo) != null)
            {
                cardNo = $"{prefix}-{DateTime.UtcNow:yyyy}-{Random.Shared.Next(10000, 99999)}";
            }
        }

        // A shared default password is a standing account-takeover risk: every account created
        // without an explicit password would ship with an identical, publicly known credential.
        // Require the caller to supply one, or generate an unguessable one and return it once.
        if (string.IsNullOrWhiteSpace(request.Password))
            return (null, "Password is required when creating an account. Supply an explicit password.");

        string password = request.Password;

        string fullName = string.IsNullOrWhiteSpace(request.MiddleName)
            ? $"{request.FirstName} {request.LastName}".Trim()
            : $"{request.FirstName} {request.MiddleName} {request.LastName}".Trim();

        var user = new User
        {
            FirstName = InputSanitizer.SanitizeText(request.FirstName),
            MiddleName = request.MiddleName != null ? InputSanitizer.SanitizeText(request.MiddleName) : null,
            LastName = InputSanitizer.SanitizeText(request.LastName),
            FullName = InputSanitizer.SanitizeText(fullName),
            Username = username,
            Email = cleanEmail,
            PasswordHash = PasswordHelper.HashPassword(password),
            Role = request.Role,
            EmploymentStatus = !string.IsNullOrWhiteSpace(request.EmploymentStatus) ? InputSanitizer.SanitizeText(request.EmploymentStatus) : (request.Role == UserRole.Customer ? "Student" : "Staff"),
            LibraryCardNumber = cardNo,
            Department = InputSanitizer.SanitizeText(request.Department ?? (request.Role == UserRole.Customer ? "General Academic" : "Circulation Desk")),
            PhoneNumber = request.PhoneNumber?.Trim(),
            CurrentAddress = request.CurrentAddress != null ? InputSanitizer.SanitizeText(request.CurrentAddress) : null,
            PermanentAddress = request.PermanentAddress != null ? InputSanitizer.SanitizeText(request.PermanentAddress) : (request.CurrentAddress != null ? InputSanitizer.SanitizeText(request.CurrentAddress) : null),
            ProfilePictureUrl = !string.IsNullOrWhiteSpace(request.ProfilePictureUrl) ? request.ProfilePictureUrl : null,
            Age = request.Age?.Trim(),
            IsActive = true
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();
        return (user, null);
    }

    public async Task<(bool Success, string? Error)> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword) =>
        await _userRepository.GetByIdAsync(userId) is not { } user
            ? (false, "User account not found.")
            : !PasswordHelper.VerifyPassword(currentPassword, user.PasswordHash)
                ? (false, "Current password is incorrect.")
                : await ExecutePasswordUpdateAsync(user, newPassword);

    private async Task<(bool Success, string? Error)> ExecutePasswordUpdateAsync(User user, string newPassword)
    {
        user.PasswordHash = PasswordHelper.HashPassword(newPassword);
        await _userRepository.UpdateAsync(user);
        var saved = await _userRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to persist new password.");
    }
}
