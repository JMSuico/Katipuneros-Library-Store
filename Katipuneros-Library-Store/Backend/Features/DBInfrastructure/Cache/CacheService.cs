// [Layer: Features/DBInfrastructure/Cache]
// CacheService.cs -- In-memory caching implementation using Microsoft.Extensions.Caching.Memory.
// Provides fast memory caching for catalog and dashboard reads with TTL eviction.
// DO NOT store PII, raw passwords, or authentication secrets in cache.

using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;

namespace Backend.Features.DBInfrastructure.Cache
{
    public class CacheService : ICacheService
    {
        private readonly IMemoryCache _memoryCache;
        private static readonly ConcurrentDictionary<string, bool> _activeKeys = new();

        public CacheService(IMemoryCache memoryCache)
        {
            _memoryCache = memoryCache;
        }

        public Task<T?> GetAsync<T>(string key)
        {
            if (_memoryCache.TryGetValue(key, out T? value))
            {
                return Task.FromResult(value);
            }

            return Task.FromResult<T?>(default);
        }

        public Task SetAsync<T>(string key, T value, TimeSpan ttl)
        {
            if (value == null) return Task.CompletedTask;

            var options = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ttl
            };

            options.RegisterPostEvictionCallback((k, _, _, _) =>
            {
                _activeKeys.TryRemove(k.ToString() ?? string.Empty, out _);
            });

            _memoryCache.Set(key, value, options);
            _activeKeys.TryAdd(key, true);

            return Task.CompletedTask;
        }

        public Task RemoveAsync(string key)
        {
            _memoryCache.Remove(key);
            _activeKeys.TryRemove(key, out _);
            return Task.CompletedTask;
        }

        public Task RemoveByPrefixAsync(string prefix)
        {
            foreach (var key in _activeKeys.Keys)
            {
                if (key.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                {
                    _memoryCache.Remove(key);
                    _activeKeys.TryRemove(key, out _);
                }
            }

            return Task.CompletedTask;
        }
    }
}
