// [Layer: Features/Helpers/Infrastructure]
// CsvExportHelper.cs -- Single source of truth for RFC-4180 CSV escaping and spreadsheet formula-injection neutralization.
// Prevents duplicated CSV builders and protects exported cells against Excel/Sheets formula injection (=, +, -, @, \t, \r).
// DO NOT access databases or HttpContext here -- pure serialization helper only.

using System.Text;

namespace Backend.Features.Helpers.Infrastructure;

public static class CsvExportHelper
{
    private static readonly char[] FormulaTriggerChars = ['=', '+', '-', '@', '\t', '\r'];

    public static string EscapeCell(string? value)
    {
        var raw = value ?? string.Empty;
        if (raw.Length > 0 && FormulaTriggerChars.Contains(raw[0]))
            raw = $"'{raw}";
        return $"\"{raw.Replace("\"", "\"\"")}\"";
    }

    public static string BuildRow(params object?[] cells) =>
        string.Join(",", cells.Select(c => c switch
        {
            null => "\"\"",
            int or long or decimal or double or float => Convert.ToString(c, System.Globalization.CultureInfo.InvariantCulture) ?? "0",
            _ => EscapeCell(Convert.ToString(c, System.Globalization.CultureInfo.InvariantCulture))
        }));

    public static byte[] ToUtf8CsvBytes(StringBuilder sb, bool includeBom = true) =>
        includeBom
            ? Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray()
            : Encoding.UTF8.GetBytes(sb.ToString());
}
