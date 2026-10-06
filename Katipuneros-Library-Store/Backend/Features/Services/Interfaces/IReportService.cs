// [Layer: Features/Services/Interfaces]
// IReportService.cs -- Domain contract for statutory reporting, official dossiers compilation, cryptographic attestation ledger, and schedule automation.
// DO NOT put HTTP parsing or DB queries here.

using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;

namespace Backend.Features.Services.Interfaces;

public interface IReportService
{
    Task<List<ReportSuiteResponse>> GetReportSuitesAsync();
    Task<ReportSuiteResponse> CreateReportSuiteAsync(CreateReportSuiteRequest req);
    Task<ReportSuiteResponse?> UpdateReportSuiteAsync(string id, CreateReportSuiteRequest req);
    Task<bool> DeleteReportSuiteAsync(string id);
    Task<ReportPagedResult<CompletedDossierResponse>> GetCompletedDossiersAsync(ReportFilterRequest req);
    Task<DisciplinaryShareResponse> GetDisciplinaryShareAsync();
    Task<AuditStatsResponse> GetAuditStatsAsync();
    Task<List<AuditAttestationResponse>> GetAuditAttestationsAsync();
    Task<List<ScheduleTriggerResponse>> GetScheduleTriggersAsync();
    Task<CompletedDossierResponse> GenerateDossierAsync(GenerateReportRequest req);
    Task<VerifySealResponse> VerifySealAsync(VerifySealRequest req);
    Task<bool> ExecuteBulkActionAsync(ReportBulkActionRequest req);
    Task<bool> RunScheduleNowAsync(string scheduleId);
}
