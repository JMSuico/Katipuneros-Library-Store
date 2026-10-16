// [Layer: Features/Api/Controllers]
// BookCopiesController.cs -- API endpoints for physical book volume tracking, QR codes, and scanner resolution.
// Parses requests, validates DTOs, calls IBookCopyService, and returns IActionResult.
// DO NOT put business logic or direct database queries here.

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Api.Controllers;

[ApiController]
[Route("api")]
public class BookCopiesController : ControllerBase
{
    private readonly IBookCopyService _bookCopyService;

    public BookCopiesController(IBookCopyService bookCopyService) =>
        _bookCopyService = bookCopyService;

    [HttpGet("books/{bookId:guid}/copies")]
    [Authorize]
    public async Task<IActionResult> GetBookCopies(Guid bookId) =>
        Ok(ApiResponse<List<BookCopyDto>>.Ok(
            await _bookCopyService.GetCopiesByBookIdAsync(bookId),
            "Physical volume inventory retrieved successfully."));

    [HttpGet("copies/{copyId:guid}")]
    [Authorize]
    public async Task<IActionResult> GetCopyById(Guid copyId) =>
        await _bookCopyService.GetCopyByIdAsync(copyId) is { } copy
            ? Ok(ApiResponse<BookCopyDto>.Ok(copy))
            : NotFound(ApiResponse<object>.Fail("Physical book copy not found."));

    [HttpPost("books/{bookId:guid}/copies")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateCopy(Guid bookId, [FromBody] CreateBookCopyRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid copy creation payload."))
            : await _bookCopyService.CreateCopyAsync(bookId, request) switch
            {
                (true, var copy, _) => Ok(ApiResponse<BookCopyDto>.Ok(copy!, "Physical book copy generated with unique Accession Number and QR code.")),
                (false, _, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to create physical copy."))
            };

    [HttpPut("copies/{copyId:guid}")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> UpdateCopy(Guid copyId, [FromBody] UpdateBookCopyRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid copy update payload."))
            : await _bookCopyService.UpdateCopyAsync(copyId, request) switch
            {
                (true, var copy, _) => Ok(ApiResponse<BookCopyDto>.Ok(copy!, "Physical copy details updated successfully.")),
                (false, _, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to update physical copy."))
            };

    [HttpDelete("copies/{copyId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCopy(Guid copyId) =>
        await _bookCopyService.DeleteCopyAsync(copyId) switch
        {
            (true, _) => Ok(ApiResponse<object>.Ok(new { }, "Physical book copy removed from active inventory.")),
            (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to delete physical copy."))
        };

    [HttpGet("copies/scan")]
    [Authorize(Roles = "Cashier,Admin")]
    public async Task<IActionResult> ScanCopy([FromQuery] string code) =>
        string.IsNullOrWhiteSpace(code)
            ? BadRequest(ApiResponse<object>.Fail("Scanned QR payload or Accession Number code is required."))
            : await _bookCopyService.ResolveScanAsync(code) switch
            {
                (true, var result, _) => Ok(ApiResponse<BookCopyScanResultDto>.Ok(result!, "Physical book volume verified and matched successfully.")),
                (false, _, var error) => NotFound(ApiResponse<object>.Fail(error ?? "Scanned code could not be resolved in library system."))
            };

    [HttpPost("copies/sync-all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SyncAllCopies() =>
        Ok(ApiResponse<object>.Ok(new
        {
            SeededCopies = await _bookCopyService.SyncAllBookCopiesAsync()
        }, "Physical copy ledger synchronized with catalog inventory."));
}
