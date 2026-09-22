// [Layer: Features/Api/DTOs/Requests]
// AuthRequests.cs -- Request DTOs for authentication, registration, and patron profile updates.
// Data shaping and DataAnnotations attributes ONLY.
// DO NOT put business validation logic or database queries here.

using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Api.DTOs.Requests;

public class LoginRequest
{
    public string? Email { get; set; }

    public string? Username { get; set; }

    public string? UsernameOrEmail { get; set; }

    [Required]
    public string Password { get; set; } = string.Empty;

    public string GetIdentifier() =>
        !string.IsNullOrWhiteSpace(UsernameOrEmail) ? UsernameOrEmail.Trim()
        : !string.IsNullOrWhiteSpace(Email) ? Email.Trim()
        : !string.IsNullOrWhiteSpace(Username) ? Username.Trim()
        : string.Empty;
}

public class RegisterRequest
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? MiddleName { get; set; }

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? FullName { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string EmploymentStatus { get; set; } = "Student";

    [Required]
    [MaxLength(300)]
    public string CurrentAddress { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string PermanentAddress { get; set; } = string.Empty;

    public string? LibraryCardNumber { get; set; }

    public string? Department { get; set; }

    public string? PhoneNumber { get; set; }
}

public class UpdateProfileRequest
{
    [MaxLength(100)]
    public string? FirstName { get; set; }

    [MaxLength(100)]
    public string? MiddleName { get; set; }

    [MaxLength(100)]
    public string? LastName { get; set; }

    [MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? EmploymentStatus { get; set; }

    [MaxLength(300)]
    public string? CurrentAddress { get; set; }

    [MaxLength(300)]
    public string? PermanentAddress { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Phone => PhoneNumber;

    public string? Department { get; set; }
}

public class UpdateProfilePictureRequest
{
    [Required]
    public string PictureData { get; set; } = string.Empty;
}

public class CreateCashierByAdminRequest
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? MiddleName { get; set; }

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    public string? Department { get; set; } = "Circulation & Stacks Terminal";

    public string? PhoneNumber { get; set; }

    public string? LibraryCardNumber { get; set; }
}

public class UpdateUserRoleRequest
{
    [Required]
    public Backend.Features.Data.Enums.UserRole Role { get; set; }
}

public class ToggleUserStatusRequest
{
    [Required]
    public bool IsActive { get; set; }
}
