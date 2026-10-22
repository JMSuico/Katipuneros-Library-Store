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
    public async Task<IActionResult> GetPagedLogs([FromQuery] AuditLogQueryRequest request) =>
        Ok(ApiResponse<PagedAuditLogsResponseDto>.Ok(await _auditService.GetPagedAuditLogsAsync(request)));

    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics() =>
        Ok(ApiResponse<AuditMetricsResponseDto>.Ok(await _auditService.GetMetricsAsync()));

    [HttpGet("merkle-root")]
    public async Task<IActionResult> GetMerkleRoot() =>
        Ok(ApiResponse<MerkleRootResponseDto>.Ok(await _auditService.GetMerkleRootAsync()));

    [HttpPost("force-reindex")]
    public async Task<IActionResult> ForceReindex() =>
        Ok(ApiResponse<MerkleRootResponseDto>.Ok(await _auditService.ForceReindexChainAsync(), "Hash chain re-indexed successfully."));

    [HttpGet("verify-chain")]
    public async Task<IActionResult> VerifyChain() =>
        await _auditService.VerifyHashChainAsync() switch
        {
            var (isIntact, count, brokenId) => Ok(ApiResponse<object>.Ok(new
            {
                isIntact,
                verifiedCount = count,
                brokenEntryId = brokenId
            }, isIntact ? "Cryptographic hash chain is 100% intact." : $"Integrity breach at ID: {brokenId}"))
        };

    [HttpGet("auth-monitor")]
    public async Task<IActionResult> GetAuthMonitor() =>
        Ok(ApiResponse<List<UserLoginAuditDto>>.Ok(await _auditService.GetLoginAuditStreamAsync()));

    [HttpPost("bulk-delete")]
    public async Task<IActionResult> BulkDelete([FromBody] BulkDeleteAuditLogsRequest request) =>
        await _auditService.BulkDeleteLogsAsync(request.Ids)
            ? Ok(ApiResponse<object>.Ok(new { count = request.Ids.Count }, "Selected audit records purged successfully."))
            : BadRequest(ApiResponse<object>.Fail("Failed to purge audit records or no IDs provided."));
}
