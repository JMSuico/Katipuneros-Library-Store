// [Layer: Features/Api/Middleware]
// RateLimitMiddleware.cs -- In-memory sliding window rate limiter per client IP.
// Protects public-facing endpoints against brute-force and request flooding.
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
        private const int MaxRequestsPerMinute = 60;
        private const int MaxAuthRequestsPerMinute = 15;

        private class ClientRequestHistory
        {
            public int RequestCount;
            public DateTime WindowStart;
        }

        public RateLimitMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;

            // Stricter rate limits on authentication and public contact form
            var isSensitiveEndpoint = path.Contains("/api/auth/") || path.Contains("/api/contact");
            var limit = isSensitiveEndpoint ? MaxAuthRequestsPerMinute : MaxRequestsPerMinute;
            var clientKey = $"{ip}:{isSensitiveEndpoint}";

            var now = DateTime.UtcNow;
            var history = _clients.GetOrAdd(clientKey, _ => new ClientRequestHistory
            {
                RequestCount = 0,
                WindowStart = now
            });

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

                if (history.RequestCount > limit)
                {
                    context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                    context.Response.ContentType = "application/json";
                    context.Response.Headers["Retry-After"] = "60";

                    var response = ApiResponse<object>.Fail(
                        "Rate limit exceeded. Please wait 60 seconds before retrying.",
                        new[] { $"Maximum allowed requests ({limit}/min) exceeded for your IP address." }
                    );

                    var json = JsonSerializer.Serialize(response);
                    return;
                }
            }

            await _next(context);
        }
    }
}
