// [Layer: Features/Api/Middleware]
// IdempotencyMiddleware.cs -- Request guard detecting duplicate transaction payloads.
// Inspects Idempotency-Key header on mutating requests to prevent duplicate charges.
// DO NOT put business workflow rules or database queries here.

using System;
using System.Collections.Concurrent;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Responses;
using Microsoft.AspNetCore.Http;

namespace Backend.Features.Api.Middleware
{
    public class IdempotencyMiddleware
    {
        private readonly RequestDelegate _next;
        private static readonly ConcurrentDictionary<string, DateTime> _processedKeys = new();

        public IdempotencyMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Only inspect mutating HTTP POST or PUT requests
            if ((HttpMethods.IsPost(context.Request.Method) || HttpMethods.IsPut(context.Request.Method)) &&
                context.Request.Headers.TryGetValue("Idempotency-Key", out var rawKey) &&
                !string.IsNullOrWhiteSpace(rawKey))
            {
                var idempotencyKey = rawKey.ToString().Trim();
                var now = DateTime.UtcNow;

                // Evict stale keys older than 15 minutes
                if (_processedKeys.Count > 1000)
                {
                    foreach (var kv in _processedKeys)
                    {
                        if ((now - kv.Value).TotalMinutes >= 15)
                        {
                            _processedKeys.TryRemove(kv.Key, out _);
                        }
                    }
                }

                var method = context.Request.Method.ToUpperInvariant();
                var path = context.Request.Path.Value?.ToLowerInvariant() ?? "/";
                var caller = ResolveCallerScope(context);
                var scopedKey = $"{method}:{path}:{caller}:{idempotencyKey}";

                bool acquired = _processedKeys.TryAdd(scopedKey, now);
                if (!acquired && _processedKeys.TryGetValue(scopedKey, out var existingTimestamp))
                {
                    if ((now - existingTimestamp).TotalMinutes >= 15)
                    {
                        acquired = _processedKeys.TryUpdate(scopedKey, now, existingTimestamp);
                    }
                }

                if (!acquired)
                {
                    context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                    context.Response.ContentType = "application/json";

                    var errorResponse = ApiResponse<object>.Fail(
                        "Duplicate transaction request detected.",
                        new[] { $"A request with Idempotency-Key '{idempotencyKey}' was already processed recently." }
                    );

                    var json = JsonSerializer.Serialize(errorResponse);
                    await context.Response.WriteAsync(json);
                    return;
                }

                try
                {
                    await _next(context);
                    if (context.Response.StatusCode >= 400)
                    {
                        _processedKeys.TryRemove(scopedKey, out _);
                    }
                }
                catch
                {
                    _processedKeys.TryRemove(scopedKey, out _);
                    throw;
                }
                return;
            }

            await _next(context);
        }

        private static string ResolveCallerScope(HttpContext context)
        {
            var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? context.User?.FindFirst("sub")?.Value;
            if (!string.IsNullOrWhiteSpace(userId))
                return $"user:{userId}";

            var authHeader = context.Request.Headers.Authorization.ToString();
            if (!string.IsNullOrWhiteSpace(authHeader) &&
                authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) &&
                authHeader.Length > 20)
            {
                var tokenHash = Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(authHeader)))[..16];
                return $"token:{tokenHash}";
            }

            var remoteIp = context.Connection.RemoteIpAddress;
            var effectiveIp = remoteIp != null && remoteIp.IsIPv4MappedToIPv6 ? remoteIp.MapToIPv4() : remoteIp;
            return $"ip:{effectiveIp?.ToString() ?? "unknown"}";
        }
    }
}
