// [Layer: Features/Api/Middleware]
// RateLimitMiddleware.cs -- Granular sliding window rate limiter per client IP.
// Protects authentication, reservations, contact desk, and exports against brute-force, scraping, and flooding.
// DO NOT put business validation logic or database calls here.

using System;
using System.Collections.Concurrent;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Responses;
using Microsoft.AspNetCore.Http;

namespace Backend.Features.Api.Middleware
{
    public class RateLimitMiddleware
    {
        private readonly RequestDelegate _next;
        private static readonly ConcurrentDictionary<string, ClientRequestHistory> _clients = new();

        // Standard production limits (requests per 60-second window)
        private const int MaxGeneralRequestsPerMinute = 60;
        private const int MaxAuthRequestsPerMinute = 15;
        private const int MaxContactRequestsPerMinute = 5;
        private const int MaxReservationRequestsPerMinute = 20;
        private const int MaxExportRequestsPerMinute = 10;

        private class ClientRequestHistory
        {
            public int RequestCount;
            public DateTime WindowStart;
        }

        public RateLimitMiddleware(RequestDelegate next) =>
            _next = next;

        public async Task InvokeAsync(HttpContext context)
        {
            // Never rate-limit CORS preflight OPTIONS requests
            if (HttpMethods.IsOptions(context.Request.Method))
            {
                await _next(context);
                return;
            }

            var remoteIp = context.Connection.RemoteIpAddress;
            var ip = remoteIp?.ToString() ?? "unknown";
            var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
            var host = context.Request.Host.Host;

            // Map IPv4-mapped IPv6 (::ffff:127.0.0.1) back to IPv4 for proper loopback detection
            var effectiveIp = remoteIp != null && remoteIp.IsIPv4MappedToIPv6 ? remoteIp.MapToIPv4() : remoteIp;
            var isLoopback = (effectiveIp != null && IPAddress.IsLoopback(effectiveIp)) ||
                             ip == "unknown" ||
                             ip == "127.0.0.1" ||
                             ip == "::1" ||
                             ip.Contains("127.0.0.1") ||
                             host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                             host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase);

            // Classify endpoint category to enforce targeted rate limiting
            var category = GetEndpointCategory(path);
            var limit = GetEffectiveLimit(category, isLoopback);
            var clientKey = $"{ip}:{category}";

            var now = DateTime.UtcNow;
            var history = _clients.GetOrAdd(clientKey, _ => new ClientRequestHistory
            {
                RequestCount = 0,
                WindowStart = now
            });

            bool isExceeded;
            lock (history)
            {
                if ((now - history.WindowStart).TotalSeconds > 60)
                {
                    history.RequestCount = 1;
                    history.WindowStart = now;
                }
                else
                {
                    history.RequestCount++;
                }

                int remaining = Math.Max(0, limit - history.RequestCount);

                // Set informative rate limit headers
                context.Response.Headers["X-RateLimit-Limit"] = limit.ToString();
                context.Response.Headers["X-RateLimit-Remaining"] = remaining.ToString();

                isExceeded = history.RequestCount > limit;
            }

            if (isExceeded)
            {
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.ContentType = "application/json";
                context.Response.Headers["Retry-After"] = "60";

                var response = ApiResponse<object>.Fail(
                    $"Rate limit exceeded for {category}. Please wait 60 seconds before retrying.",
                    new[] { $"Maximum allowed requests ({limit}/min) exceeded for your IP address on {category} endpoints." }
                );

                var json = JsonSerializer.Serialize(response);
                await context.Response.WriteAsync(json);
                return;
            }

            await _next(context);
        }

        private static string GetEndpointCategory(string path) =>
            path switch
            {
                var p when p.Contains("/api/auth/") => "Authentication",
                var p when p.Contains("/api/contact") || p.Contains("/api/feedback") => "InquiryDesk",
                var p when p.Contains("/api/reservations") || p.Contains("/api/borrowings") => "CirculationHold",
                var p when p.Contains("/export") => "DataExport",
                _ => "GeneralCatalog"
            };

        private static int GetEffectiveLimit(string category, bool isLoopback) =>
            category switch
            {
                "Authentication" => isLoopback ? 1000 : MaxAuthRequestsPerMinute,
                "InquiryDesk" => isLoopback ? 300 : MaxContactRequestsPerMinute,
                "CirculationHold" => isLoopback ? 1000 : MaxReservationRequestsPerMinute,
                "DataExport" => isLoopback ? 500 : MaxExportRequestsPerMinute,
                _ => isLoopback ? 5000 : MaxGeneralRequestsPerMinute
            };
    }
}
