// [Layer: Api/Controllers]
// ContactController.cs -- REST API endpoints for public contact form and inquiry management.
// Parses HTTP requests, calls IContactService, returns IActionResult.
// DO NOT put business logic. DO NOT use _context. DO NOT write EF Core queries.

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
    public class ContactController : ControllerBase
    {
        private readonly IContactService _contactService;

        public ContactController(IContactService contactService) =>
            _contactService = contactService;

        /// <summary> Public contact form submission (Sanitized through InputSanitizer) </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Submit([FromBody] ContactSubmissionRequest request) =>
            await _contactService.SubmitContactMessageAsync(request.Name, request.Email, request.Subject, request.Message) switch
            {
                (true, _) => Ok(ApiResponse<object>.Ok(null!, "Thank you. Your inquiry has been received by the Katipuneros Library.")),
                (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to submit inquiry."))
            };

        /// <summary> Retrieve all submitted contact inquiries (Admin only) </summary>
        [HttpGet("inquiries")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetInquiries([FromQuery] InquiryStatus? status = null) =>
            Ok(ApiResponse<object>.Ok(await _contactService.GetInquiriesAsync(status), "Inquiries retrieved successfully."));
    }
}
