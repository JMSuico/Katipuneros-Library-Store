// [Layer: Api/Controllers]
// PersonnelController.cs -- REST API endpoints for library personnel and staff CMS.
// Parses HTTP requests, calls IPersonnelService, returns IActionResult.
// DO NOT put business logic. DO NOT use _context. DO NOT write EF Core queries.

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data.Models;
using Backend.Features.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Features.Api.Controllers;

public class CreatePersonnelRequest
{
    [Required]
    [MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Position { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Department { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public int DisplayOrder { get; set; } = 1;
}

public class UpdatePersonnelRequest : CreatePersonnelRequest
{
    public bool IsActive { get; set; } = true;
}

[ApiController]
[Route("api/[controller]")]
public class PersonnelController : ControllerBase
{
    private readonly IPersonnelService _personnelService;

    public PersonnelController(IPersonnelService personnelService) =>
        _personnelService = personnelService;

    /// <summary> Retrieve all library personnel (Public) </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<Personnel>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] bool? isActive = null) =>
        Ok(ApiResponse<object>.Ok(await _personnelService.GetAllPersonnelAsync(isActive)));

    /// <summary> Retrieve personnel by ID (Public) </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Personnel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id) =>
        await _personnelService.GetPersonnelByIdAsync(id) is { } staff
            ? Ok(ApiResponse<object>.Ok(staff))
            : NotFound(ApiResponse<object>.Fail("Staff record not found."));

    /// <summary> Add new library staff profile (Admin only) </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<Personnel>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreatePersonnelRequest request) =>
        await _personnelService.CreatePersonnelAsync(
            request.FullName,
            request.Position,
            request.Department,
            request.ImageUrl,
            request.DisplayOrder
        ) is { } staff
            ? CreatedAtAction(nameof(GetById), new { id = staff.Id }, ApiResponse<object>.Ok(staff, "Staff profile created."))
            : BadRequest(ApiResponse<object>.Fail("Failed to create staff profile."));

    /// <summary> Update staff profile (Admin only) </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePersonnelRequest request) =>
        await _personnelService.UpdatePersonnelAsync(
            id,
            request.FullName,
            request.Position,
            request.Department,
            request.ImageUrl,
            request.DisplayOrder,
            request.IsActive
        ) switch
        {
            (true, _) => Ok(ApiResponse<object>.Ok(new { id }, "Staff profile updated successfully.")),
            (false, var err) => BadRequest(ApiResponse<object>.Fail(err ?? "Update failed."))
        };

    /// <summary> Delete staff profile (Admin only) </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Delete(Guid id) =>
        await _personnelService.DeletePersonnelAsync(id) switch
        {
            (true, _) => Ok(ApiResponse<object>.Ok(new { id }, "Staff profile deleted successfully.")),
            (false, var err) => BadRequest(ApiResponse<object>.Fail(err ?? "Deletion failed."))
        };
}
