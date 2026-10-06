// [Layer: Features/Api/DTOs/Responses]
// AuthResponse.cs -- Response payload for authentication and identity verification.
// Data shaping for JSON serialization ONLY.
// DO NOT put business validation logic or database queries here.

namespace Backend.Features.Api.DTOs.Responses;

public class AuthResponse
{
    public bool Success { get; set; } = true;
    public string Token { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string? LastName { get; set; }
    public string? Username { get; set; }
    public string Email { get; set; } = string.Empty;
    public string LibraryCardNumber { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? EmploymentStatus { get; set; }
    public string? CurrentAddress { get; set; }
    public string? PermanentAddress { get; set; }
    public string? ProfilePictureUrl { get; set; }
}
