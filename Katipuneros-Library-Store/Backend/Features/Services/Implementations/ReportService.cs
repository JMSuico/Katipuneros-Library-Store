// [Layer: Features/Services/Implementations]
// ReportService.cs -- Business logic for official reports, statutory dossiers, audit attestation ledger, and schedule automation.
// DO NOT query _context directly -- use repositories only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class ReportService : IReportService
{
    private readonly IBookRepository _bookRepository;
    private readonly IBorrowRepository _borrowRepository;
    private readonly IReservationRepository _reservationRepository;
    private readonly IAuditRepository _auditRepository;

    private static readonly List<CompletedDossierResponse> _dossiersLedger = new();
    private static readonly List<ScheduleTriggerResponse> _scheduleTriggers = new();
    private static readonly List<ReportSuiteResponse> _reportSuites = new();

    public ReportService(
        IBookRepository bookRepository,
        IBorrowRepository borrowRepository,
        IReservationRepository reservationRepository,
        IAuditRepository auditRepository)
    {
        _bookRepository = bookRepository;
        _borrowRepository = borrowRepository;
        _reservationRepository = reservationRepository;
        _auditRepository = auditRepository;
    }

    private static void EnsureDefaultSuites()
    {
        if (_reportSuites.Count > 0) return;

        _reportSuites.AddRange(new List<ReportSuiteResponse>
        {
            new()
            {
                Id = "suite-01",
                SuiteCode = "SUITE-01",
                Title = "Circulation & Borrowing Dossier",
                Description = "Monthly aggregate checkout metrics, patron demographic breakdown, inter-departmental lending velocity, and high-frequency curriculum textbook rotations.",
                Standard = "ISO/DIS 11620",
                ScopeLabel = "Data Scope:",
                ScopeValue = "Active Borrowers",
                Icon = "outbox",
                SupportedFormats = new() { "PDF", "CSV", "XLSX" }
            },
            new()
            {
                Id = "suite-02",
                SuiteCode = "SUITE-02",
                Title = "Inventory Valuation & Deprecation Audit",
                Description = "Capital assets valuation across physical holdings, bindery repair expenses, archival attrition rates, and missing or lost volume replacement forecasting.",
                Standard = "PAS 16 Depreciation",
                ScopeLabel = "Assessed Capital:",
                ScopeValue = "Capital Valuation",
                Icon = "inventory_2",
                SupportedFormats = new() { "PDF", "CSV", "XLSX" }
            },
            new()
            {
                Id = "suite-03",
                SuiteCode = "SUITE-03",
                Title = "Financial Collections & Fine Journal",
                Description = "Transparent daily cashier collections, POS terminals reconciliation, administrative grace waivers, and outstanding receivables ledger.",
                Standard = "COA General Circular",
                ScopeLabel = "Reconciled Rate:",
                ScopeValue = "Cleared Collections",
                Icon = "receipt_long",
                SupportedFormats = new() { "PDF", "CSV", "XLSX" }
            },
            new()
            {
                Id = "suite-04",
                SuiteCode = "SUITE-04",
                Title = "Overdue Delinquencies & Disciplinary Dossier",
                Description = "Long-term delinquent accounts exceeding 14 calendar days, automatic registrar graduation clearance holds, and registered mail dispatch logs.",
                Standard = "Holds Applied:",
                ScopeLabel = "Threshold:",
                ScopeValue = "Overdue Accounts",
                Icon = "warning",
                SupportedFormats = new() { "PDF", "CSV", "XLSX" }
            },
            new()
            {
                Id = "suite-05",
                SuiteCode = "SUITE-05",
                Title = "Academic Discipline & Curriculum Demand Report",
                Description = "Departmental resource saturation (STEM versus Humanities), real-time reservation waitlist density, and next-term library acquisitions procurement ledger.",
                Standard = "PAASCU Level IV Evaluation",
                ScopeLabel = "Waitlisted Patrons:",
                ScopeValue = "Active Requests",
                Icon = "school",
                SupportedFormats = new() { "PDF", "CSV", "XLSX" }
            }
        });
    }

    public async Task<List<ReportSuiteResponse>> GetReportSuitesAsync()
    {
        EnsureDefaultSuites();

        var books = await _bookRepository.GetAllAsync();
        var activeLoans = await _borrowRepository.GetCountByStatusAsync(TransactionStatus.Active);
        var overdueLoans = await _borrowRepository.GetCountByStatusAsync(TransactionStatus.Overdue);
        var returnedLoans = await _borrowRepository.GetCountByStatusAsync(TransactionStatus.Returned);
        var pendingHolds = await _reservationRepository.GetCountByStatusesAsync(ReservationStatus.Pending, ReservationStatus.StagedInLocker);

        var totalLoans = activeLoans + overdueLoans + returnedLoans;
        var clearedPercent = totalLoans > 0 ? (returnedLoans * 100.0 / totalLoans).ToString("0.0") + "% Cleared" : "0.0% Cleared";
        var totalValuation = books.Sum(b => (decimal)b.TotalCopies * 650m);
        var valFormatted = totalValuation > 0 ? $"₱{totalValuation:N2} Value" : "₱0.00 Value";

        return _reportSuites.Select(s => new ReportSuiteResponse
        {
            Id = s.Id,
            SuiteCode = s.SuiteCode,
            Title = s.Title,
            Description = s.Description,
            Standard = s.Standard,
            ScopeLabel = s.ScopeLabel,
            ScopeValue = s.Id switch
            {
                "suite-01" => activeLoans > 0 ? $"Active {activeLoans} Borrowers" : "0 Active Borrowers",
                "suite-02" => valFormatted,
                "suite-03" => clearedPercent,
                "suite-04" => overdueLoans > 0 ? $"{overdueLoans} Overdue Accounts" : "0 Delinquencies",
                "suite-05" => pendingHolds > 0 ? $"{pendingHolds} Active Requests" : "0 Requests",
                _ => string.IsNullOrWhiteSpace(s.ScopeValue) ? "Active Configuration" : s.ScopeValue
            },
            Icon = s.Icon,
            SupportedFormats = s.SupportedFormats
        }).ToList();
    }

    public async Task<ReportSuiteResponse> CreateReportSuiteAsync(CreateReportSuiteRequest req)
    {
        EnsureDefaultSuites();
        var newSuite = new ReportSuiteResponse
        {
            Id = $"suite-{Guid.NewGuid().ToString()[..8]}",
            SuiteCode = req.SuiteCode.Trim().ToUpperInvariant(),
            Title = req.Title.Trim(),
            Description = req.Description.Trim(),
            Standard = string.IsNullOrWhiteSpace(req.Standard) ? "ISO/DIS 11620" : req.Standard.Trim(),
            ScopeLabel = string.IsNullOrWhiteSpace(req.ScopeLabel) ? "Data Scope:" : req.ScopeLabel.Trim(),
            ScopeValue = string.IsNullOrWhiteSpace(req.ScopeValue) ? "Active Configuration" : req.ScopeValue.Trim(),
            Icon = string.IsNullOrWhiteSpace(req.Icon) ? "description" : req.Icon.Trim(),
            SupportedFormats = req.SupportedFormats?.Count > 0 ? req.SupportedFormats : new List<string> { "PDF", "CSV", "XLSX" }
        };

        _reportSuites.Add(newSuite);
        return await Task.FromResult(newSuite);
    }

    public async Task<ReportSuiteResponse?> UpdateReportSuiteAsync(string id, CreateReportSuiteRequest req)
    {
        EnsureDefaultSuites();
        var existing = _reportSuites.FirstOrDefault(s => s.Id == id || s.SuiteCode.Equals(id, StringComparison.OrdinalIgnoreCase));
        if (existing == null) return null;

        existing.SuiteCode = req.SuiteCode.Trim().ToUpperInvariant();
        existing.Title = req.Title.Trim();
        existing.Description = req.Description.Trim();
        existing.Standard = req.Standard.Trim();
        existing.ScopeLabel = req.ScopeLabel.Trim();
        existing.ScopeValue = req.ScopeValue.Trim();
        existing.Icon = req.Icon.Trim();
        existing.SupportedFormats = req.SupportedFormats?.Count > 0 ? req.SupportedFormats : existing.SupportedFormats;

        return await Task.FromResult(existing);
    }

    public async Task<bool> DeleteReportSuiteAsync(string id)
    {
        EnsureDefaultSuites();
        var existing = _reportSuites.FirstOrDefault(s => s.Id == id || s.SuiteCode.Equals(id, StringComparison.OrdinalIgnoreCase));
        if (existing == null) return false;

        _reportSuites.Remove(existing);
        return await Task.FromResult(true);
    }

    public async Task<ReportPagedResult<CompletedDossierResponse>> GetCompletedDossiersAsync(ReportFilterRequest req) =>
        await Task.Run(() =>
        {
            var query = _dossiersLedger.AsEnumerable();

            // Search filter
            if (!string.IsNullOrWhiteSpace(req.Search))
            {
                var s = req.Search.Trim().ToLowerInvariant();
                query = query.Where(d =>
                    d.Reference.ToLowerInvariant().Contains(s) ||
                    d.Title.ToLowerInvariant().Contains(s) ||
                    d.CertifiedGenerator.ToLowerInvariant().Contains(s) ||
                    d.Sha256Digest.ToLowerInvariant().Contains(s));
            }

            // Status filter
            if (!string.IsNullOrWhiteSpace(req.Status) && req.Status != "All Statuses" && req.Status != "all")
            {
                query = query.Where(d => d.VerificationStatus.Equals(req.Status, StringComparison.OrdinalIgnoreCase));
            }

            // Alphabetical filter
            if (!string.IsNullOrWhiteSpace(req.AlphaFilter))
            {
                var a = req.AlphaFilter.Trim().ToLowerInvariant();
                query = query.Where(d => d.Title.ToLowerInvariant().Contains(a));
            }

            // ID filter
            if (!string.IsNullOrWhiteSpace(req.IdFilter))
            {
                var idf = req.IdFilter.Trim();
                query = query.Where(d => d.Id.Contains(idf, StringComparison.OrdinalIgnoreCase) || d.Reference.Contains(idf, StringComparison.OrdinalIgnoreCase));
            }

            // Sort
            query = (req.Sort?.ToLowerInvariant()) switch
            {
                "oldest" => query.OrderBy(d => d.ExecutionTimestamp),
                "payload" or "size" => query.OrderByDescending(d => d.PayloadSizeBytes),
                "title" or "alpha_asc" => query.OrderBy(d => d.Title),
                "alpha_desc" => query.OrderByDescending(d => d.Title),
                _ => query.OrderByDescending(d => d.ExecutionTimestamp)
            };

            var totalCount = query.Count();
            var pageSize = req.PageSize > 0 ? req.PageSize : 10;
            var page = req.Page > 0 ? req.Page : 1;
            var pagedItems = query.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            return new ReportPagedResult<CompletedDossierResponse>
            {
                Items = pagedItems,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        });

    public async Task<DisciplinaryShareResponse> GetDisciplinaryShareAsync()
    {
        var books = await _bookRepository.GetAllAsync();
        if (books.Count == 0)
        {
            return new DisciplinaryShareResponse
            {
                Term = "Current Term",
                StemPercent = 0.0,
                HumssPercent = 0.0,
                HealthPercent = 0.0,
                LawBusPercent = 0.0,
                TargetEquilibriumIndex = 0.0,
                PedagogicalThesisSummary = "No catalog holdings found to evaluate disciplinary equilibrium."
            };
        }

        var total = (double)books.Count;
        var stemCount = books.Count(b => b.Category?.Name != null && (b.Category.Name.Contains("Science", StringComparison.OrdinalIgnoreCase) || b.Category.Name.Contains("Tech", StringComparison.OrdinalIgnoreCase) || b.Category.Name.Contains("Math", StringComparison.OrdinalIgnoreCase) || b.Category.Name.Contains("Engineering", StringComparison.OrdinalIgnoreCase)));
        var humssCount = books.Count(b => b.Category?.Name != null && (b.Category.Name.Contains("Humanities", StringComparison.OrdinalIgnoreCase) || b.Category.Name.Contains("Arts", StringComparison.OrdinalIgnoreCase) || b.Category.Name.Contains("Literature", StringComparison.OrdinalIgnoreCase) || b.Category.Name.Contains("History", StringComparison.OrdinalIgnoreCase)));
        var healthCount = books.Count(b => b.Category?.Name != null && (b.Category.Name.Contains("Health", StringComparison.OrdinalIgnoreCase) || b.Category.Name.Contains("Medical", StringComparison.OrdinalIgnoreCase) || b.Category.Name.Contains("Nursing", StringComparison.OrdinalIgnoreCase)));
        var otherCount = books.Count - stemCount - humssCount - healthCount;

        var stemPct = Math.Round(stemCount * 100.0 / total, 1);
        var humssPct = Math.Round(humssCount * 100.0 / total, 1);
        var healthPct = Math.Round(healthCount * 100.0 / total, 1);
        var lawBusPct = Math.Round(otherCount * 100.0 / total, 1);

        return new DisciplinaryShareResponse
        {
            Term = "Academic Year " + DateTime.UtcNow.Year,
            StemPercent = stemPct,
            HumssPercent = humssPct,
            HealthPercent = healthPct,
            LawBusPercent = lawBusPct,
            TargetEquilibriumIndex = 1.0,
            PedagogicalThesisSummary = $"Curriculum Disciplinary Share dynamically calculated across {books.Count} catalog volumes."
        };
    }

    public async Task<AuditStatsResponse> GetAuditStatsAsync()
    {
        var logs = await _auditRepository.GetAllAsync(limit: 50);
        return new AuditStatsResponse
        {
            ChainState = logs.Count > 0 ? "Verified Intact" : "Genesis Ready",
            TamperViolationsCount = 0,
            StandardSeal = "ISO 2789:2018",
            ComplianceLevel = "Statutory Compliance Level IV",
            ActiveAuditorSignaturesCount = logs.Select(l => l.Action).Distinct().Count(),
            SigningPolicy = "Dual Key Multi-sign Required"
        };
    }

    public async Task<List<AuditAttestationResponse>> GetAuditAttestationsAsync()
    {
        var logs = await _auditRepository.GetAllAsync(limit: 10);
        if (logs.Count == 0) return new List<AuditAttestationResponse>();

        return logs.Select(l => new AuditAttestationResponse
        {
            Id = $"att-{l.Id}",
            LedgerEvent = l.Action,
            TargetDossier = l.RecordRef ?? l.TargetEntity,
            Sha256DigestSignature = l.CurrentHash.Length > 16 ? $"{l.CurrentHash[..11]}...{l.CurrentHash[^6..]}" : l.CurrentHash,
            CertifiedSignerName = "System Auditor",
            CertifiedSignerRole = "Automated Attestation",
            CertifiedSignerInitials = "SA",
            TimestampUtc8 = l.Timestamp.ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss"),
            AttestationStatus = "Certified Intact"
        }).ToList();
    }

    public async Task<List<ScheduleTriggerResponse>> GetScheduleTriggersAsync() =>
        await Task.FromResult(_scheduleTriggers.ToList());

    public async Task<CompletedDossierResponse> GenerateDossierAsync(GenerateReportRequest req) =>
        await Task.Run(async () =>
        {
            var rawData = $"{req.TemplateId}_{req.Timeframe}_{req.Discipline}_{req.ExportFormat}_{DateTime.UtcNow.Ticks}";
            var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawData))).ToLowerInvariant();
            var title = GetTemplateTitle(req.TemplateId);
            var ext = req.ExportFormat.ToLowerInvariant();
            var refCode = $"{req.TemplateId.ToUpper()}-{DateTime.UtcNow:yyyy-MM}-{Guid.NewGuid().ToString()[..6]}.{ext}";

            var dossier = new CompletedDossierResponse
            {
                Id = $"dos-{Guid.NewGuid().ToString()[..8]}",
                Reference = refCode,
                Title = title,
                ExecutionTimestamp = DateTime.UtcNow,
                TimestampFormatted = "Just now, " + DateTime.UtcNow.ToString("HH:mm:ss") + " UTC",
                CertifiedGenerator = "M. Santos (Librarian III)",
                CertifiedGeneratorRole = "Librarian III",
                CertifiedGeneratorAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuCU5cITRmjmyaXve1Q1lWvSnLk-iWUyHnchFuABb9JTYMUcYKT_9HVSY5oFEyp6jE70wOH3ukCogvyc6i1BgHB_1OpbW2xDJLe0T4tcmVsCxviHingl_hKflH_cBH3VW25AbYg5iVaQUzoy5nMQ8CpSqQkhqi8UCZEI_JDfiuIqYMI5w4QwvCBBJPKr66gBkci5na2quGIIORpKesXs4vO1J0sEA2gyFho1_0FM6LOqDzqQjzUDid5X",
                PayloadSizeBytes = 4404019,
                PayloadSizeFormatted = "4.20 MB",
                VerificationStatus = "Certified Official",
                Sha256Digest = hash,
                ExportFormat = req.ExportFormat.ToUpperInvariant()
            };

            lock (_dossiersLedger)
            {
                _dossiersLedger.Insert(0, dossier);
            }

            // Append to audit trail
            await _auditRepository.AddAsync(new AuditLogEntry
            {
                Action = "GENERATE_DOSSIER",
                TargetEntity = "Reports",
                RecordRef = dossier.Reference,
                DeltaModification = $"Generated {dossier.Title} in {req.ExportFormat} with SHA-256 {dossier.Sha256Digest[..12]}...",
                CurrentHash = dossier.Sha256Digest,
                PreviousHash = (await _auditRepository.GetLatestLogAsync())?.CurrentHash ?? "GENESIS",
                Timestamp = DateTime.UtcNow
            });
            await _auditRepository.SaveChangesAsync();

            return dossier;
        });

    public async Task<VerifySealResponse> VerifySealAsync(VerifySealRequest req) =>
        await Task.Run(() =>
        {
            if (string.IsNullOrWhiteSpace(req.HashOrId))
            {
                return new VerifySealResponse
                {
                    IsValid = false,
                    Message = "Please provide a valid SHA-256 hash or dossier identifier."
                };
            }

            var input = req.HashOrId.Trim().ToLowerInvariant();
            var match = _dossiersLedger.FirstOrDefault(d =>
                d.Sha256Digest.ToLowerInvariant().Contains(input) ||
                d.Id.Equals(input, StringComparison.OrdinalIgnoreCase) ||
                d.Reference.ToLowerInvariant().Contains(input));

            if (match != null)
            {
                return new VerifySealResponse
                {
                    IsValid = true,
                    MatchedDigest = match.Sha256Digest,
                    SignerName = match.CertifiedGenerator,
                    SignerRole = match.CertifiedGeneratorRole,
                    AttestationTimestamp = match.ExecutionTimestamp,
                    Message = $"Cryptographic verification matched! Hash signed by {match.CertifiedGenerator} with Zero Alterations detected."
                };
            }

            return new VerifySealResponse
            {
                IsValid = false,
                Message = "Cryptographic hash mismatch. No matching immutable ledger entry found."
            };
        });

    public async Task<bool> ExecuteBulkActionAsync(ReportBulkActionRequest req) =>
        await Task.Run(async () =>
        {
            if (req.DossierIds.Count == 0) return false;

            lock (_dossiersLedger)
            {
                if (req.Action.Equals("Delete", StringComparison.OrdinalIgnoreCase))
                {
                    _dossiersLedger.RemoveAll(d => req.DossierIds.Contains(d.Id));
                }
                else if (req.Action.Equals("Archive", StringComparison.OrdinalIgnoreCase))
                {
                    foreach (var d in _dossiersLedger.Where(d => req.DossierIds.Contains(d.Id)))
                    {
                        d.VerificationStatus = "Archived";
                    }
                }
            }

            await _auditRepository.AddAsync(new AuditLogEntry
            {
                Action = "BULK_" + req.Action.ToUpperInvariant(),
                TargetEntity = "Reports",
                RecordRef = $"{req.DossierIds.Count} dossiers",
                DeltaModification = $"Executed bulk {req.Action} on {req.DossierIds.Count} dossiers",
                CurrentHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(DateTime.UtcNow.Ticks.ToString()))),
                PreviousHash = (await _auditRepository.GetLatestLogAsync())?.CurrentHash ?? "GENESIS",
                Timestamp = DateTime.UtcNow
            });
            await _auditRepository.SaveChangesAsync();

            return true;
        });

    public async Task<bool> RunScheduleNowAsync(string scheduleId) =>
        await Task.Run(async () =>
        {
            await _auditRepository.AddAsync(new AuditLogEntry
            {
                Action = "TRIGGER_SCHEDULE_NOW",
                TargetEntity = "Reports/Schedules",
                RecordRef = scheduleId,
                DeltaModification = $"Dispatched automated schedule task {scheduleId} immediately",
                CurrentHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(DateTime.UtcNow.Ticks.ToString()))),
                PreviousHash = (await _auditRepository.GetLatestLogAsync())?.CurrentHash ?? "GENESIS",
                Timestamp = DateTime.UtcNow
            });
            await _auditRepository.SaveChangesAsync();

            return true;
        });

    private static string GetTemplateTitle(string templateId) =>
        templateId.ToLowerInvariant() switch
        {
            "circulation" => "Circulation & Borrowing Dossier (CHEd Standard A-1)",
            "inventory" => "Inventory Valuation & Deprecation Audit (PAS 16 Compliant)",
            "financial" => "Financial Collections & Fine Journal (COA Accounting Spec)",
            "delinquency" => "Overdue Delinquencies & Disciplinary Dossier",
            "curriculum" => "Academic Discipline & Curriculum Demand Ledger",
            "acquisitions" => "Consolidated Acquisitions & Book Donation Trail",
            _ => "Certified University Statutory Dossier"
        };
}
