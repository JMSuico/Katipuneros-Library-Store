using System;
using System.Collections.Concurrent;
using System.Reflection;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Backend.Features.Data;
using Backend.Features.Data.Models;
using Backend.Features.DBInfrastructure.Cache;
using Backend.Features.Repositories.Implementations;

namespace Scratch.InfraTestRunner
{
    // A mock distributed cache for testing normal operation
    public class MockDistributedCache : IDistributedCache
    {
        public readonly ConcurrentDictionary<string, byte[]> Store = new();

        public byte[]? Get(string key) => Store.TryGetValue(key, out var val) ? val : null;
        public Task<byte[]?> GetAsync(string key, CancellationToken token = default) => Task.FromResult(Get(key));
        public void Set(string key, byte[] value, DistributedCacheEntryOptions options) => Store[key] = value;
        public Task SetAsync(string key, byte[] value, DistributedCacheEntryOptions options, CancellationToken token = default)
        {
            Store[key] = value;
            return Task.CompletedTask;
        }
        public void Refresh(string key) { }
        public Task RefreshAsync(string key, CancellationToken token = default) => Task.CompletedTask;
        public void Remove(string key) => Store.TryRemove(key, out _);
        public Task RemoveAsync(string key, CancellationToken token = default)
        {
            Remove(key);
            return Task.CompletedTask;
        }
    }

    // A faulty distributed cache simulating network/redis outage
    public class ThrowingDistributedCache : IDistributedCache
    {
        public byte[]? Get(string key) => throw new TimeoutException("Redis cluster unreachable");
        public Task<byte[]?> GetAsync(string key, CancellationToken token = default) => throw new TimeoutException("Redis cluster unreachable");
        public void Set(string key, byte[] value, DistributedCacheEntryOptions options) => throw new TimeoutException("Redis cluster unreachable");
        public Task SetAsync(string key, byte[] value, DistributedCacheEntryOptions options, CancellationToken token = default) => throw new TimeoutException("Redis cluster unreachable");
        public void Refresh(string key) => throw new TimeoutException("Redis cluster unreachable");
        public Task RefreshAsync(string key, CancellationToken token = default) => throw new TimeoutException("Redis cluster unreachable");
        public void Remove(string key) => throw new TimeoutException("Redis cluster unreachable");
        public Task RemoveAsync(string key, CancellationToken token = default) => throw new TimeoutException("Redis cluster unreachable");
    }

    public record TestItem(string Id, string Title, decimal Price);

    class Program
    {
        static async Task<int> Main(string[] args)
        {
            int passed = 0;
            int failed = 0;

            void AssertTrue(string name, bool condition, string detail)
            {
                if (condition)
                {
                    Console.WriteLine($"[C# RUNTIME PASS] {name}: {detail}");
                    passed++;
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"[C# RUNTIME FAIL] {name}: {detail}");
                    Console.ResetColor();
                    failed++;
                }
            }

            Console.WriteLine("==========================================================");
            Console.WriteLine(" RUNTIME VERIFICATION OF CACHE & READONLY DB CONTEXT");
            Console.WriteLine("==========================================================");

            // ----------------------------------------------------
            // 1. CacheService Hybrid + Serialization Test
            // ----------------------------------------------------
            var memoryCache = new MemoryCache(new MemoryCacheOptions());
            var mockDist = new MockDistributedCache();
            var cacheService = new CacheService(memoryCache, mockDist);

            var sample = new TestItem("book-123", "Noli Me Tangere", 499.00m);
            await cacheService.SetAsync("books:123", sample, TimeSpan.FromMinutes(10));

            // Verify distributed cache has serialized bytes
            bool distHasKey = mockDist.Store.ContainsKey("books:123");
            AssertTrue("CacheService.SetAsync writes to IDistributedCache", distHasKey, "Key books:123 found in distributed store");

            if (distHasKey)
            {
                var deserializedFromDist = JsonSerializer.Deserialize<TestItem>(mockDist.Store["books:123"]);
                AssertTrue("CacheService UTF-8 JSON Serialization", deserializedFromDist?.Title == "Noli Me Tangere", "Title match: " + deserializedFromDist?.Title);
            }

            // Verify GetAsync returns deserialized object
            var fetched = await cacheService.GetAsync<TestItem>("books:123");
            AssertTrue("CacheService.GetAsync reads correctly", fetched?.Id == "book-123", "Fetched Id: " + fetched?.Id);

            // ----------------------------------------------------
            // 2. CacheService Error Fallback Resilience
            // ----------------------------------------------------
            var throwingDist = new ThrowingDistributedCache();
            var fallbackMemory = new MemoryCache(new MemoryCacheOptions());
            var resilientCache = new CacheService(fallbackMemory, throwingDist);

            bool setSucceeded = false;
            try
            {
                await resilientCache.SetAsync("books:resilient", sample, TimeSpan.FromMinutes(5));
                setSucceeded = true;
            }
            catch { setSucceeded = false; }
            AssertTrue("CacheService.SetAsync Error Fallback", setSucceeded, "SetAsync did not throw despite Redis outage");

            bool getFallbackSucceeded = false;
            TestItem? fallbackItem = null;
            try
            {
                fallbackItem = await resilientCache.GetAsync<TestItem>("books:resilient");
                getFallbackSucceeded = (fallbackItem?.Title == "Noli Me Tangere");
            }
            catch { getFallbackSucceeded = false; }
            AssertTrue("CacheService.GetAsync Fallback to MemoryCache", getFallbackSucceeded, "Returned data from memory cache after distributed failure");

