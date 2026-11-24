// [Layer: Features/Helpers/Infrastructure]
// DateTimeNormalizationHelper.cs -- Deterministic UTC normalization and half-open day-range helpers for EF Core / Npgsql queries.
// Ensures DateTime values carry DateTimeKind.Utc and replaces non-indexable .Date == ... predicates with [StartUtc, EndUtc) ranges.
// DO NOT access databases or HttpContext here -- pure deterministic date/time helpers only.

namespace Backend.Features.Helpers.Infrastructure;

public static class DateTimeNormalizationHelper
{
    public static DateTime ToUtc(DateTime value) =>
        value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
        };

    public static DateTime? ToUtc(DateTime? value) =>
        value.HasValue ? ToUtc(value.Value) : null;

    public static (DateTime StartUtc, DateTime EndUtc) GetUtcDayRange(DateTime date)
    {
        var dayStartUtc = DateTime.SpecifyKind(ToUtc(date).Date, DateTimeKind.Utc);
        return (dayStartUtc, dayStartUtc.AddDays(1));
    }
}
