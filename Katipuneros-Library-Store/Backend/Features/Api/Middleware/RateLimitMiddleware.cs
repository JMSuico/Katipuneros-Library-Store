// [Layer: Features/Api/Middleware]
// RateLimitMiddleware.cs -- Granular sliding window rate limiter per client IP and session.
// Protects authentication, reservations, contact desk, and exports against brute-force, scraping, and flooding.
// Accommodates local development, LAN networks, campus NATs, and multi-user concurrent sessions.
// DO NOT put business validation logic or database calls here.

using System;
using System.Collections.Concurrent;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Responses;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace Backend.Features.Api.Middleware
{
    public class RateLimitMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IWebHostEnvironment? _environment;
        private static readonly ConcurrentDictionary<string, ClientRequestHistory> _clients = new();

        // Standard production baseline limits (requests per 60-second window)
        // Sized appropriately for shared NAT gateways, library campuses, and multi-user kiosks
        private const int MaxGeneralRequestsPerMinute = 600;
        private const int MaxAuthRequestsPerMinute = 120;
        private const int MaxProfileRequestsPerMinute = 300;
        private const int MaxContactRequestsPerMinute = 30;
        private const int MaxReservationRequestsPerMinute = 120;
        private const int MaxExportRequestsPerMinute = 60;

        private class ClientRequestHistory
        {
            public int RequestCount;
            public DateTime WindowStart;
        }

        public RateLimitMiddleware(RequestDelegate next, IWebHostEnvironment? environment = null)
        {
            _next = next;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Never rate-limit CORS preflight OPTIONS requests
            if (HttpMethods.IsOptions(context.Request.Method))
            {
                await _next(context);
                return;
            }

            var remoteIp = context.Connection.RemoteIpAddress;
            var effectiveIp = remoteIp != null && remoteIp.IsIPv4MappedToIPv6 ? remoteIp.MapToIPv4() : remoteIp;
            var ip = effectiveIp?.ToString() ?? "unknown";
            var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;

            // Never trust X-Forwarded-For private IPs or Host header suffixes outside Development
            var isDevelopment = _environment != null && _environment.IsDevelopment();

            // Classify endpoint category to enforce targeted rate limiting
            var category = GetEndpointCategory(path);
            var limit = GetEffectiveLimit(category, isDevelopment);

            // Isolate authenticated users by token suffix so multiple users behind the same IP/NAT don't lock each other out
            string clientKey;
            var authHeader = context.Request.Headers.Authorization.ToString();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) && authHeader.Length > 20)
            {
                var tokenSuffix = authHeader[^12..];
                clientKey = $"{ip}:user-{tokenSuffix}:{category}";
            }
            else
            {
                clientKey = $"{ip}:{category}";
            }

            var now = DateTime.UtcNow;

            if (_clients.Count > 1000)
            {
                foreach (var kv in _clients)
                {
                    bool expired;
                    lock (kv.Value)
                    {
                        expired = (now - kv.Value.WindowStart).TotalSeconds > 120;
                    }
                    if (expired)
                    {
                        _clients.TryRemove(kv.Key, out _);
                    }
                }
            }

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
                    new[] { $"Maximum allowed requests ({limit}/min) exceeded for your client on {category} endpoints." }
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
                var p when p.Contains("/api/auth/login") || p.Contains("/api/auth/register") || p.Contains("/api/auth/change-password") => "Authentication",
                var p when p.Contains("/api/auth/me") || p.Contains("/api/auth/profile") => "AccountProfile",
                var p when p.Contains("/api/contact") || p.Contains("/api/feedback") => "InquiryDesk",
                var p when p.Contains("/api/reservations") || p.Contains("/api/borrowings") => "CirculationHold",
                var p when p.Contains("/export") => "DataExport",
                _ => "GeneralCatalog"
            };

        private static int GetEffectiveLimit(string category, bool isTrustedLocalOrDev) =>
            category switch
            {
                "Authentication" => isTrustedLocalOrDev ? 2000 : MaxAuthRequestsPerMinute,
                "AccountProfile" => isTrustedLocalOrDev ? 5000 : MaxProfileRequestsPerMinute,
                "InquiryDesk" => isTrustedLocalOrDev ? 500 : MaxContactRequestsPerMinute,
                "CirculationHold" => isTrustedLocalOrDev ? 3000 : MaxReservationRequestsPerMinute,
                "DataExport" => isTrustedLocalOrDev ? 1000 : MaxExportRequestsPerMinute,
                _ => isTrustedLocalOrDev ? 10000 : MaxGeneralRequestsPerMinute
            };
    }
}
