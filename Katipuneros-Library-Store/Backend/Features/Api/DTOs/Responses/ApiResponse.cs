// [Layer: Features/Api/DTOs/Responses]
// ApiResponse.cs -- Standardized envelope responses for REST API endpoints.
// Data shaping for JSON serialization ONLY.
// DO NOT put business validation logic or database queries here.

namespace Backend.Features.Api.DTOs.Responses;

public class ApiResponse<T>
{
    public bool Success { get; set; } = true;
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }

    public List<string> Errors { get; set; } = new();

    public static ApiResponse<T> Ok(T data, string message = "Success")
    {
        return new ApiResponse<T> { Success = true, Message = message, Data = data };
    }

    public static ApiResponse<T> Fail(string error, IEnumerable<string>? errors = null)
    {
        var resp = new ApiResponse<T> { Success = false, Message = error, Data = default };
        if (errors != null)
        {
            resp.Errors.AddRange(errors);
        }
        return resp;
    }
}

public class ApiErrorResponse
{
    public bool Success { get; set; } = false;
    public string Error { get; set; } = string.Empty;
    public List<string> Details { get; set; } = new();
    public string TraceId { get; set; } = string.Empty;
}
