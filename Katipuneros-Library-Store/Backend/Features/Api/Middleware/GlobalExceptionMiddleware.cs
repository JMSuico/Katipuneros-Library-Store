// [Layer: Features/Api/Middleware]
// GlobalExceptionMiddleware.cs -- Catches unhandled exceptions and formats standardized error payloads.
// Formats responses as ApiErrorResponse.
// DO NOT put application business logic or database queries here.

using System.Net;
using System.Text.Json;
using Backend.Features.Api.DTOs.Responses;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

namespace Backend.Features.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IHostEnvironment environment) =>
        (_next, _logger, _environment) = (next, logger, environment);

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency conflict intercepted by GlobalExceptionMiddleware.");
            await HandleExceptionAsync(
                context,
                HttpStatusCode.Conflict,
                "The record was modified by another user or process. Please refresh and try again.",
                ex,
                includeExceptionDetails: false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception intercepted by GlobalExceptionMiddleware: {Message}", ex.Message);
            await HandleExceptionAsync(
                context,
                HttpStatusCode.InternalServerError,
                "An unexpected internal server error occurred. Please try again later.",
                ex,
                includeExceptionDetails: true);
        }
    }

    private Task HandleExceptionAsync(
        HttpContext context,
        HttpStatusCode statusCode,
        string message,
        Exception exception,
        bool includeExceptionDetails)
    {
        if (context.Response.HasStarted)
        {
            _logger.LogWarning("Response already started; skipping error payload write for TraceId {TraceId}.", context.TraceIdentifier);
            return Task.CompletedTask;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new ApiErrorResponse
        {
            Success = false,
            Error = message,
            Details = includeExceptionDetails && _environment.IsDevelopment()
                ? GetExceptionDetails(exception)
                : new List<string>(),
            TraceId = context.TraceIdentifier
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        return context.Response.WriteAsync(json);
    }

    private static List<string> GetExceptionDetails(Exception exception)
    {
        var details = new List<string> { exception.Message };
        var inner = exception.InnerException;
        while (inner != null)
        {
            details.Add(inner.Message);
            inner = inner.InnerException;
        }
        return details;
    }
}
