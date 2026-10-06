// [Layer: Features/Data/Enums]
// TransactionStatus.cs -- Lifecycle states for circulation borrow transactions.
// Fixed enumerations ONLY.
// DO NOT put business logic or methods here.

namespace Backend.Features.Data.Enums;

public enum TransactionStatus
{
    Active = 1,
    Returned = 2,
    Overdue = 3,
    Lost = 4,
    Cancelled = 5
}
