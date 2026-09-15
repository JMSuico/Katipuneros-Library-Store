// [Layer: Features/Api/Controllers]
// BooksController.cs -- API endpoints for public catalog queries, search, and admin acquisitions.
// Parses requests, validates DTOs, calls IBookService, and returns IActionResult.
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
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;

    public BooksController(IBookService bookService) =>
        _bookService = bookService;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetBooks([FromQuery] Guid? categoryId, [FromQuery] string? query, [FromQuery] bool? spotlight) =>
        Ok(ApiResponse<object>.Ok(await _bookService.GetCatalogAsync(categoryId, query, spotlight)));

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBookById(Guid id) =>
        await _bookService.GetBookDetailsAsync(id) is { } book
            ? Ok(ApiResponse<object>.Ok(book))
            : NotFound(ApiResponse<object>.Fail("Book asset not found."));

    [HttpGet("barcode/{code}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBookByBarcode(string code) =>
        await _bookService.GetBookByBarcodeAsync(code) is { } book
            ? Ok(ApiResponse<object>.Ok(book))
            : NotFound(ApiResponse<object>.Fail($"No catalog asset matched barcode/RFID '{code}'."));

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateBook([FromBody] CreateBookRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid book creation payload."))
            : await _bookService.CreateBookAsync(
                request.Title,
                request.Author,
                request.Isbn,
                request.DeweyCode,
                request.CategoryId,
                request.PublishedYear,
                request.TotalCopies,
                request.BayLocation,
                request.Description,
                request.RfidTag
            ) is { } created
                ? CreatedAtAction(nameof(GetBookById), new { id = created.Id }, ApiResponse<object>.Ok(created, "Book accessioned into catalog."))
                : BadRequest(ApiResponse<object>.Fail("Failed to accession book."));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateBook(Guid id, [FromBody] UpdateBookRequest request) =>
        !ModelState.IsValid
            ? BadRequest(ApiResponse<object>.Fail("Invalid book update payload."))
            : await _bookService.UpdateBookAsync(
                id,
                request.Title,
                request.Author,
                request.Isbn,
                request.DeweyCode,
                request.CategoryId,
                request.PublishedYear,
                request.TotalCopies,
                request.BayLocation,
                request.Description,
                request.RfidTag
            ) switch
            {
                (true, _) => Ok(ApiResponse<object>.Ok(new { id }, "Catalog entry updated successfully.")),
                (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to update catalog entry."))
            };

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteBook(Guid id) =>
        await _bookService.DeleteBookAsync(id) switch
        {
            (true, _) => Ok(ApiResponse<object>.Ok(new { id }, "Book asset de-accessioned successfully.")),
            (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to delete book asset."))
        };
}
