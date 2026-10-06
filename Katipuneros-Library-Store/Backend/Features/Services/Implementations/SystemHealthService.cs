// [Layer: Features/Services/Implementations]
// SystemHealthService.cs -- Business logic for diagnostics and server health metrics.
// Orchestrates health verification via IUserRepository without touching _context directly.
// DO NOT query _context directly -- use IUserRepository only. DO NOT access HttpContext.

using System.Diagnostics;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class SystemHealthService : ISystemHealthService
{
    private readonly IUserRepository _userRepository;

    public SystemHealthService(IUserRepository userRepository) =>
        _userRepository = userRepository;

    public async Task<(bool IsHealthy, bool DatabaseReachable, string Message, long MemoryUsageMb)> CheckSystemHealthAsync() =>
        await EvaluateDiagnosticsAsync(await TryPingDatabaseAsync());

    private async Task<bool> TryPingDatabaseAsync()
    {
        try
        {
            return await _userRepository.CanConnectAsync();
        }
        catch
        {
            return false;
        }
    }

    private Task<(bool IsHealthy, bool DatabaseReachable, string Message, long MemoryUsageMb)> EvaluateDiagnosticsAsync(bool dbReachable)
    {
        var currentProcess = Process.GetCurrentProcess();
        var memoryMb = currentProcess.WorkingSet64 / (1024 * 1024);

        var message = dbReachable
            ? "Katipuneros Library Store Web API is running normally. Database connectivity is active."
            : "Katipuneros Library Store Web API is running in degraded state. Database connection could not be established.";

        return Task.FromResult((dbReachable, dbReachable, message, memoryMb));
    }
}
