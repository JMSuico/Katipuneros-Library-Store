// [Layer: Features/Services/Interfaces]
// ISystemHealthService.cs -- Contract for system health inspection and diagnostics.
// Defines operations to inspect database connectivity, memory footprint, and server uptime.
// DO NOT put data access, raw SQL, or HTTP concerns here.

using System.Threading.Tasks;

namespace Backend.Features.Services.Interfaces
{
    public interface ISystemHealthService
    {
        Task<(bool IsHealthy, bool DatabaseReachable, string Message, long MemoryUsageMb)> CheckSystemHealthAsync();
    }
}
