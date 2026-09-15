// [Layer: Features/Api/Controllers]
// CategoriesController.cs -- API endpoints for Dewey Decimal taxonomy and shelf bay coordinates.
// Parses requests, validates DTOs, calls ICategoryService, and returns IActionResult.
// DO NOT put business logic or direct database queries here.

using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService) =>
        _categoryService = categoryService;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll() =>
        Ok(ApiResponse<object>.Ok(await _categoryService.GetAllCategoriesAsync()));

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid category creation payload."))
            : Ok(ApiResponse<object>.Ok(await _categoryService.CreateCategoryAsync(request.DeweyRange, request.Name, request.ShelfBayLocation, request.Description), "Dewey classification range added."));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid category update payload."))
            : await _categoryService.UpdateCategoryAsync(id, request.DeweyRange, request.Name, request.ShelfBayLocation, request.Description) switch
            {
                (true, _) => Ok(ApiResponse<object>.Ok(new { id }, "Classification details updated.")),
                (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to update category."))
            };

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id) =>
        await _categoryService.DeleteCategoryAsync(id) switch
        {
            (true, _) => Ok(ApiResponse<object>.Ok(new { id }, "Category removed.")),
            (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to delete category."))
        };
}
