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
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.DBInfrastructure.Cache;
using Backend.Features.Helpers.Infrastructure;
using Backend.Features.Helpers.Validation;
using Backend.Features.Repositories.Implementations;
using Backend.Features.Services.Implementations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

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

            // ----------------------------------------------------
            // 6. Adversarial Security, Sanitizer, CSV & Fine Tests
            // ----------------------------------------------------
            AssertTrue("InputSanitizer handles null/whitespace", InputSanitizer.SanitizeText(null) == string.Empty && InputSanitizer.SanitizeText("   ") == string.Empty, "Null/whitespace sanitized cleanly");
            var xssClean = InputSanitizer.SanitizeText("<script>alert('xss')</script><b>Katipunan</b>");
            AssertTrue("InputSanitizer strips script & HTML tags", !xssClean.Contains("<script>") && !xssClean.Contains("<b>") && xssClean.Contains("Katipunan"), $"Sanitized: {xssClean}");
            var regexMeta = InputSanitizer.SanitizeText("[test(.*+\\b%_");
            AssertTrue("InputSanitizer preserves safe regex metacharacters without crashing", regexMeta == "[test(.*+\\b%_", $"Result: {regexMeta}");
            var unicodeText = InputSanitizer.SanitizeText("José Rizal — ₱500");
            AssertTrue("InputSanitizer handles Unicode safely", unicodeText.Contains("José") && unicodeText.Contains("₱500"), $"Result: {unicodeText}");

            // CSV formula injection & RFC-4180 quoting
            var formulaCell = CsvExportHelper.EscapeCell("=CMD|'/C calc'!A0");
            var quoteCell = CsvExportHelper.EscapeCell("He said \"hello\"");
            AssertTrue("CsvExportHelper neutralizes leading formula char", formulaCell == "\"'=CMD|'/C calc'!A0\"", $"Escaped: {formulaCell}");
            AssertTrue("CsvExportHelper escapes embedded quotes", quoteCell == "\"He said \"\"hello\"\"\"", $"Escaped: {quoteCell}");

            // FineCalculationHelper boundary & cap checks
            var baseTime = new DateTime(2026, 10, 10, 12, 0, 0, DateTimeKind.Utc);
            AssertTrue("FineCalculationHelper zero on on-time return", FineCalculationHelper.ComputeOverdueFine(baseTime, baseTime.AddHours(-2)) == 0m, "On-time return = 0.00");
            int custGrace = FineCalculationHelper.ComputeGracePeriodDays(UserRole.Customer, "Student", 24);
            AssertTrue("FineCalculationHelper grace period applied for Customer", FineCalculationHelper.ComputeOverdueFine(baseTime, baseTime.AddDays(1), graceDays: custGrace, useCeiling: true) == 0m, "1 day overdue within 24h grace = 0.00");
            AssertTrue("FineCalculationHelper overdue fine capped at 500", FineCalculationHelper.ComputeOverdueFine(baseTime, baseTime.AddDays(100), graceDays: 0, useCeiling: true) == 500.00m, "100 days overdue capped at 500.00");
            AssertTrue("FineCalculationHelper damaged & lost penalties", FineCalculationHelper.ComputeConditionPenalty(true, false, null) == 280.00m && FineCalculationHelper.ComputeConditionPenalty(false, true, null) == 650.00m, "Damaged=280, Lost=650");

            // AuditHelper SHA-256 chain tamper detection
            var ts1 = new DateTime(2026, 10, 10, 0, 0, 0, DateTimeKind.Utc);
            var h1 = AuditHelper.ComputeHash(AuditHelper.GenesisHash, "CHECKOUT", "Book", "KP-TXN-1", ts1);
            var h2 = AuditHelper.ComputeHash(h1, "RETURN", "Book", "KP-TXN-1", ts1.AddMinutes(5));
            var h2Tampered = AuditHelper.ComputeHash(h1, "RETURN", "Book", "KP-TXN-2", ts1.AddMinutes(5));
            AssertTrue("AuditHelper detects payload tampering", h1.Length == 64 && h2 != h2Tampered, "SHA-256 chain detects 1-char payload mutation");

            // AltchaService PoW + SecretConfiguration enforcement
            var invalidCfg = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Server=localhost;Database=Test;",
                ["Jwt:SecretKey"] = "CHANGE_ME"
            }).Build();
            bool secretThrew = false;
            try { SecretConfiguration.ValidateRequired(invalidCfg); } catch (InvalidOperationException) { secretThrew = true; }
            AssertTrue("SecretConfiguration rejects placeholder & missing Altcha:HmacSecret", secretThrew, "Rejected invalid/missing secrets");

            var validCfg = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Server=localhost;Database=Test;",
                ["Jwt:SecretKey"] = "TestJwtSigningKey_AtLeast32CharsLong!",
                ["Altcha:HmacSecret"] = "TestAltchaHmacSecret_AtLeast32Chars!"
            }).Build();
            SecretConfiguration.ValidateRequired(validCfg);
            var altchaSvc = new AltchaService(validCfg, NullLogger<AltchaService>.Instance);
            var challenge = altchaSvc.GenerateChallenge();
            var badVerify = altchaSvc.VerifySolution("not-valid-base64!!!");
            AssertTrue("AltchaService rejects malformed payload", !badVerify.Success && !badVerify.IsValidFormat, badVerify.Message);
            string? solvedPayload = null;
            for (int n = 2000; n <= 25000; n++)
            {
                var candidate = Convert.ToHexStringLower(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes($"{challenge.Salt}{n}")));
                if (candidate == challenge.Challenge)
                {
                    var json = JsonSerializer.Serialize(new { algorithm = challenge.Algorithm, challenge = challenge.Challenge, number = n, salt = challenge.Salt, signature = challenge.Signature });
                    solvedPayload = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(json));
                    break;
                }
            }
            var goodVerify = solvedPayload != null ? altchaSvc.VerifySolution(solvedPayload) : (Success: false, IsValidFormat: false, Message: "Unsolved");
            AssertTrue("AltchaService verifies valid PoW challenge", goodVerify.Success, goodVerify.Message);

            // AltchaService replay attack & short secret rejection
            var replayVerify = solvedPayload != null ? altchaSvc.VerifySolution(solvedPayload) : (Success: true, IsValidFormat: true, Message: "Skipped");
            AssertTrue("AltchaService rejects replayed PoW challenge", !replayVerify.Success, replayVerify.Message);

            var shortSecretCfg = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Server=localhost;Database=Test;",
                ["Jwt:SecretKey"] = "too-short-secret",
                ["Altcha:HmacSecret"] = "also-too-short"
            }).Build();
            bool shortSecretThrew = false;
            try { SecretConfiguration.ValidateRequired(shortSecretCfg); } catch (InvalidOperationException) { shortSecretThrew = true; }
            AssertTrue("SecretConfiguration rejects < 32-byte keys", shortSecretThrew, "Short symmetric secrets rejected");

            // ImageInputValidator XSS / SVG / Oversized / Safe URL checks
            bool imgXssRejected = !ImageInputValidator.TryValidateImage("javascript:alert(1)", out _);
            bool imgSvgRejected = !ImageInputValidator.TryValidateImage("data:image/svg+xml;base64,PHN2Zz4=", out _);
            bool imgTagRejected = !ImageInputValidator.TryValidateImage("<script>alert(1)</script>", out _);
            bool imgOversizeRejected = !ImageInputValidator.TryValidateImage("data:image/png;base64," + new string('A', 2_900_000), out _);
            bool imgValidHttps = ImageInputValidator.TryValidateImage("https://katipuneros.example.com/covers/book.png", out _);
            bool imgValidBase64 = ImageInputValidator.TryValidateImage("data:image/png;base64,iVBORw0KGgo=", out _);
            AssertTrue("ImageInputValidator blocks XSS/SVG/oversized and accepts safe image URLs",
                imgXssRejected && imgSvgRejected && imgTagRejected && imgOversizeRejected && imgValidHttps && imgValidBase64,
                "XSS/SVG/Oversize blocked; HTTPS + safe base64 PNG allowed");

            // DateTimeNormalizationHelper Unspecified / Local / DayBounds checks
            var unspecDate = new DateTime(2026, 11, 24, 15, 30, 0, DateTimeKind.Unspecified);
            var normalizedUtc = DateTimeNormalizationHelper.ToUtc(unspecDate);
            var (dayStart, dayEnd) = DateTimeNormalizationHelper.GetUtcDayRange(unspecDate);
            AssertTrue("DateTimeNormalizationHelper forces UTC Kind & half-open day bounds",
                normalizedUtc.Kind == DateTimeKind.Utc &&
                dayStart.Kind == DateTimeKind.Utc &&
                dayEnd.Kind == DateTimeKind.Utc &&
                (dayEnd - dayStart) == TimeSpan.FromDays(1),
                $"Start={dayStart:o}, End={dayEnd:o}");

            // Cache null poisoning guard
            await cacheService.SetAsync<string>("neg:null", null!, TimeSpan.FromMinutes(5));
            AssertTrue("CacheService skips null values (no negative cache poisoning)", await cacheService.GetAsync<string>("neg:null") == null, "Null not cached");

            Console.WriteLine("----------------------------------------------------------");
            Console.WriteLine($"C# Runtime Checks Summary: {passed} Passed, {failed} Failed");

            return failed == 0 ? 0 : 1;
        }
    }
}
