// [Layer: Features/DBInfrastructure/Database]
// DatabaseSeeder.cs -- Initial database seed orchestrator.
// Establishes cryptographic Genesis Hash root anchor and core Dewey Decimal taxonomy classifications.
// Adheres strictly to AGENTS.md and SKILL.md: ZERO static books, ZERO static users, pure infrastructure bootstrap.
// DO NOT put HTTP concerns or controller logic here.

using System;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data;
using Backend.Features.Data.Models;
using Backend.Features.Helpers.Infrastructure;

namespace Backend.Features.DBInfrastructure.Database;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // 1. Category Taxonomy Bootstrap (Head Foundation)
        // Each category receives a unique, ascending code (CAT-0001, CAT-0002, ...).
        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new() { DeweyRange = "CAT-0001", Name = "Computer Science & Information", Description = "Algorithms, software engineering, systems, and data structures." },
                new() { DeweyRange = "CAT-0002", Name = "Philosophy & Psychology", Description = "Ethics, logic, classical philosophy, and cognitive science." },
                new() { DeweyRange = "CAT-0003", Name = "Social Sciences & Law", Description = "Economics, education, sociology, and jurisprudence." },
                new() { DeweyRange = "CAT-0004", Name = "Pure Science & Mathematics", Description = "Physics, chemistry, calculus, and astrophysics." },
                new() { DeweyRange = "CAT-0005", Name = "Technology & Applied Sciences", Description = "Mechanical, electrical, chemical engineering, and robotics." },
                new() { DeweyRange = "CAT-0006", Name = "Literature & Rhetoric", Description = "Poetry, world classics, drama, and scholastic rhetoric." },
                new() { DeweyRange = "CAT-0007", Name = "History & Filipiniana", Description = "Philippine revolution, Katipunan archives, and global history." }
            };

            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }
        else
        {
            // One-time normalization: retire legacy Dewey call-range codes in favour of the
            // unique ascending CAT-#### code, preserving the previous ascending order.
            var all = await context.Categories.ToListAsync();
            var legacy = all.Where(c => !c.DeweyRange.StartsWith("CAT-", StringComparison.OrdinalIgnoreCase))
                            .OrderBy(c => c.DeweyRange)
                            .ToList();
            if (legacy.Count > 0)
            {
                var next = all.Select(c => c.DeweyRange.StartsWith("CAT-", StringComparison.OrdinalIgnoreCase) &&
                                           int.TryParse(c.DeweyRange[4..], out var n) ? n : 0)
                              .DefaultIfEmpty(0).Max();
                legacy.ForEach(c =>
                {
                    c.DeweyRange = $"CAT-{++next:D4}";
                    c.ShelfBayLocation = string.Empty;
                });
                await context.SaveChangesAsync();
            }
        }

        // 2. Security & Cryptographic Genesis Head (AuditHelper Connection)
        // Establishes the immutable root anchor (AuditHelper.GenesisHash) so that every subsequent
        // operational audit entry mathematically chains via SHA-256 for tamper-evidence.
        // Pure system governance anchor -- NO fake/static user mocks or hardcoded books.
        if (!await context.AuditLogs.AnyAsync())
        {
            var genesisTime = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            string prevHash = AuditHelper.GenesisHash;
            string currentHash = AuditHelper.ComputeHash(prevHash, "SYSTEM_GENESIS_ROOT", "Security Governance", "\"chain\": \"INITIALIZED\"", genesisTime);

            var genesisEntry = new AuditLogEntry
            {
                Action = "SYSTEM_GENESIS_ROOT",
                TargetEntity = "Security Governance",
                RecordRef = "#GENESIS-ROOT",
                DeltaModification = "\"genesis_status\": \"CRYPTOGRAPHICALLY_VERIFIED\"",
                IpAddress = "127.0.0.1",
                Severity = "Info",
                Timestamp = genesisTime,
                PreviousHash = prevHash,
                CurrentHash = currentHash
            };

            await context.AuditLogs.AddAsync(genesisEntry);
            await context.SaveChangesAsync();
        }

        // 3. Campus IP & CIDR Whitelist Baseline
        // Seeds the official university campus subnet ranges for admin console access governance.
        if (!await context.CidrSubnets.AnyAsync())
        {
            var defaultSubnets = new List<CidrSubnet>
            {
                new()
                {
                    CidrRange = "121.54.32.0/24",
                    NetworkClassification = "Katipunan Staff WiFi VLAN",
                    AccessLevel = "Staff Mobile",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System Bootstrap"
                },
                new()
                {
                    CidrRange = "192.168.100.0/22",
                    NetworkClassification = "Circulation Kiosk LAN",
                    AccessLevel = "POS Desks",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System Bootstrap"
                }
            };

            await context.CidrSubnets.AddRangeAsync(defaultSubnets);
            await context.SaveChangesAsync();
        }

        // 4. Institutional Governance & System Settings Baseline
        // Seeds the 4 core system governance records: circulation policy, reservation setups, fine tariffs, and security governance.
        if (!await context.SystemSettings.AnyAsync())
        {
            var seedSettings = new List<SystemSetting>
            {
                new()
                {
                    Key = "circulation_policy",
                    Category = "Circulation",
                    Description = "Circulation duration and patron tier borrowing policy",
                    UpdatedBy = "System Bootstrap",
                    UpdatedAt = DateTime.UtcNow,
                    Value = JsonSerializer.Serialize(new CirculationPolicyResponse
                    {
                        Tier1 = new TierPolicyDto
                        {
                            DaysDuration = 14,
                            MaxConcurrency = 4,
                            RenewalLimit = "1 Time (7d)",
                            HoldQueueLimit = 2,
                            OverdueTariff = "Standard Daily"
                        },
                        Tier2 = new TierPolicyDto
                        {
                            DaysDuration = 28,
                            MaxConcurrency = 8,
                            RenewalLimit = "2 Times (14d)",
                            HoldQueueLimit = 5,
                            OverdueTariff = "Standard Daily"
                        },
                        Tier3 = new TierPolicyDto
                        {
                            DaysDuration = 60,
                            MaxConcurrency = 15,
                            RenewalLimit = "Auto Semester",
                            HoldQueueLimit = 10,
                            OverdueTariff = "Waived 1st Cycle"
                        },
                        GracePeriodHours = 24,
                        InterLibraryLoanProtocol = "Katipunan Consortium"
                    })
                },
                new()
                {
                    Key = "reservation_setups",
                    Category = "Reservations",
                    Description = "Reservation hold thresholds and notification rules",
                    UpdatedBy = "System Bootstrap",
                    UpdatedAt = DateTime.UtcNow,
                    Value = JsonSerializer.Serialize(new ReservationSetupsResponse
                    {
                        InstantReshelveNotice = true,
                        ThesisScholarPriority = true,
                        PickupNotificationCadence = "24h Prior"
                    })
                },
                new()
                {
                    Key = "fine_tariffs",
                    Category = "Fines",
                    Description = "Overdue penalties, repair costs, and waiver governance",
                    UpdatedBy = "System Bootstrap",
                    UpdatedAt = DateTime.UtcNow,
                    Value = JsonSerializer.Serialize(new FineTariffsResponse
                    {
                        DailyOverdueTariff = 15.00m,
                        MaxPenaltyCap = 500.00m,
                        BindingRepairTariff = 280.00m,
                        LostBookAdministrativeFee = 150.00m,
                        MedicalWaiverEnabled = true,
                        TyphoonWaiverEnabled = true
                    })
                },
                new()
                {
                    Key = "security_governance",
                    Category = "Security",
                    Description = "Security session timeouts and node governance",
                    UpdatedBy = "System Bootstrap",
                    UpdatedAt = DateTime.UtcNow,
                    Value = JsonSerializer.Serialize(new SecurityGovernanceResponse
                    {
                        PosAutoLogoffMinutes = 15,
                        SuperAdminTimeoutMinutes = 60,
                        AuditNodeStatus = "Nominal",
                        HashChainLength = 0,
                        HmacKeyStatus = "Rotated (3d ago)"
                    })
                }
            };

            await context.SystemSettings.AddRangeAsync(seedSettings);
            await context.SaveChangesAsync();
        }
    }
}
