// [Layer: Features/DBInfrastructure/Cache]
// ICacheService.cs -- Contract for application caching infrastructure.
// Defines asynchronous get, set, remove, and eviction operations.
// DO NOT put business logic or data mapping here.

using System;
using System.Threading.Tasks;

namespace Backend.Features.DBInfrastructure.Cache
{
    public interface ICacheService
    {
        Task<T?> GetAsync<T>(string key);
        Task SetAsync<T>(string key, T value, TimeSpan ttl);
        Task RemoveAsync(string key);
        Task RemoveByPrefixAsync(string prefix);
    }
}
