// [Layer: Features/Data/Enums]
// ReservationStatus.cs -- Lifecycle states for book reservation holds and lockers.
// Fixed enumerations ONLY.
// DO NOT put business logic or methods here.

namespace Backend.Features.Data.Enums;

public enum ReservationStatus
{
    Pending = 1,
    StagedInLocker = 2,
    Fulfilled = 3,
    Cancelled = 4,
    Expired = 5
}
