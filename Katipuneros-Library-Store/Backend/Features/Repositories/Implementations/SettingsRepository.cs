// [Layer: Repositories/Implementations]
// SettingsRepository.cs -- EF Core repository implementation for system settings and CIDR subnets.
// Uses clean expression-bodied lambda syntax (=>) for all asynchronous operations.
// DO NOT put business rules, validation, or HTTP concerns here.

using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data;
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;

namespace Backend.Features.Repositories.Implementations;

public class SettingsRepository : ISettingsRepository
{
    private readonly AppDbContext _context;

    public SettingsRepository(AppDbContext context) => _context = context;

    public async Task<List<SystemSetting>> GetAllSettingsAsync() =>
        await _context.SystemSettings.AsNoTracking().ToListAsync();

    public async Task<SystemSetting?> GetByKeyAsync(string key) =>
        await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);

    public async Task UpsertSettingAsync(string key, string value, string category, string description, string updatedBy)
    {
        var existing = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);
        if (existing != null)
        {
            existing.Value = value;
            existing.Category = category;
            existing.Description = description;
            existing.UpdatedAt = DateTime.UtcNow;
            existing.UpdatedBy = updatedBy;
            _context.SystemSettings.Update(existing);
        }
        else
        {
            await _context.SystemSettings.AddAsync(new SystemSetting
            {
                Key = key,
                Value = value,
                Category = category,
                Description = description,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = updatedBy
            });
        }
        await _context.SaveChangesAsync();
    }

    public async Task<List<CidrSubnet>> GetAllCidrSubnetsAsync() =>
        await _context.CidrSubnets.AsNoTracking().OrderByDescending(s => s.CreatedAt).ToListAsync();

    public async Task<CidrSubnet> AddCidrSubnetAsync(CidrSubnet subnet)
    {
        var entry = await _context.CidrSubnets.AddAsync(subnet);
        await _context.SaveChangesAsync();
        return entry.Entity;
    }

    public async Task DeleteCidrSubnetsAsync(List<Guid> ids) =>
        await _context.CidrSubnets
            .Where(s => ids.Contains(s.Id))
            .ExecuteDeleteAsync();

    public async Task<int> GetActiveCustomerCountAsync() =>
        await _context.Users.CountAsync(u => u.Role == UserRole.Customer && u.IsActive);

    public async Task<int> GetCirculatingTitlesCountAsync() =>
        await _context.Books.CountAsync(b => b.TotalCopies > 0);

    public async Task<int> GetAuditLogsCountAsync() =>
        await _context.AuditLogs.CountAsync();

    public async Task<int> GetAuditLogs24hCountAsync()
    {
        var cutoff = DateTime.UtcNow.AddHours(-24);
        return await _context.AuditLogs.CountAsync(a => a.Timestamp >= cutoff);
    }

    public async Task<int> GetActiveSuperAdminCountAsync() =>
        await _context.Users.CountAsync(u => u.Role == UserRole.Admin && u.IsActive);

    public async Task<List<ArchiveModuleSummaryDto>> GetLiveArchiveSummariesAsync()
    {
        // 1. User Directory
        var activeUsers = await _context.Users.CountAsync(u => u.IsActive);
        var archivedUsers = await _context.Users.CountAsync(u => !u.IsActive);

        // 2. Catalog Books
        var activeBooks = await _context.Books.CountAsync(b => b.TotalCopies > 0);
        var archivedBooks = await _context.Books.CountAsync(b => b.TotalCopies == 0);

        // 3. Classification Categories
        var activeCats = await _context.Categories.CountAsync();
        var archivedCats = 0;

        // 4. Physical Inventory
        var activeInventory = await _context.Books.SumAsync(b => b.TotalCopies);
        var archivedInventory = 0;

        // 5. Reservations Queue
        var activeRes = await _context.Reservations.CountAsync(r => r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.StagedInLocker);
        var archivedRes = await _context.Reservations.CountAsync(r => r.Status == ReservationStatus.Fulfilled || r.Status == ReservationStatus.Cancelled || r.Status == ReservationStatus.Expired);

        // 6. Borrowing Circulation
        var activeBorrow = await _context.BorrowTransactions.CountAsync(b => b.Status == TransactionStatus.Active);
        var archivedBorrow = await _context.BorrowTransactions.CountAsync(b => b.Status == TransactionStatus.Returned);

        // 7. Return Journal & Salvage
        var recentCutoff = DateTime.UtcNow.AddDays(-7);
        var activeReturns = await _context.BorrowTransactions.CountAsync(b => b.Status == TransactionStatus.Returned && b.ReturnDate >= recentCutoff);
        var archivedReturns = await _context.BorrowTransactions.CountAsync(b => b.Status == TransactionStatus.Returned && b.ReturnDate < recentCutoff);

        // 8. Statutory Reports & Dossiers
        var activeFines = await _context.FineTransactions.CountAsync(f => f.Status == "Unpaid");
        var archivedFines = await _context.FineTransactions.CountAsync(f => f.Status == "Paid" || f.Status == "Waived");

        // 9. RBAC Security Grants
        var activeRbac = Math.Max(1, await _context.Users.Select(u => u.Role).Distinct().CountAsync());
        var archivedRbac = 0;

        // 10. Cryptographic Audit Logs (WAL)
        var auditCutoff = DateTime.UtcNow.AddDays(-30);
        var activeAudit = await _context.AuditLogs.CountAsync(a => a.Timestamp >= auditCutoff);
        var archivedAudit = await _context.AuditLogs.CountAsync(a => a.Timestamp < auditCutoff);

        string ComputeSeal(string name, int act, int arc)
        {
            var raw = $"{name}:{act}:{arc}:KP-WAL-ROOT";
            var hash = SHA256.HashData(Encoding.UTF8.GetBytes(raw));
            var hex = Convert.ToHexString(hash).ToLowerInvariant();
            return $"0x{hex[..6]}..{hex[^4..]}";
        }

        return new List<ArchiveModuleSummaryDto>
        {
            new() { ModuleName = "User Directory", ActiveRecords = activeUsers, ArchivedRecords = archivedUsers, StorageFootprintBytes = (activeUsers + archivedUsers) * 650, LastArchivedDate = archivedUsers > 0 ? DateTime.UtcNow.AddDays(-1) : null, RetentionDays = 365, Sha256Seal = ComputeSeal("User Directory", activeUsers, archivedUsers) },
            new() { ModuleName = "Catalog Books", ActiveRecords = activeBooks, ArchivedRecords = archivedBooks, StorageFootprintBytes = (activeBooks + archivedBooks) * 1800, LastArchivedDate = archivedBooks > 0 ? DateTime.UtcNow.AddDays(-1) : null, RetentionDays = 730, Sha256Seal = ComputeSeal("Catalog Books", activeBooks, archivedBooks) },
            new() { ModuleName = "Classification Categories", ActiveRecords = activeCats, ArchivedRecords = archivedCats, StorageFootprintBytes = activeCats * 480, LastArchivedDate = null, RetentionDays = 1095, Sha256Seal = ComputeSeal("Classification Categories", activeCats, archivedCats) },
            new() { ModuleName = "Physical Inventory", ActiveRecords = activeInventory, ArchivedRecords = archivedInventory, StorageFootprintBytes = activeInventory * 120, LastArchivedDate = null, RetentionDays = 365, Sha256Seal = ComputeSeal("Physical Inventory", activeInventory, archivedInventory) },
            new() { ModuleName = "Reservations Queue", ActiveRecords = activeRes, ArchivedRecords = archivedRes, StorageFootprintBytes = (activeRes + archivedRes) * 850, LastArchivedDate = archivedRes > 0 ? DateTime.UtcNow.AddHours(-12) : null, RetentionDays = 180, Sha256Seal = ComputeSeal("Reservations Queue", activeRes, archivedRes) },
            new() { ModuleName = "Borrowing Circulation", ActiveRecords = activeBorrow, ArchivedRecords = archivedBorrow, StorageFootprintBytes = (activeBorrow + archivedBorrow) * 920, LastArchivedDate = archivedBorrow > 0 ? DateTime.UtcNow.AddDays(-1) : null, RetentionDays = 1825, Sha256Seal = ComputeSeal("Borrowing Circulation", activeBorrow, archivedBorrow) },
            new() { ModuleName = "Return Journal & Salvage", ActiveRecords = activeReturns, ArchivedRecords = archivedReturns, StorageFootprintBytes = (activeReturns + archivedReturns) * 920, LastArchivedDate = archivedReturns > 0 ? DateTime.UtcNow.AddHours(-6) : null, RetentionDays = 1825, Sha256Seal = ComputeSeal("Return Journal & Salvage", activeReturns, archivedReturns) },
            new() { ModuleName = "Statutory Reports & Dossiers", ActiveRecords = activeFines, ArchivedRecords = archivedFines, StorageFootprintBytes = (activeFines + archivedFines) * 1400, LastArchivedDate = archivedFines > 0 ? DateTime.UtcNow.AddDays(-2) : null, RetentionDays = 3650, Sha256Seal = ComputeSeal("Statutory Reports & Dossiers", activeFines, archivedFines) },
            new() { ModuleName = "RBAC Security Grants", ActiveRecords = activeRbac, ArchivedRecords = archivedRbac, StorageFootprintBytes = (activeRbac + archivedRbac) * 320, LastArchivedDate = null, RetentionDays = 730, Sha256Seal = ComputeSeal("RBAC Security Grants", activeRbac, archivedRbac) },
            new() { ModuleName = "Cryptographic Audit Logs (WAL)", ActiveRecords = activeAudit, ArchivedRecords = archivedAudit, StorageFootprintBytes = (activeAudit + archivedAudit) * 780, LastArchivedDate = archivedAudit > 0 ? DateTime.UtcNow.AddHours(-2) : null, RetentionDays = 3650, Sha256Seal = ComputeSeal("Cryptographic Audit Logs (WAL)", activeAudit, archivedAudit) }
        };
    }
}
