// [Layer: Api/Controllers]
// HealthController.cs -- REST API endpoints for system diagnostics and database health.
// Parses HTTP requests, calls ISystemHealthService, returns IActionResult.
// DO NOT put business logic. DO NOT use _context. DO NOT write EF Core queries.

using System;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Features.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly ISystemHealthService _healthService;

        public HealthController(ISystemHealthService healthService) =>
            _healthService = healthService;

        /// <summary> System health check verifying API operational state, memory footprint, and database connectivity </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status503ServiceUnavailable)]
        public async Task<IActionResult> GetHealth() =>
            await _healthService.CheckSystemHealthAsync() switch
            {
                var (isHealthy, dbReachable, message, memoryMb) => isHealthy
                    ? Ok(ApiResponse<object>.Ok(new
                    {
                        Status = "Healthy",
                        DatabaseConnected = dbReachable,
                        MemoryUsageMb = memoryMb,
                        Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development",
                        Framework = ".NET 10.0",
                        Timestamp = DateTime.UtcNow,
                        Message = message
                    }, message))
                    : StatusCode(StatusCodes.Status503ServiceUnavailable, ApiResponse<object>.Fail("System degraded.", new[] { message }))
            };
    }
}
