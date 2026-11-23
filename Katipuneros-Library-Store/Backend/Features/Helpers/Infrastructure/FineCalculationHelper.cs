// [Layer: Features/Helpers/Infrastructure]
// FineCalculationHelper.cs -- Single source of truth for overdue fine accrual, grace periods, and replacement tariffs.
// Eliminates duplicated inline fine formulas across BorrowService, BorrowRepository, CashierService, and ReturnService.
// DO NOT access databases or HttpContext here -- pure deterministic domain calculations only.

using Backend.Features.Data.Enums;

namespace Backend.Features.Helpers.Infrastructure;

public static class FineCalculationHelper
{
    public const decimal DefaultDailyFineRate = 15.00m;
    public const decimal DefaultMaxFineCap = 500.00m;
    public const decimal DefaultBindingRepairTariff = 280.00m;
    public const decimal DefaultLostBookBaseValue = 500.00m;
    public const decimal DefaultLostAdminFee = 150.00m;
    public const int DefaultGracePeriodHours = 24;

    public static int ComputeGracePeriodDays(UserRole? role, string? employmentStatus, int gracePeriodHours = DefaultGracePeriodHours) =>
        (role == UserRole.Customer || string.Equals(employmentStatus, "Student", StringComparison.OrdinalIgnoreCase))
            ? (int)Math.Ceiling((gracePeriodHours > 0 ? gracePeriodHours : DefaultGracePeriodHours) / 24.0)
            : 0;

    public static int ComputeOverdueDays(DateTime dueDate, DateTime referenceUtc, bool useCeiling = false) =>
        referenceUtc <= dueDate
            ? 0
            : useCeiling
                ? Math.Max(0, (int)Math.Ceiling((referenceUtc - dueDate).TotalDays))
                : Math.Max(0, (int)Math.Floor((referenceUtc - dueDate).TotalDays));

    public static decimal ComputeOverdueFine(
        DateTime dueDate,
        DateTime referenceUtc,
        decimal dailyRate = DefaultDailyFineRate,
        decimal maxCap = DefaultMaxFineCap,
        int graceDays = 0,
        bool useCeiling = false)
    {
        var effectiveRate = dailyRate > 0 ? dailyRate : DefaultDailyFineRate;
        var effectiveCap = maxCap > 0 ? maxCap : DefaultMaxFineCap;
        var rawDays = ComputeOverdueDays(dueDate, referenceUtc, useCeiling);
        var billableDays = Math.Max(0, rawDays - Math.Max(0, graceDays));
        return billableDays > 0 ? Math.Min(billableDays * effectiveRate, effectiveCap) : 0m;
    }

    public static decimal ComputeConditionPenalty(
        bool isDamaged,
        bool isLost,
        decimal? explicitDamageFee,
        decimal bindingRepairTariff = DefaultBindingRepairTariff,
        decimal lostAdminFee = DefaultLostAdminFee) =>
        explicitDamageFee is > 0
            ? explicitDamageFee.Value
            : isDamaged
                ? (bindingRepairTariff > 0 ? bindingRepairTariff : DefaultBindingRepairTariff)
                : isLost
                    ? DefaultLostBookBaseValue + (lostAdminFee > 0 ? lostAdminFee : DefaultLostAdminFee)
                    : 0m;
}