            bool removeFallbackSucceeded = false;
            try
            {
                await resilientCache.RemoveAsync("books:resilient");
                removeFallbackSucceeded = true;
            }
            catch { removeFallbackSucceeded = false; }
            AssertTrue("CacheService.RemoveAsync Error Fallback", removeFallbackSucceeded, "RemoveAsync handled Redis outage gracefully");

            // ----------------------------------------------------
            // 3. CacheService Prefix Invalidation
            // ----------------------------------------------------
            await cacheService.SetAsync("categories:history", "Philippine History", TimeSpan.FromMinutes(5));
            await cacheService.SetAsync("categories:science", "Natural Science", TimeSpan.FromMinutes(5));
            await cacheService.SetAsync("authors:rizal", "Jose Rizal", TimeSpan.FromMinutes(5));

            await cacheService.RemoveByPrefixAsync("categories:");
            var catHist = await cacheService.GetAsync<string>("categories:history");
            var authRizal = await cacheService.GetAsync<string>("authors:rizal");
            AssertTrue("CacheService.RemoveByPrefixAsync", catHist == null && authRizal == "Jose Rizal", "categories:* evicted, authors:rizal preserved");

            // ----------------------------------------------------
            // 4. ReadOnlyAppDbContext Mutation Guards
            // ----------------------------------------------------
            var optionsBuilder = new DbContextOptionsBuilder<ReadOnlyAppDbContext>();
            optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=dummy;Trusted_Connection=True;");
            using var readOnlyContext = new ReadOnlyAppDbContext(optionsBuilder.Options);

            bool saveChangesThrows = false;
            try
            {
                readOnlyContext.SaveChanges();
            }
            catch (InvalidOperationException)
            {
                saveChangesThrows = true;
            }
            AssertTrue("ReadOnlyAppDbContext.SaveChanges() Guard", saveChangesThrows, "Throws InvalidOperationException on SaveChanges()");

            bool saveChangesBoolThrows = false;
            try
            {
                readOnlyContext.SaveChanges(true);
            }
            catch (InvalidOperationException)
            {
                saveChangesBoolThrows = true;
            }
            AssertTrue("ReadOnlyAppDbContext.SaveChanges(bool) Guard", saveChangesBoolThrows, "Throws InvalidOperationException on SaveChanges(bool)");

            bool saveChangesAsyncThrows = false;
            try
            {
                await readOnlyContext.SaveChangesAsync();
            }
            catch (InvalidOperationException)
            {
                saveChangesAsyncThrows = true;
            }
            AssertTrue("ReadOnlyAppDbContext.SaveChangesAsync() Guard", saveChangesAsyncThrows, "Throws InvalidOperationException on SaveChangesAsync()");

            bool saveChangesAsyncBoolThrows = false;
            try
            {
                await readOnlyContext.SaveChangesAsync(true);
            }
            catch (InvalidOperationException)
            {
                saveChangesAsyncBoolThrows = true;
            }
            AssertTrue("ReadOnlyAppDbContext.SaveChangesAsync(bool, CancellationToken) Guard", saveChangesAsyncBoolThrows, "Throws InvalidOperationException on SaveChangesAsync(bool, ct)");

            // QueryTrackingBehavior
            var tracking = readOnlyContext.ChangeTracker.QueryTrackingBehavior;
            AssertTrue("ReadOnlyAppDbContext QueryTrackingBehavior.NoTracking", tracking == QueryTrackingBehavior.NoTracking, "Tracking behavior is: " + tracking);

            // ----------------------------------------------------
            // 5. Repository Read Offloading Injection Inspection
            // ----------------------------------------------------
            var bookRepoCtor = typeof(BookRepository).GetConstructors();
            bool bookHasReadOnlyParam = false;
            foreach (var ctor in bookRepoCtor)
            {
                foreach (var p in ctor.GetParameters())
                {
                    if (p.ParameterType == typeof(ReadOnlyAppDbContext))
                    {
                        bookHasReadOnlyParam = true;
                    }
                }
            }
            AssertTrue("BookRepository accepts ReadOnlyAppDbContext", bookHasReadOnlyParam, "Constructor parameter ReadOnlyAppDbContext detected");

            var catRepoCtor = typeof(CategoryRepository).GetConstructors();
            bool catHasReadOnlyParam = false;
            foreach (var ctor in catRepoCtor)
            {
                foreach (var p in ctor.GetParameters())
                {
                    if (p.ParameterType == typeof(ReadOnlyAppDbContext))
                    {
                        catHasReadOnlyParam = true;
                    }
                }
            }
            AssertTrue("CategoryRepository accepts ReadOnlyAppDbContext", catHasReadOnlyParam, "Constructor parameter ReadOnlyAppDbContext detected");

            // Verify fields in repositories
            var bookReadOnlyField = typeof(BookRepository).GetField("_readOnlyContext", BindingFlags.NonPublic | BindingFlags.Instance);
            AssertTrue("BookRepository has _readOnlyContext field", bookReadOnlyField != null, "Field _readOnlyContext exists");

            var catReadOnlyField = typeof(CategoryRepository).GetField("_readOnlyContext", BindingFlags.NonPublic | BindingFlags.Instance);
            AssertTrue("CategoryRepository has _readOnlyContext field", catReadOnlyField != null, "Field _readOnlyContext exists");

            Console.WriteLine("----------------------------------------------------------");
            Console.WriteLine($"C# Runtime Checks Summary: {passed} Passed, {failed} Failed");

            return failed == 0 ? 0 : 1;
        }
    }
}
