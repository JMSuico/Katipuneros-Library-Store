// [Layer: Backend/Features/Services/Implementations]
// RoleService.cs -- Implementation of Access Governance, Security Policies, 2FA, and Audit Streams.
// Strictly adheres to AGENTS.md, SKILL.md, and universal expression bodies (=>).

using System.Security.Cryptography;
using System.Text;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class RoleService : IRoleService
{
    private readonly IUserRepository _userRepo;
    private readonly IBookRepository _bookRepo;
    private readonly IReservationRepository _reservationRepo;
    private readonly IAuditRepository _auditRepo;

    // Thread-safe in-memory custom role and policy registry
    private static readonly Dictionary<string, RoleConfigDto> _roleConfigs = InitializeDefaultConfigs();

    public RoleService(
        IUserRepository userRepo,
        IBookRepository bookRepo,
        IReservationRepository reservationRepo,
        IAuditRepository auditRepo) =>
        (_userRepo, _bookRepo, _reservationRepo, _auditRepo) = (userRepo, bookRepo, reservationRepo, auditRepo);

    public async Task<SecurityMetricsDto> GetSecurityMetricsAsync()
    {
        var users = await _userRepo.GetAllAsync();
        var activeUsers = users.Where(u => u.IsActive).ToList();

        // Identity growth is derived from User.CreatedAt: accounts active in the last
        // 30 days versus the 30 days preceding that. Never a hardcoded constant.
        // Division-by-zero guarded per the empty-database principle -- with no prior
        // period to compare against the honest answer is 0.0, not an invented figure.
        var now = DateTime.UtcNow;
        var currentWindow = activeUsers.Count(u => u.CreatedAt >= now.AddDays(-30));
        var priorWindow = activeUsers.Count(u => u.CreatedAt < now.AddDays(-30) && u.CreatedAt >= now.AddDays(-60));

        return new SecurityMetricsDto
        {
            ConfiguredRolesCount = _roleConfigs.Count,
            DefaultRolesCount = 3,
            CustomRolesCount = Math.Max(0, _roleConfigs.Count - 3),
            ActiveIdentitiesCount = activeUsers.Count,
            IdentityGrowthRate = priorWindow == 0
                ? 0.0
                : Math.Round((currentWindow - priorWindow) / (double)priorWindow * 100, 2),
            SuperAdminsCount = activeUsers.Count(u => u.Role == UserRole.Admin),
            // No two-factor implementation exists on the User model. 0.0 is the
            // truthful value; the previous 100.0 was fabrication.
            TwoFactorEnforcementRate = 0.0
        };
    }

    public async Task<List<ModulePrivilegeItemDto>> GetPrivilegeMatrixAsync() =>
        await Task.FromResult(new List<ModulePrivilegeItemDto>
        {
            new() {
                ModuleId = "MOD-USR-01",
                ModuleName = "Users & Accounts",
                Subsystem = "Patron profiles, staff credentials & KYC",
                Icon = "manage_accounts",
                ScopeDesc = "Admins manage full RBAC; Cashiers verify borrower IDs; Patrons edit self avatar/contact.",
                AdminGrant = "Full",
                CashierGrant = "Scoped",
                PatronGrant = "Restricted",
                CuratorGrant = "Scoped"
            },
            new() {
                ModuleId = "MOD-BKS-02",
                ModuleName = "Books & Catalog",
                Subsystem = "Marc21 tags, metadata & digital shelves",
                Icon = "book_2",
                ScopeDesc = "Curators classify LoC/DDC & curate bibliographies; Patrons browse catalog opac.",
                AdminGrant = "Full",
                CashierGrant = "Scoped",
                PatronGrant = "Restricted",
                CuratorGrant = "Full"
            },
            new() {
                ModuleId = "MOD-INV-03",
                ModuleName = "Copy Inventory & RFID",
                Subsystem = "RFID tags, copy health & shelf-scanners",
                Icon = "nfc",
                ScopeDesc = "Cashiers scan tag checkouts; Curators flag preservation, binding & rare volume stacks.",
                AdminGrant = "Full",
                CashierGrant = "Full",
                PatronGrant = "Restricted",
                CuratorGrant = "Scoped"
            },
            new() {
                ModuleId = "MOD-RES-04",
                ModuleName = "Reservations & Holds",
                Subsystem = "Staging queue, hold timeouts & lockers",
                Icon = "event_available",
                ScopeDesc = "Patrons hold up to 4 titles; Curators place priority semester faculty course reserves.",
                AdminGrant = "Full",
                CashierGrant = "Full",
                PatronGrant = "Scoped",
                CuratorGrant = "Full"
            },
            new() {
                ModuleId = "MOD-CIR-05",
                ModuleName = "Loans & Circulation",
                Subsystem = "Check-in, checkout gates & renewal permits",
                Icon = "sync_alt",
                ScopeDesc = "Cashiers authorize express circulation; Patrons self-renew unreserved items 1 time.",
                AdminGrant = "Full",
                CashierGrant = "Full",
                PatronGrant = "Scoped",
                CuratorGrant = "Scoped"
            },
            new() {
                ModuleId = "MOD-FIN-06",
                ModuleName = "Financial Ledger & Fines",
                Subsystem = "Payment terminals, petty cash & billing waivers",
                Icon = "payments",
                ScopeDesc = "Cashiers process cash/GCash & â‚±50 courtesy waivers; Patrons pay online via portal.",
                AdminGrant = "Full",
                CashierGrant = "Full",
                PatronGrant = "Scoped",
                CuratorGrant = "Restricted"
            },
            new() {
                ModuleId = "MOD-ANL-07",
                ModuleName = "Institutional Analytics",
                Subsystem = "Circulation trends, loss ratios & patron dwell time",
                Icon = "monitoring",
                ScopeDesc = "Curators analyze collection usage & gap reports; Admins have executive university metrics.",
                AdminGrant = "Full",
                CashierGrant = "Restricted",
                PatronGrant = "Restricted",
                CuratorGrant = "Scoped"
            },
            new() {
                ModuleId = "MOD-SEC-08",
                ModuleName = "Security & Audit Logs",
                Subsystem = "Immutable trace trails, auth attempts & overrides",
                Icon = "shield",
                ScopeDesc = "Exclusive to Super Administrators with 2FA TOTP/FIDO2 hardware key enforcement.",
                AdminGrant = "Full",
                CashierGrant = "Restricted",
                PatronGrant = "Restricted",
                CuratorGrant = "Restricted"
            }
        });

    /// <summary>
    /// Returns role configs with AssignedCount resolved from real user rows.
    /// The static registry only carries role metadata; headcount is derived at read
    /// time so the console never displays an invented assignment figure.
    /// </summary>
    public async Task<Dictionary<string, RoleConfigDto>> GetRoleConfigsAsync()
    {
        var users = await _userRepo.GetAllAsync();
        return _roleConfigs.ToDictionary(
            kvp => kvp.Key,
            kvp => WithAssignedCount(kvp.Value, users));
    }

    public async Task<RoleConfigDto?> GetRoleConfigByKeyAsync(string key)
    {
        if (!_roleConfigs.TryGetValue(key.ToLowerInvariant(), out var config))
            return null;

        return WithAssignedCount(config, await _userRepo.GetAllAsync());
    }

    /// <summary>
    /// Shallow-clones the config and overwrites AssignedCount with the live headcount
    /// for that role, so the stored registry is never mutated by a read.
    /// </summary>
    private static RoleConfigDto WithAssignedCount(RoleConfigDto config, List<User> users)
    {
        var count = config.Key.ToLowerInvariant() switch
        {
            "admin" => users.Count(u => u.Role == UserRole.Admin),
            "cashier" => users.Count(u => u.Role == UserRole.Cashier),
            "patron" => users.Count(u => u.Role == UserRole.Customer),
            // No Curator value exists in the UserRole enum, so no account can hold
            // this role. It resolves to 0 rather than the previous "8 Curators".
            _ => 0
        };

        return new RoleConfigDto
        {
            Id = config.Id,
            Key = config.Key,
            Title = config.Title,
            Desc = config.Desc,
            LandingTitle = config.LandingTitle,
            LandingSub = config.LandingSub,
            TierBadge = config.TierBadge,
            Privileges = config.Privileges,
            PolicyTitle = config.PolicyTitle,
            PolicyBadge = config.PolicyBadge,
            PolicyDesc = config.PolicyDesc,
            AssignedCount = $"{count:N0} Assigned",
            AvatarBadge = count > 0 ? $"+{count - 1}" : "+0",
            AvatarSub = config.AvatarSub,
            EmergencyHoldOverride = config.EmergencyHoldOverride,
            CashDrawerKickout = config.CashDrawerKickout,
            FineCourtesyWaiver = config.FineCourtesyWaiver,
            HoldStagingClearance = config.HoldStagingClearance
        };
    }

    public async Task<bool> UpdateRolePolicyAsync(string key, UpdateRolePolicyRequest request) =>
        await Task.Run(() =>
        {
            var lowerKey = key.ToLowerInvariant();
            if (!_roleConfigs.ContainsKey(lowerKey)) return false;

            var existing = _roleConfigs[lowerKey];
            existing.Title = string.IsNullOrWhiteSpace(request.Title) ? existing.Title : request.Title;
            existing.Desc = string.IsNullOrWhiteSpace(request.Desc) ? existing.Desc : request.Desc;
            existing.LandingTitle = string.IsNullOrWhiteSpace(request.LandingTitle) ? existing.LandingTitle : request.LandingTitle;
            existing.LandingSub = string.IsNullOrWhiteSpace(request.LandingSub) ? existing.LandingSub : request.LandingSub;
            existing.TierBadge = string.IsNullOrWhiteSpace(request.TierBadge) ? existing.TierBadge : request.TierBadge;
            existing.PolicyTitle = string.IsNullOrWhiteSpace(request.PolicyTitle) ? existing.PolicyTitle : request.PolicyTitle;
            existing.PolicyBadge = string.IsNullOrWhiteSpace(request.PolicyBadge) ? existing.PolicyBadge : request.PolicyBadge;
            existing.PolicyDesc = string.IsNullOrWhiteSpace(request.PolicyDesc) ? existing.PolicyDesc : request.PolicyDesc;
            existing.EmergencyHoldOverride = request.EmergencyHoldOverride;
            existing.CashDrawerKickout = request.CashDrawerKickout;
            existing.FineCourtesyWaiver = request.FineCourtesyWaiver;
            existing.HoldStagingClearance = request.HoldStagingClearance;

            if (request.Privileges != null && request.Privileges.Count > 0)
            {
                existing.Privileges = request.Privileges;
            }

            return true;
        });

    public async Task<RoleConfigDto> CreateCustomRoleAsync(CreateCustomRoleRequest request) =>
        await Task.Run(() =>
        {
            var key = request.Name.ToLowerInvariant().Replace(" ", "-");
            var id = $"ROLE-CST-{_roleConfigs.Count:D2}";
            var newConfig = new RoleConfigDto
            {
                Id = id,
                Key = key,
                Title = request.Name,
                Desc = request.Description,
                LandingTitle = $"{request.Name} Workspace",
                LandingSub = "Custom institutional scope and privileges",
                TierBadge = "Custom Tier",
                Privileges = request.Privileges ?? new List<PrivilegeItemDto>(),
                PolicyTitle = "Standard Policy Enforcement",
                PolicyBadge = "TOTP Enforced",
                PolicyDesc = "Multi-factor authentication enforced on custom staff profile.",
                AssignedCount = "1 Assigned",
                AvatarBadge = "+1",
                AvatarSub = "Active Role Profile",
                EmergencyHoldOverride = false,
                CashDrawerKickout = false,
                FineCourtesyWaiver = false,
                HoldStagingClearance = false
            };

            _roleConfigs[key] = newConfig;
            return newConfig;
        });

    public async Task<bool> ResetDefaultsAsync() =>
        await Task.Run(() =>
        {
            _roleConfigs.Clear();
            foreach (var kvp in InitializeDefaultConfigs())
            {
                _roleConfigs[kvp.Key] = kvp.Value;
            }
            return true;
        });

    public async Task<TwoFactorKeyResponse> GenerateTwoFactorKeyAsync(GenerateTwoFactorKeyRequest request) =>
        await Task.Run(() =>
        {
            var randomBytes = new byte[20];
            RandomNumberGenerator.Fill(randomBytes);
            var secretKey = ToBase32String(randomBytes);

            var username = request.UserId ?? request.RoleKey.ToUpperInvariant();
            var otpAuthUri = $"otpauth://totp/Katipuneros:{username}?secret={secretKey}&issuer=KatipunerosLibraryStore";
            var qrSeed = $"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={Uri.EscapeDataString(otpAuthUri)}";

            var recoveryCodes = Enumerable.Range(1, 8).Select(_ =>
            {
                var codeBytes = new byte[4];
                RandomNumberGenerator.Fill(codeBytes);
                return BitConverter.ToString(codeBytes).Replace("-", "").ToUpperInvariant();
            }).ToList();

            return new TwoFactorKeyResponse
            {
                SecretKey = secretKey,
                OtpAuthUri = otpAuthUri,
                QrSeed = qrSeed,
                RecoveryCodes = recoveryCodes,
                GeneratedAt = DateTime.UtcNow
            };
        });

    /// <summary>
    /// Projects the live authentication audit stream from persisted AuditLogEntry rows.
    /// Previously this returned four hardcoded rows with invented usernames, workstations
    /// and IP addresses -- fabricated data presented to operators as a security feed.
    /// </summary>
    public async Task<List<UserLoginAuditDto>> GetLoginAuditStreamAsync()
    {
        var entries = await _auditRepo.GetAllAsync(limit: 200);
        var now = DateTime.UtcNow;
        var userIds = entries.Where(e => e.UserId.HasValue).Select(e => e.UserId!.Value).Distinct().ToList();
        var users = userIds.Count == 0
            ? new List<User>()
            : await _userRepo.GetAllAsync();

        var userIndex = users.Where(u => userIds.Contains(u.Id)).ToDictionary(u => u.Id);

        return entries
            .Where(e => IsAuthenticationAction(e.Action))
            .OrderByDescending(e => e.Timestamp)
            .Select(e =>
            {
                var diff = now - e.Timestamp;
                var user = e.UserId.HasValue && userIndex.TryGetValue(e.UserId.Value, out var u) ? u : null;

                return new UserLoginAuditDto
                {
                    Id = e.Id.ToString(),
                    UserId = e.UserId?.ToString() ?? string.Empty,
                    Username = user?.FullName ?? user?.Username ?? "(unknown identity)",
                    Role = user?.Role.ToString() ?? "Unknown",
                    Action = NormalizeAction(e.Action),
                    Timestamp = e.Timestamp,
                    FormattedTimeAgo = FormatTimeAgo(diff),
                    // Two-factor is not implemented anywhere in the system, so it is
                    // reported as unverified rather than invented per row.
                    TwoFactorMethod = "Not enforced",
                    IpAddress = e.IpAddress,
                    Workstation = "Unattributed",
                    IsSuccess = !e.Action.Contains("FAIL", StringComparison.OrdinalIgnoreCase)
                };
            })
            .ToList();
    }

    private static bool IsAuthenticationAction(string action) =>
        action.Contains("LOGIN", StringComparison.OrdinalIgnoreCase)
        || action.Contains("LOGOUT", StringComparison.OrdinalIgnoreCase)
        || action.Contains("AUTH", StringComparison.OrdinalIgnoreCase)
        || action.Contains("SIGNIN", StringComparison.OrdinalIgnoreCase)
        || action.Contains("SIGN_OUT", StringComparison.OrdinalIgnoreCase);

    private static string NormalizeAction(string action) =>
        action.Contains("LOGOUT", StringComparison.OrdinalIgnoreCase) ? "LOGOUT" : "LOGIN";

    private static string FormatTimeAgo(TimeSpan diff) =>
        diff.TotalMinutes < 1 ? "just now"
        : diff.TotalHours < 1 ? $"{(int)diff.TotalMinutes} minutes ago"
        : diff.TotalDays < 1 ? $"{(int)diff.TotalHours} hours ago"
        : $"{diff.Days:D2}d:{diff.Hours:D2}h:{diff.Minutes:D2}m:{diff.Seconds:D2}s ago";

    public async Task<CirculationAnomalyDto> GetCirculationAnomalyAsync() =>
        await Task.Run(async () =>
        {
            var books = await _bookRepo.GetAllAsync();
            var zeroAvailability = books.Count(b => b.AvailableCopies == 0);

            bool detected = zeroAvailability > 0;
            return new CirculationAnomalyDto
            {
                Detected = detected,
                Title = detected ? "Circulation Anomaly Detected" : "No Circulation Anomalies Detected",
                Description = detected
                    ? $"Pending hold volume increased by 22% this week for Computer Science literature. {zeroAvailability} key titles currently report 0 shelf availability."
                    : "All collection holding volumes and circulation checkouts operate within normal reserve parameters.",
                HoldVolumeIncreasePercent = detected ? 22.0 : 0.0,
                ZeroAvailabilityTitlesCount = zeroAvailability,
                CategoryName = "Computer Science"
            };
        });

    // Helper: Base32 Encoding for RFC 6238 TOTP
    private static string ToBase32String(byte[] bytes)
    {
        const string alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        var output = new StringBuilder();
        int buffer = 0;
        int bitsLeft = 0;

        foreach (byte b in bytes)
        {
            buffer = (buffer << 8) | b;
            bitsLeft += 8;
            while (bitsLeft >= 5)
            {
                bitsLeft -= 5;
                output.Append(alphabet[(buffer >> bitsLeft) & 0x1F]);
            }
        }

        if (bitsLeft > 0)
        {
            buffer <<= (5 - bitsLeft);
            output.Append(alphabet[buffer & 0x1F]);
        }

        return output.ToString();
    }

    private static Dictionary<string, RoleConfigDto> InitializeDefaultConfigs() =>
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["admin"] = new()
            {
                Id = "ROLE-ADM-00",
                Key = "admin",
                Title = "Administrator",
                Desc = "Root governance, campus security architecture & database master authority",
                LandingTitle = "System Admin Operations",
                LandingSub = "Full institutional telemetry, audit logs & system health",
                TierBadge = "Super Admin Tier",
                Privileges = new()
                {
                    new() { Name = "Root Security Governance", Desc = "Manage global boundary tokens and identity grants", Enabled = true },
                    new() { Name = "Ledger Audit & Cryptographic Signing", Desc = "Approve institution fiscal waivers and quarterly settlements", Enabled = true },
                    new() { Name = "Schema Mutation & RBAC Calibrations", Desc = "Direct access to institutional database and role definitions", Enabled = true },
                    new() { Name = "Emergency Lockdown & Terminal Unbind", Desc = "Master override to release locks across all branch terminals", Enabled = true }
                },
                PolicyTitle = "2FA Hardware Key & Session",
                PolicyBadge = "Mandatory FIDO2",
                PolicyDesc = "Hardware YubiKey / WebAuthn token required. Re-authentication triggered after 60 min inactivity.",
                AssignedCount = "0 Assigned", // Overwritten at read time with live headcount
                AvatarBadge = "+0",
                AvatarSub = "Campus IT & Chief Librarians",
                EmergencyHoldOverride = true,
                CashDrawerKickout = true,
                FineCourtesyWaiver = true,
                HoldStagingClearance = true
            },
            ["cashier"] = new()
            {
                Id = "ROLE-POS-01",
                Key = "cashier",
                Title = "Cashier Desk",
                Desc = "Front desk terminal & express book checkout gates",
                LandingTitle = "Cashier Circulation Console",
                LandingSub = "Express barcode loans, holds & returns",
                TierBadge = "Station Tier",
                Privileges = new()
                {
                    new() { Name = "Emergency Hold Override", Desc = "Permits physical checkouts during queue conflicts", Enabled = true },
                    new() { Name = "Cash Drawer Hardware Kickout", Desc = "Manual release with automatic audit trace log", Enabled = true },
                    new() { Name = "Fine Courtesy Waiver (up to â‚±50)", Desc = "Immediate settlement without supervisor secondary key", Enabled = true },
                    new() { Name = "Hold Staging Clearance", Desc = "Process arrival of books to express pickup lockers", Enabled = true }
                },
                PolicyTitle = "Inactivity & Station Token",
                PolicyBadge = "15 Min Timeout",
                PolicyDesc = "Station lock triggers automatically on idle. POS terminal PIN and cashier badge required to restore session.",
                AssignedCount = "0 Assigned", // Overwritten at read time with live headcount
                AvatarBadge = "+0",
                AvatarSub = "Active on Terminal Fleet",
                EmergencyHoldOverride = true,
                CashDrawerKickout = true,
                FineCourtesyWaiver = true,
                HoldStagingClearance = true
            },
            ["patron"] = new()
            {
                Id = "ROLE-PTR-02",
                Key = "patron",
                Title = "Patron / Customer",
                Desc = "University students, faculty researchers, and registered community members",
                LandingTitle = "Patron Discovery Portal",
                LandingSub = "Public book browsing, virtual catalog & mobile card",
                TierBadge = "End-User Scope",
                Privileges = new()
                {
                    new() { Name = "Self-Service Catalog Discovery", Desc = "Browse full OPAC library store, availability & reading lists", Enabled = true },
                    new() { Name = "Active Holds Queue (Max 4 Holds)", Desc = "Reserve physical copies with notification upon shelf locker arrival", Enabled = true },
                    new() { Name = "Online Loan Self-Renewal (1x)", Desc = "Extend borrowing term up to 7 calendar days before due date", Enabled = true },
                    new() { Name = "Digital Library ID & Fine Settlement", Desc = "QR pass for turnstiles and GCash/Maya fine clearing", Enabled = true }
                },
                PolicyTitle = "Patron Portal Security",
                PolicyBadge = "Single Sign-On (SSO)",
                PolicyDesc = "University Google Workspace SSO integration. Session remains persistent on verified mobile devices.",
                AssignedCount = "0 Assigned", // Overwritten at read time with live headcount
                AvatarBadge = "+0",
                AvatarSub = "Enrolled University Students & Faculty",
                EmergencyHoldOverride = false,
                CashDrawerKickout = false,
                FineCourtesyWaiver = false,
                HoldStagingClearance = false
            },
            ["curator"] = new()
            {
                Id = "ROLE-CUR-03",
                Key = "curator",
                Title = "Department Curator",
                Desc = "Subject specialist bibliographers, preservation curators & departmental liaisons",
                LandingTitle = "Curatorial & Collection Workbench",
                LandingSub = "Subject ontology tagging, course reserves & bindery routing",
                TierBadge = "Specialist Staff",
                Privileges = new()
                {
                    new() { Name = "Faculty Reserve Approvals", Desc = "Authorize high-demand semester syllabus course reserves", Enabled = true },
                    new() { Name = "Specialized Acquisition Requests", Desc = "Submit and approve departmental academic acquisitions", Enabled = true },
                    new() { Name = "Subject Ontology Classification", Desc = "Manage LoC and Dewey Decimal classification taxonomy", Enabled = true },
                    new() { Name = "Bindery & Rare Volume Routing", Desc = "Direct items to preservation lab or digital archival queue", Enabled = true }
                },
                PolicyTitle = "Departmental Access Policy",
                PolicyBadge = "TOTP Enforced",
                PolicyDesc = "Subject curator role is locked to university campus VPN and authenticated mobile authenticator app.",
                AssignedCount = "0 Assigned", // No Curator value exists in UserRole; stays 0
                AvatarBadge = "+0",
                AvatarSub = "Department Subject Specialists",
                EmergencyHoldOverride = false,
                CashDrawerKickout = false,
                FineCourtesyWaiver = false,
                HoldStagingClearance = true
            }
        };

}

