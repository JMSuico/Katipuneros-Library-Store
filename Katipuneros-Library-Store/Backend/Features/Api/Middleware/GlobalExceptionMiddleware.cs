// [Layer: Features/Api/Middleware]
// GlobalExceptionMiddleware.cs -- Catches unhandled exceptions and formats standardized error payloads.
// Formats responses as ApiErrorResponse.
// DO NOT put application business logic or database queries here.

using System.Net;
using System.Text.Json;
using Backend.Features.Api.DTOs.Responses;

namespace Backend.Features.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

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

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var response = new ApiErrorResponse
        {
            Success = false,
            Error = "An unexpected internal server error occurred. Please try again later.",
            Details = new List<string> { exception.Message },
            TraceId = context.TraceIdentifier
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        return context.Response.WriteAsync(json);
    }
}
