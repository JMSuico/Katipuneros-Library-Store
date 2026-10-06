// [Layer: Features/Api/Middleware]
// IdempotencyMiddleware.cs -- Request guard detecting duplicate transaction payloads.
// Inspects Idempotency-Key header on mutating requests to prevent duplicate charges.
// DO NOT put business workflow rules or database queries here.

using System;
using System.Collections.Concurrent;
using System.Net;
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
            if (HttpMethods.IsPost(context.Request.Method) || HttpMethods.IsPut(context.Request.Method))
            {
                if (context.Request.Headers.TryGetValue("Idempotency-Key", out var rawKey) && !string.IsNullOrWhiteSpace(rawKey))
                {
                    var idempotencyKey = rawKey.ToString();
                    var now = DateTime.UtcNow;

                    // Clean up keys older than 15 minutes periodically
                    if (_processedKeys.Count > 1000)
                    {
                        foreach (var kv in _processedKeys)
                        {
                            if ((now - kv.Value).TotalMinutes > 15)
                            {
                                _processedKeys.TryRemove(kv.Key, out _);
                            }
                        }
                    }

                    if (_processedKeys.TryGetValue(idempotencyKey, out var timestamp))
                    {
                        if ((now - timestamp).TotalMinutes < 15)
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
                    }

                    _processedKeys[idempotencyKey] = now;
                }
            }

            await _next(context);
        }
    }
}
