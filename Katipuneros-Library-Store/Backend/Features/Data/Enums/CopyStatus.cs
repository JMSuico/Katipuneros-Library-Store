// [Layer: Features/Data/Enums]
// CopyStatus.cs -- Lifecycle states for individual physical book volumes.
// Fixed enumerations ONLY.
// DO NOT put business logic or methods here.

namespace Backend.Features.Data.Enums;

public enum CopyStatus
{
    Available = 0,
    Borrowed = 1,
    InInspection = 2,
    Damaged = 3,
    Lost = 4,
    Archived = 5
}
