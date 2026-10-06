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

    [HttpGet("metrics")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMetrics()
    {
        var (titles, copies, inCirc, disciplines) = await _bookService.GetCatalogMetricsAsync();
        return Ok(ApiResponse<object>.Ok(new
        {
            totalTitles = titles,
            physicalCopies = copies,
            inCirculation = inCirc,
            activeDisciplines = disciplines
        }, "Catalog metrics retrieved."));
    }

    [HttpPost("bulk-delete")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> BulkDeleteBooks([FromBody] BulkDeleteBooksRequest request) =>
        await _bookService.BulkDeleteBooksAsync(request.BookIds) switch
        {
            (var count, null) when count > 0 => Ok(ApiResponse<object>.Ok(new { deletedCount = count }, $"{count} books de-accessioned.")),
            (_, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to bulk delete books."))
        };

    [HttpPut("{id:guid}/archive")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleArchive(Guid id, [FromBody] ArchiveBookRequest request) =>
        await _bookService.ToggleArchiveAsync(id, request.IsArchived) switch
        {
            (true, _) => Ok(ApiResponse<object>.Ok(new { id, isArchived = request.IsArchived }, "Book archive status updated.")),
            (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to update archive status."))
        };

    [HttpPost("batch-isbn")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> BatchIngestIsbns([FromBody] BatchIsbnImportRequest request)
    {
        var (count, errors) = await _bookService.BatchIngestIsbnsAsync(request.Isbns, request.CategoryId);
        return Ok(ApiResponse<object>.Ok(new { ingestedCount = count, errors }, $"{count} books accessioned via Batch ISBN."));
    }

    [HttpGet("export")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ExportBooks(
        [FromQuery] string? startDate,
        [FromQuery] string? endDate,
        [FromQuery] string? titleStartsWith,
        [FromQuery] string? titleEndsWith,
        [FromQuery] string? titleContains,
        [FromQuery] string? idStartsWith,
        [FromQuery] string? idEndsWith,
        [FromQuery] string? idContains,
        [FromQuery] string? sortDirection,
        [FromQuery] string? format = "csv")
    {
        var books = await _bookService.GetCatalogAsync();

        if (DateTime.TryParse(startDate, out var start))
            books = books.FindAll(b => b.CreatedAt >= start);

        if (DateTime.TryParse(endDate, out var end))
            books = books.FindAll(b => b.CreatedAt <= end.AddDays(1));

        if (!string.IsNullOrWhiteSpace(titleStartsWith))
            books = books.FindAll(b => b.Title.StartsWith(titleStartsWith, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(titleEndsWith))
            books = books.FindAll(b => b.Title.EndsWith(titleEndsWith, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(titleContains))
            books = books.FindAll(b => b.Title.Contains(titleContains, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(idStartsWith))
            books = books.FindAll(b => b.Isbn.StartsWith(idStartsWith, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(idEndsWith))
            books = books.FindAll(b => b.Isbn.EndsWith(idEndsWith, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(idContains))
            books = books.FindAll(b => b.Isbn.Contains(idContains, StringComparison.OrdinalIgnoreCase));

        if (string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase))
            books.Reverse();

        // Standard CSV Export Format (RFC 4180 escaping, UTF-8 BOM so Excel renders symbols correctly).
        // Genuine .xlsx workbooks are generated client-side by Libs/spreadsheetExport.ts.
        Func<string?, string> esc = v => $"\"{(v ?? string.Empty).Replace("\"", "\"\"")}\"";
        var csvBuilder = new System.Text.StringBuilder();
        csvBuilder.AppendLine("ISBN,Title,Author,Category,Published Year,Total Copies,Available Copies,Bay Location,Created At");
        books.ForEach(b => csvBuilder.AppendLine(
            $"{esc(b.Isbn)},{esc(b.Title)},{esc(b.Author)},{esc(b.Category?.Name ?? "Uncategorized")},{b.PublishedYear},{b.TotalCopies},{b.AvailableCopies},{esc(b.BayLocation)},{esc(b.CreatedAt.ToString("yyyy-MM-dd"))}"));

        var bytes = System.Text.Encoding.UTF8.GetPreamble().Concat(System.Text.Encoding.UTF8.GetBytes(csvBuilder.ToString())).ToArray();
        return File(bytes, "text/csv", $"books_catalog_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv");
    }
}
