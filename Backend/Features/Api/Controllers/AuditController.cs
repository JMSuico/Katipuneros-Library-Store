// [Layer: Api/Controllers]
// AuditController.cs -- REST API endpoints for cryptographic audit inspection.
// Parses HTTP requests, calls IAuditService, returns IActionResult.
// DO NOT put business logic. DO NOT use _context. DO NOT write EF Core queries.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Features.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AuditController : ControllerBase
    {
        private readonly IAuditService _auditService;

        public AuditController(IAuditService auditService) =>
            _auditService = auditService;

        /// <summary> Retrieve cryptographic audit log trail with optional severity filtering (Admin only) </summary>
        [HttpGet("logs")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<object>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetLogs([FromQuery] string? severity = null, [FromQuery] int limit = 100) =>
            Ok(ApiResponse<object>.Ok((await _auditService.GetAuditTrailAsync(severity, limit)).ConvertAll(l => new
            {
                l.Id,
                l.UserId,
                l.Action,
                l.TargetEntity,
                l.RecordRef,
                l.DeltaModification,
                l.IpAddress,
                l.Severity,
                l.Timestamp,
                l.PreviousHash,
                l.CurrentHash
            }), "Audit log trail retrieved successfully."));

        /// <summary> Cryptographically verify the SHA-256 hash-chain integrity of all audit records (Admin only) </summary>
        [HttpGet("verify-chain")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> VerifyChain() =>
            await _auditService.VerifyHashChainAsync() switch
            {
                var (isIntact, verifiedCount, brokenEntryId) => Ok(ApiResponse<object>.Ok(new
                {
                    IsIntact = isIntact,
                    VerifiedCount = verifiedCount,
                    BrokenEntryId = brokenEntryId,
                    StatusMessage = isIntact
                        ? "Cryptographic hash chain is 100% intact and tamper-evident."
                        : $"Hash chain breach detected at audit entry ID: {brokenEntryId}."
                }, isIntact ? "Integrity verified." : "Integrity breach detected!"))
            };
    }
}
