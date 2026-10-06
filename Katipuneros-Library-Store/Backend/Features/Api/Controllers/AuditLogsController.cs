// [Layer: Backend/Features/Api/Controllers]
// AuditLogsController.cs -- REST API endpoints for immutable system audit logs and Merkle root verification.
// Strictly adheres to AGENTS.md, SKILL.md, and universal expression bodies (=>).

using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Features.Api.Controllers;

[ApiController]
[Route("api/admin/audit-logs")]
[Authorize(Roles = "Admin")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditService _auditService;

    public AuditLogsController(IAuditService auditService) =>
        _auditService = auditService;

    [HttpGet]
    public async Task<ActionResult<PagedAuditLogsResponseDto>> GetPagedLogs([FromQuery] AuditLogQueryRequest request) =>
        Ok(await _auditService.GetPagedAuditLogsAsync(request));

    [HttpGet("metrics")]
    public async Task<ActionResult<AuditMetricsResponseDto>> GetMetrics() =>
        Ok(await _auditService.GetMetricsAsync());

    [HttpGet("merkle-root")]
    public async Task<ActionResult<MerkleRootResponseDto>> GetMerkleRoot() =>
        Ok(await _auditService.GetMerkleRootAsync());

    [HttpPost("force-reindex")]
    public async Task<ActionResult<MerkleRootResponseDto>> ForceReindex() =>
        Ok(await _auditService.ForceReindexChainAsync());

    [HttpGet("verify-chain")]
    public async Task<ActionResult> VerifyChain() =>
        await _auditService.VerifyHashChainAsync() switch
        {
            var (isIntact, count, brokenId) => Ok(new
            {
                isIntact,
                verifiedCount = count,
                brokenEntryId = brokenId,
                message = isIntact ? "Cryptographic hash chain is 100% intact." : $"Integrity breach at ID: {brokenId}"
            })
        };

    [HttpGet("auth-monitor")]
    public async Task<ActionResult<List<UserLoginAuditDto>>> GetAuthMonitor() =>
        Ok(await _auditService.GetLoginAuditStreamAsync());

    [HttpPost("bulk-delete")]
    public async Task<ActionResult> BulkDelete([FromBody] BulkDeleteAuditLogsRequest request) =>
        await _auditService.BulkDeleteLogsAsync(request.Ids)
            ? Ok(new { message = "Selected audit records purged successfully." })
            : BadRequest(new { message = "Failed to purge audit records or no IDs provided." });
}
