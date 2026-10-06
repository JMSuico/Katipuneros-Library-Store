// [Layer: Repositories/Interfaces]
// ISettingsRepository.cs -- Repository contract for system settings and CIDR subnets.
// EF Core queries ONLY -- no business rules or HTTP concerns.

using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data.Models;

namespace Backend.Features.Repositories.Interfaces;

public interface ISettingsRepository
{
    Task<List<SystemSetting>> GetAllSettingsAsync();
    Task<SystemSetting?> GetByKeyAsync(string key);
    Task UpsertSettingAsync(string key, string value, string category, string description, string updatedBy);
    Task<List<CidrSubnet>> GetAllCidrSubnetsAsync();
    Task<CidrSubnet> AddCidrSubnetAsync(CidrSubnet subnet);
    Task DeleteCidrSubnetsAsync(List<Guid> ids);
    Task<int> GetActiveCustomerCountAsync();
    Task<int> GetCirculatingTitlesCountAsync();
    Task<int> GetAuditLogsCountAsync();
    Task<int> GetAuditLogs24hCountAsync();
    Task<int> GetActiveSuperAdminCountAsync();
    Task<List<ArchiveModuleSummaryDto>> GetLiveArchiveSummariesAsync();
}
