// [Layer: Features/Helpers/Infrastructure]
// InputSanitizer.cs -- XSS guard and string sanitization utility.
// All public text inputs must pass through this before persistence.
// DO NOT perform database operations or business workflows here.

using System.Net;
using System.Text.RegularExpressions;

namespace Backend.Features.Helpers.Infrastructure;

public static class InputSanitizer
{
    private static readonly Regex HtmlTagRegex = new(@"<[^>]*>", RegexOptions.Compiled | RegexOptions.IgnoreCase);
    private static readonly Regex ScriptTagRegex = new(@"<script[^>]*>[\s\S]*?</script>", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public static string SanitizeText(string? input) =>
        string.IsNullOrWhiteSpace(input)
            ? string.Empty
            : WebUtility.HtmlEncode(HtmlTagRegex.Replace(ScriptTagRegex.Replace(input, string.Empty), string.Empty).Trim());

    public static string SanitizeEmail(string? email) =>
        string.IsNullOrWhiteSpace(email)
            ? string.Empty
            : email.Trim().ToLowerInvariant();

    public static string Sanitize(string? input) => SanitizeText(input);
}
