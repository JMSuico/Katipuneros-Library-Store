// [Layer: Api/Controllers]
// UsersController.cs -- REST API endpoints for user administration and patron lookup.
// Parses HTTP requests, calls IUserService, returns IActionResult.
// DO NOT put business logic. DO NOT use _context. DO NOT write EF Core queries.

using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data.Enums;
using Backend.Features.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Features.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService) =>
            _userService = userService;

        /// <summary> Retrieve all users with optional role filtering (Admin only) </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<object>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll([FromQuery] UserRole? role = null) =>
            Ok(ApiResponse<object>.Ok((await _userService.GetAllUsersAsync(role)).ConvertAll(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                Role = u.Role.ToString(),
                u.LibraryCardNumber,
                u.Department,
                u.PhoneNumber,
                u.IsActive,
                u.CreatedAt
            }), "Users list retrieved successfully."));

        /// <summary> Retrieve detailed patron or staff profile by ID </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Cashier")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(Guid id) =>
            await _userService.GetProfileAsync(id) is { } user
                ? Ok(ApiResponse<object>.Ok(new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    Role = user.Role.ToString(),
                    user.LibraryCardNumber,
                    user.Department,
                    user.PhoneNumber,
                    user.IsActive,
                    user.CreatedAt
                }, "User profile retrieved."))
                : NotFound(ApiResponse<object>.Fail("User account not found."));

        /// <summary> Update patron or staff role assignment (Admin only) </summary>
        [HttpPut("{id}/role")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateUserRoleRequest request) =>
            await _userService.UpdateUserRoleAsync(id, request.Role)
                ? Ok(ApiResponse<object>.Ok(new { UserId = id, NewRole = request.Role.ToString() }, "User role updated successfully."))
                : NotFound(ApiResponse<object>.Fail("User account not found."));

        /// <summary> Toggle user activation status (Admin only) </summary>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ToggleStatus(Guid id, [FromBody] ToggleUserStatusRequest request) =>
            await _userService.ToggleUserStatusAsync(id, request.IsActive)
                ? Ok(ApiResponse<object>.Ok(new { UserId = id, request.IsActive }, "User activation status updated."))
                : NotFound(ApiResponse<object>.Fail("User account not found."));

        /// <summary> Update the authenticated user's own profile </summary>
        [HttpPut("profile")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateOwnProfile([FromBody] UpdateProfileRequest request) =>
            !Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var currentUserId)
                ? Unauthorized(ApiResponse<object>.Fail("Invalid user identity token."))
                : await _userService.UpdateProfileAsync(currentUserId, request.FullName, request.Phone, request.Department) switch
                {
                    (true, _) => Ok(ApiResponse<object>.Ok(new { UserId = currentUserId }, "Profile updated successfully.")),
                    (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to update profile."))
                };
    }
}
