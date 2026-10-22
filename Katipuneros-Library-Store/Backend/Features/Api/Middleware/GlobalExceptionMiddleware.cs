// [Layer: Features/Api/Middleware]
// GlobalExceptionMiddleware.cs -- Catches unhandled exceptions and formats standardized error payloads.
// Formats responses as ApiErrorResponse.
// DO NOT put application business logic or database queries here.

using System.Net;
using System.Text.Json;
using Backend.Features.Api.DTOs.Responses;
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception intercepted by GlobalExceptionMiddleware: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var response = new ApiErrorResponse
        {
            Success = false,
            Error = "An unexpected internal server error occurred. Please try again later.",
            Details = _environment.IsDevelopment() ? GetExceptionDetails(exception) : new List<string>(),
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
