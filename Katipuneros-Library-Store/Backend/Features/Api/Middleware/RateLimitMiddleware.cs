// [Layer: Features/Api/Middleware]
// RateLimitMiddleware.cs -- Granular sliding window rate limiter per client IP and session.
// Protects authentication, reservations, contact desk, and exports against brute-force, scraping, and flooding.
// Accommodates local development, LAN networks, campus NATs, and multi-user concurrent sessions.
// DO NOT put business validation logic or database calls here.

using System;
using System.Collections.Concurrent;
using System.Net;
using System.Net.Sockets;
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
            var ip = remoteIp?.ToString() ?? "unknown";
            var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
            var host = context.Request.Host.Host;

            // Map IPv4-mapped IPv6 (::ffff:127.0.0.1) back to IPv4 for proper detection
            var effectiveIp = remoteIp != null && remoteIp.IsIPv4MappedToIPv6 ? remoteIp.MapToIPv4() : remoteIp;
            var isLocalIp = IsPrivateOrLocal(effectiveIp);

            var isLocalHost = host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                              host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase) ||
                              host.Equals("::1", StringComparison.OrdinalIgnoreCase) ||
                              host.EndsWith(".local", StringComparison.OrdinalIgnoreCase) ||
                              host.EndsWith(".internal", StringComparison.OrdinalIgnoreCase);

            var isDevelopment = _environment != null && _environment.IsDevelopment();
            var isTrustedLocalOrDev = isDevelopment || isLocalHost || isLocalIp;

            // Classify endpoint category to enforce targeted rate limiting
            var category = GetEndpointCategory(path);
            var limit = GetEffectiveLimit(category, isTrustedLocalOrDev);

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

        private static bool IsPrivateOrLocal(IPAddress? address)
        {
            if (address == null) return true;
            if (IPAddress.IsLoopback(address)) return true;
            if (address.IsIPv4MappedToIPv6) address = address.MapToIPv4();

            if (address.AddressFamily == AddressFamily.InterNetwork)
            {
                var bytes = address.GetAddressBytes();
                // 10.0.0.0/8
                if (bytes[0] == 10) return true;
                // 172.16.0.0/12
                if (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31) return true;
                // 192.168.0.0/16
                if (bytes[0] == 192 && bytes[1] == 168) return true;
                // 127.0.0.0/8
                if (bytes[0] == 127) return true;
                // 169.254.0.0/16 (Link-local / APIPA)
                if (bytes[0] == 169 && bytes[1] == 254) return true;
            }
            else if (address.AddressFamily == AddressFamily.InterNetworkV6)
            {
                if (address.IsIPv6LinkLocal || address.IsIPv6SiteLocal) return true;
                var bytes = address.GetAddressBytes();
                // fc00::/7 (Unique Local Address)
                if ((bytes[0] & 0xFE) == 0xFC) return true;
            }

            return false;
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
