// [Layer: Features/DBInfrastructure/Cache]
// CacheService.cs -- Hybrid In-Memory and Distributed Redis Cache implementation.
using System;
using System.Collections.Concurrent;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace Backend.Features.DBInfrastructure.Cache
{
    public class CacheService : ICacheService
    {
        private readonly IMemoryCache _memoryCache;
        private readonly IDistributedCache? _distributedCache;
        private readonly ILogger<CacheService>? _logger;
        private static readonly ConcurrentDictionary<string, bool> _activeKeys = new();

        public CacheService(
            IMemoryCache memoryCache,
            IDistributedCache? distributedCache = null,
            ILogger<CacheService>? logger = null)
        {
            _memoryCache = memoryCache;
            _distributedCache = distributedCache;
            _logger = logger;
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            if (_distributedCache != null)
            {
                try
                {
                    var bytes = await _distributedCache.GetAsync(key);
                    if (bytes != null && bytes.Length > 0)
                    {
                        return JsonSerializer.Deserialize<T>(bytes);
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Distributed cache read failed for key {Key}. Falling back to memory cache.", key);
                }
            }

            if (_memoryCache.TryGetValue(key, out T? value))
            {
                return value;
            }

            return default;
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan ttl)
        {
            if (value == null) return;

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

            if (_distributedCache != null)
            {
                try
                {
                    var bytes = JsonSerializer.SerializeToUtf8Bytes(value);
                    var distOptions = new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = ttl
                    };
                    await _distributedCache.SetAsync(key, bytes, distOptions);
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Distributed cache write failed for key {Key}.", key);
                }
            }
        }

        public async Task RemoveAsync(string key)
        {
            _memoryCache.Remove(key);
            _activeKeys.TryRemove(key, out _);

            if (_distributedCache != null)
            {
                try
                {
                    await _distributedCache.RemoveAsync(key);
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Distributed cache remove failed for key {Key}.", key);
                }
            }
        }

        public async Task RemoveByPrefixAsync(string prefix)
        {
            foreach (var key in _activeKeys.Keys)
            {
                if (key.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                {
                    await RemoveAsync(key);
                }
            }
        }
    }
}
