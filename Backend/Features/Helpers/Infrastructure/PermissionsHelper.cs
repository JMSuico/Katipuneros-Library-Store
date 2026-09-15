// [Layer: Features/Helpers/Infrastructure]
// PermissionsHelper.cs -- RBAC role validation and authority checker.
// Evaluates patron, cashier, and administrator authorization states.
// DO NOT perform database operations or business workflows here.

using Backend.Features.Data.Enums;

namespace Backend.Features.Helpers.Infrastructure;

public static class PermissionsHelper
{
    public static bool CanManageCatalog(UserRole role) => role == UserRole.Admin;

    public static bool CanProcessCirculation(UserRole role) => role is UserRole.Cashier or UserRole.Admin;

    public static bool CanWaiveFines(UserRole role) => role is UserRole.Cashier or UserRole.Admin;

    public static bool CanManageUsers(UserRole role) => role == UserRole.Admin;

    public static bool CanViewAuditLogs(UserRole role) => role == UserRole.Admin;

    public static bool CanBorrow(UserRole role) => role == UserRole.Customer;
}
