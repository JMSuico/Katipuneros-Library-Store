// [Layer: Features/Api/DTOs/Requests]
// AuthRequests.cs -- Request DTOs for authentication, registration, and patron profile updates.
// Data shaping and DataAnnotations attributes ONLY.
// DO NOT put business validation logic or database queries here.

using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Api.DTOs.Requests;

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    [Required]
    [MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    public string? LibraryCardNumber { get; set; }

    public string? Department { get; set; }

    public string? PhoneNumber { get; set; }
}

public class UpdateProfileRequest
{
    [Required]
    [MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string? Phone => PhoneNumber;

    public string? Department { get; set; }
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
