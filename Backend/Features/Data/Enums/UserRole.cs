// [Layer: Features/Data/Enums]
// UserRole.cs -- System user roles for Role-Based Access Control (RBAC).
// Defines patron, cashier, and administrator access levels.
// DO NOT put business logic or methods here.

namespace Backend.Features.Data.Enums;

public enum UserRole
{
    Customer = 1,
    Cashier = 2,
    Admin = 3
}
