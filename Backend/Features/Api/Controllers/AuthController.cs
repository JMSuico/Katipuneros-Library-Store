// [Layer: Features/Api/Controllers]
// AuthController.cs -- API endpoints for patron and personnel authentication and profile management.
// Parses requests, validates DTOs, calls IUserService, and returns IActionResult.
// DO NOT put business logic or direct database queries here.

using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;

    public AuthController(IUserService userService) =>
        _userService = userService;

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid login payload."))
            : await _userService.AuthenticateAsync(request.Email, request.Password) switch
            {
                (var user, var token, null) when user != null && token != null => Ok(ApiResponse<AuthResponse>.Ok(new AuthResponse
                {
                    Success = true,
                    Token = token,
                    Role = user.Role.ToString(),
                    UserId = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    LibraryCardNumber = user.LibraryCardNumber
                }, "Login successful.")),
                (_, _, var error) => Unauthorized(ApiResponse<object>.Fail(error ?? "Authentication failed."))
            };

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid registration payload."))
            : await _userService.RegisterAsync(
                request.FullName,
                request.Email,
                request.Password,
                request.LibraryCardNumber,
                request.Department,
                request.PhoneNumber
            ) switch
            {
                (var user, var token, null) when user != null && token != null => CreatedAtAction(nameof(GetProfile), ApiResponse<AuthResponse>.Ok(new AuthResponse
                {
                    Success = true,
                    Token = token,
                    Role = user.Role.ToString(),
                    UserId = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    LibraryCardNumber = user.LibraryCardNumber
                }, "Patron account registered successfully.")),
                (_, _, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Registration failed."))
            };

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetProfile() =>
        !Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId)
            ? Unauthorized(ApiResponse<object>.Fail("Invalid patron identity token."))
            : await _userService.GetProfileAsync(userId) is { } profile
                ? Ok(ApiResponse<object>.Ok(new
                {
                    profile.Id,
                    profile.FullName,
                    profile.Email,
                    Role = profile.Role.ToString(),
                    profile.LibraryCardNumber,
                    profile.Department,
                    profile.PhoneNumber,
                    profile.IsActive,
                    profile.CreatedAt,
                    profile.LastLoginAt
                }))
                : NotFound(ApiResponse<object>.Fail("User profile not found."));

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid profile update payload."))
            : !Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId)
                ? Unauthorized(ApiResponse<object>.Fail("Invalid patron identity token."))
                : await _userService.UpdateProfileAsync(userId, request.FullName, request.PhoneNumber, request.Department) switch
                {
                    (true, _) => Ok(ApiResponse<object>.Ok(new { request.FullName, request.PhoneNumber, request.Department }, "Profile updated successfully.")),
                    (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to update profile."))
                };
}
