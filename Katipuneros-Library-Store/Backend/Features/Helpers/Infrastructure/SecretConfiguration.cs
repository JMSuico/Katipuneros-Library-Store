// [Layer: Features/Helpers/Infrastructure]
// SecretConfiguration.cs -- Central resolution and startup validation of secret material.
// Resolves secrets from user-secrets (dev), environment variables, or key vault, and
// refuses to boot when any required secret is absent or still holds a committed placeholder.
// DO NOT hardcode secret fallbacks here -- that is the exact defect this type exists to prevent.
// DO NOT perform database operations or business workflows here.

using Microsoft.Extensions.Configuration;

namespace Backend.Features.Helpers.Infrastructure;

public static class SecretConfiguration
{
    /// <summary>Placeholder values that must never survive into a running deployment.</summary>
    private static readonly string[] PlaceholderMarkers =
    [
        "<", ">", "CHANGE_ME", "changeme", "REPLACE_ME", "TODO", "your-", "placeholder"
    ];

    /// <summary>
    /// Reads a required secret. Throws when the key is missing, blank, or still a placeholder,
    /// so a misconfigured environment fails at boot instead of silently running on a known key.
    /// </summary>
    public static string Require(IConfiguration configuration, string key)
    {
        var value = configuration[key];

        if (string.IsNullOrWhiteSpace(value) && key.Equals("ConnectionStrings:DefaultConnection", StringComparison.OrdinalIgnoreCase))
            value = configuration.GetConnectionString("PrimaryConnection");

        if (string.IsNullOrWhiteSpace(value))
            throw new InvalidOperationException(
                $"Required secret '{key}' is not configured. Set it via environment variable " +
                $"'{key.Replace(":", "__")}' or, for local development, run:\n" +
                $"  dotnet user-secrets set \"{key}\" \"<value>\"");

        if (PlaceholderMarkers.Any(marker => value.Contains(marker, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException(
                $"Secret '{key}' still contains a placeholder token. Replace it with real material " +
                $"via environment variable '{key.Replace(":", "__")}' or `dotnet user-secrets set \"{key}\" \"<value>\"`.");

        return value;
    }

    /// <summary>
    /// Reads an optional secret. Returns null when unset so feature-gated subsystems
    /// (e.g. SMTP dispatch) can degrade gracefully instead of blocking startup.
    /// </summary>
    public static string? RequireIfConfigured(IConfiguration configuration, string key)
    {
        var value = configuration[key];
        return string.IsNullOrWhiteSpace(value) ? null : Require(configuration, key);
    }

    /// <summary>Reads a non-secret setting with a safe default.</summary>
    public static string WithDefault(IConfiguration configuration, string key, string fallback) =>
        string.IsNullOrWhiteSpace(configuration[key]) ? fallback : configuration[key]!;

    /// <summary>
    /// Validates every required secret at startup and reports ALL missing keys in one
    /// pass, rather than failing one key per restart cycle.
    /// </summary>
    public static void ValidateRequired(IConfiguration configuration)
    {
        var problems = new List<string>();

        var dbConn = configuration.GetConnectionString("PrimaryConnection")
                  ?? configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(dbConn))
            problems.Add("  - 'ConnectionStrings:PrimaryConnection' (or 'DefaultConnection') is missing. Set env var 'ConnectionStrings__PrimaryConnection'");
        else if (PlaceholderMarkers.Any(marker => dbConn.Contains(marker, StringComparison.OrdinalIgnoreCase)))
            problems.Add("  - Database connection string still holds a placeholder value.");

        var requiredKeys = new[]
        {
            "Jwt:SecretKey"
        };

        foreach (var key in requiredKeys)
        {
            var value = configuration[key];

            if (string.IsNullOrWhiteSpace(value))
                problems.Add($"  - '{key}' is missing.  Set env var '{key.Replace(":", "__")}' or run: dotnet user-secrets set \"{key}\" \"<value>\"");
            else if (PlaceholderMarkers.Any(marker => value.Contains(marker, StringComparison.OrdinalIgnoreCase)))
                problems.Add($"  - '{key}' still holds a placeholder value.");
        }

        if (problems.Count == 0)
            return;

        throw new InvalidOperationException(
            "Katipuneros Library Store cannot start: required secrets are not configured.\n" +
            string.Join(Environment.NewLine, problems) +
            $"\n{Environment.NewLine}See AGENTS.md -> SECRETS MANAGEMENT for the full per-environment setup.");
    }
}
