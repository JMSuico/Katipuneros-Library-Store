// [Layer: Features/Api/DTOs/Responses]
// ReportResponses.cs -- Data contract responses for administrative reports, statutory dossiers, audit attestation ledger, and recurring schedule triggers.
// DO NOT put business logic or database queries here.

using System;
using System.Collections.Generic;

namespace Backend.Features.Api.DTOs.Responses;

public class ReportSuiteResponse
{
    public string Id { get; set; } = string.Empty;
    public string SuiteCode { get; set; } = string.Empty; // "SUITE-01"
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Standard { get; set; } = string.Empty;
    public string ScopeLabel { get; set; } = string.Empty;
    public string ScopeValue { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public List<string> SupportedFormats { get; set; } = new() { "PDF", "CSV", "XLSX" };
}

public class CompletedDossierResponse
{
    public string Id { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty; // "CIR-2025-M03-Aggregate.pdf"
    public string Title { get; set; } = string.Empty;
    public DateTime ExecutionTimestamp { get; set; }
    public string TimestampFormatted { get; set; } = string.Empty;
    public string CertifiedGenerator { get; set; } = string.Empty;
    public string CertifiedGeneratorRole { get; set; } = string.Empty;
    public string CertifiedGeneratorAvatar { get; set; } = string.Empty;
    public long PayloadSizeBytes { get; set; }
    public string PayloadSizeFormatted { get; set; } = string.Empty;
    public string VerificationStatus { get; set; } = "Certified Official";
    public string Sha256Digest { get; set; } = string.Empty;
    public string ExportFormat { get; set; } = "PDF";
}

public class DisciplinaryShareResponse
{
    public string Term { get; set; } = "Q1 2026";
    public double StemPercent { get; set; } = 44.0;
    public double HumssPercent { get; set; } = 26.0;
    public double HealthPercent { get; set; } = 18.0;
    public double LawBusPercent { get; set; } = 12.0;
    public double TargetEquilibriumIndex { get; set; } = 1.15;
    public string PedagogicalThesisSummary { get; set; } = "Curriculum Disciplinary Share balances STEM literature turnover against foundational humanities research.";
}

public class AuditStatsResponse
{
    public string ChainState { get; set; } = "Verified Intact";
    public int TamperViolationsCount { get; set; }
    public string StandardSeal { get; set; } = "ISO 2789:2018";
    public string ComplianceLevel { get; set; } = "Statutory Compliance Level IV";
    public int ActiveAuditorSignaturesCount { get; set; } = 4;
    public string SigningPolicy { get; set; } = "Dual Key Multi-sign Required";
}

public class AuditAttestationResponse
{
    public string Id { get; set; } = string.Empty;
    public string LedgerEvent { get; set; } = string.Empty;
    public string TargetDossier { get; set; } = string.Empty;
    public string Sha256DigestSignature { get; set; } = string.Empty;
    public string CertifiedSignerName { get; set; } = string.Empty;
    public string CertifiedSignerRole { get; set; } = string.Empty;
    public string CertifiedSignerInitials { get; set; } = string.Empty;
    public string TimestampUtc8 { get; set; } = string.Empty;
    public string AttestationStatus { get; set; } = "Certified Intact";
}

public class ScheduleTriggerResponse
{
    public string Id { get; set; } = string.Empty;
    public string CronExpression { get; set; } = string.Empty; // "0 5 * * *"
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public string Recipients { get; set; } = string.Empty;
    public string NextRunFormatted { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class VerifySealResponse
{
    public bool IsValid { get; set; }
    public string MatchedDigest { get; set; } = string.Empty;
    public string SignerName { get; set; } = string.Empty;
    public string SignerRole { get; set; } = string.Empty;
    public DateTime AttestationTimestamp { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class ReportPagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
}
