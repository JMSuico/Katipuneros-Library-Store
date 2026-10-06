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

        /// <summary> Retrieve all users with optional role filtering (Admin and Cashier read-only) </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Cashier")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<object>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll([FromQuery] UserRole? role = null) =>
            Ok(ApiResponse<object>.Ok((await _userService.GetAllUsersAsync(role)).ConvertAll(u => new
            {
                u.Id,
                u.FullName,
                u.FirstName,
                u.MiddleName,
                u.LastName,
                u.Username,
                u.Email,
                Role = u.Role.ToString(),
                u.LibraryCardNumber,
                u.Department,
                u.PhoneNumber,
                Address = u.CurrentAddress,
                u.Age,
                u.IsActive,
                u.IsProtected,
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
                    user.FirstName,
                    user.MiddleName,
                    user.LastName,
                    user.Username,
                    user.Email,
                    Role = user.Role.ToString(),
                    user.LibraryCardNumber,
                    user.Department,
                    user.PhoneNumber,
                    Address = user.CurrentAddress,
                    user.Age,
                    user.IsActive,
                    user.IsProtected,
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

        /// <summary> Create a Cashier account (Chief Admin only) </summary>
        [HttpPost("cashier")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateCashier([FromBody] CreateCashierByAdminRequest request) =>
            !ModelState.IsValid
                ? BadRequest(ApiResponse<object>.Fail("Invalid cashier creation payload."))
                : await _userService.CreateCashierByAdminAsync(request) switch
                {
                    (var cashier, null) when cashier != null => CreatedAtAction(nameof(GetById), new { id = cashier.Id }, ApiResponse<object>.Ok(new
                    {
                        cashier.Id,
                        cashier.FullName,
                        cashier.Email,
                        cashier.Username,
                        Role = cashier.Role.ToString(),
                        cashier.LibraryCardNumber,
                        cashier.Department
                    }, "Cashier circulation desk account created successfully.")),
                    (_, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to create cashier account."))
                };

        /// <summary> Create a patron or staff account (Admin only) </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateUser([FromBody] AdminCreateUserRequest request) =>
            !ModelState.IsValid
                ? BadRequest(ApiResponse<object>.Fail("Invalid user creation payload."))
                : await _userService.AdminCreateUserAsync(request) switch
                {
                    (var user, null) when user != null => CreatedAtAction(nameof(GetById), new { id = user.Id }, ApiResponse<object>.Ok(new
                    {
                        user.Id,
                        user.FullName,
                        user.FirstName,
                        user.MiddleName,
                        user.LastName,
                        user.Email,
                        user.Username,
                        Role = user.Role.ToString(),
                        user.LibraryCardNumber,
                        user.Department,
                        user.PhoneNumber,
                        Address = user.CurrentAddress,
                        user.Age,
                        user.IsActive,
                        user.CreatedAt
                    }, "User account created successfully.")),
                    (_, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to create user account."))
                };

        /// <summary> Admin update of patron/staff account information </summary>
        [HttpPut("{id}/admin-update")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AdminUpdateUser(Guid id, [FromBody] AdminUpdateUserRequest request) =>
            !ModelState.IsValid
                ? BadRequest(ApiResponse<object>.Fail("Invalid update payload."))
                : await _userService.AdminUpdateUserAsync(id, request) switch
                {
                    (true, _) => Ok(ApiResponse<object>.Ok(new { UserId = id }, "User account updated successfully.")),
                    (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to update user account."))
                };

        /// <summary> Delete a single patron/staff account (Admin only) </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteUser(Guid id) =>
            await _userService.DeleteUserAsync(id) switch
            {
                (true, _) => Ok(ApiResponse<object>.Ok(new { UserId = id }, "User account deleted successfully.")),
                (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to delete user."))
            };

        /// <summary> Bulk delete patron/staff accounts (Admin only) </summary>
        [HttpPost("bulk-delete")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> BulkDeleteUsers([FromBody] BulkDeleteUsersRequest request) =>
            await _userService.BulkDeleteUsersAsync(request.UserIds) switch
            {
                (var count, null) when count > 0 => Ok(ApiResponse<object>.Ok(new { DeletedCount = count }, $"{count} user accounts deleted successfully.")),
                (_, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to bulk delete user accounts."))
            };

        /// <summary> Export filtered user accounts as CSV (Admin only) </summary>
        [HttpGet("export")]
        [Authorize(Roles = "Admin")]
        [Produces("text/csv")]
        public async Task<IActionResult> ExportUsers(
            [FromQuery] string? startDate,
            [FromQuery] string? endDate,
            [FromQuery] string? nameStartsWith,
            [FromQuery] string? nameEndsWith,
            [FromQuery] string? nameContains,
            [FromQuery] string? idStartsWith,
            [FromQuery] string? idEndsWith,
            [FromQuery] string? idContains,
            [FromQuery] string? sortDirection)
        {
            var users = await _userService.GetAllUsersAsync();

            if (DateTime.TryParse(startDate, out var start))
                users = users.FindAll(u => u.CreatedAt >= start);

            if (DateTime.TryParse(endDate, out var end))
                users = users.FindAll(u => u.CreatedAt <= end.AddDays(1));

            if (!string.IsNullOrWhiteSpace(nameStartsWith))
                users = users.FindAll(u => u.FullName.StartsWith(nameStartsWith, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrWhiteSpace(nameEndsWith))
                users = users.FindAll(u => u.FullName.EndsWith(nameEndsWith, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrWhiteSpace(nameContains))
                users = users.FindAll(u => u.FullName.Contains(nameContains, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrWhiteSpace(idStartsWith))
                users = users.FindAll(u => (u.LibraryCardNumber ?? "").StartsWith(idStartsWith, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrWhiteSpace(idEndsWith))
                users = users.FindAll(u => (u.LibraryCardNumber ?? "").EndsWith(idEndsWith, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrWhiteSpace(idContains))
                users = users.FindAll(u => (u.LibraryCardNumber ?? "").Contains(idContains, StringComparison.OrdinalIgnoreCase));

            if (string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase))
                users.Reverse();

            var csvBuilder = new System.Text.StringBuilder();
            csvBuilder.AppendLine("User ID,Full Name,Email,Role,Department,Status,Created At");
            foreach (var u in users)
            {
                csvBuilder.AppendLine($"\"{u.LibraryCardNumber ?? u.Id.ToString()}\",\"{u.FullName}\",\"{u.Email}\",\"{u.Role}\",\"{u.Department ?? "N/A"}\",\"{(u.IsActive ? "Active" : "Suspended")}\",\"{u.CreatedAt:yyyy-MM-dd}\"");
            }

            var bytes = System.Text.Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"users_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv");
        }
    }
}
