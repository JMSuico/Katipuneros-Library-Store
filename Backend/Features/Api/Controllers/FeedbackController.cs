// [Layer: Api/Controllers]
// FeedbackController.cs -- REST API endpoints for patron ratings and visitor testimonials.
// Parses HTTP requests, calls IContactService, returns IActionResult.
// DO NOT put business logic. DO NOT use _context. DO NOT write EF Core queries.

using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data.Enums;
using Backend.Features.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Features.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly IContactService _contactService;

        public FeedbackController(IContactService contactService) =>
            _contactService = contactService;

        /// <summary> Submit visitor or patron library experience rating </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Submit([FromBody] FeedbackSubmissionRequest request) =>
            await _contactService.SubmitFeedbackAsync(
                Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var parsedId) ? parsedId : null,
                (FeedbackRating)request.Rating,
                request.Comments
            ) switch
            {
                (true, _) => Ok(ApiResponse<object>.Ok(null!, "Thank you for rating your Katipuneros Library experience.")),
                (false, var error) => BadRequest(ApiResponse<object>.Fail(error ?? "Failed to record feedback."))
            };

        /// <summary> Retrieve approved public patron feedback and testimonials </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll() =>
            Ok(ApiResponse<object>.Ok(await _contactService.GetFeedbacksAsync(), "Feedback list retrieved successfully."));
    }
}
