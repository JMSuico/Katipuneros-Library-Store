// [Layer: Features/Helpers/Validation]
// ImageInputValidator.cs -- Validates image URLs, relative asset paths, and safe base64 image data URIs.
// Rejects script payloads, dangerous URI schemes, and SVG data URIs to prevent stored XSS.
// DO NOT perform database operations or HTTP context access here.

using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Helpers.Validation;

public static class ImageInputValidator
{
    public const int MaxUrlLength = 2048;
    public const int MaxDataUriLength = 2_800_000;

    private static readonly string[] AllowedDataPrefixes =
    {
        "data:image/png;base64,",
        "data:image/jpeg;base64,",
        "data:image/jpg;base64,",
        "data:image/webp;base64,",
        "data:image/gif;base64,"
    };

    public static bool TryValidateImage(string? value, out string? error)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            error = null;
            return true;
        }

        var trimmed = value.Trim();

        if (ContainsDangerousPayload(trimmed))
        {
            error = "Image input contains disallowed script or unsafe URI content.";
            return false;
        }

        if (trimmed.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
        {
            return ValidateDataUri(trimmed, out error);
        }

        if (trimmed.StartsWith('/'))
        {
            return ValidateRelativePath(trimmed, out error);
        }

        if (trimmed.StartsWith("https://", StringComparison.OrdinalIgnoreCase) ||
            trimmed.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
        {
            return ValidateHttpUrl(trimmed, out error);
        }

        error = "Image must be a safe relative path, http(s) URL, or base64 image data URI (png, jpeg, jpg, webp, gif).";
        return false;
    }

    private static bool ContainsDangerousPayload(string value) =>
        value.Contains("<script", StringComparison.OrdinalIgnoreCase) ||
        value.Contains("javascript:", StringComparison.OrdinalIgnoreCase) ||
        value.Contains("vbscript:", StringComparison.OrdinalIgnoreCase) ||
        value.Contains("data:text/html", StringComparison.OrdinalIgnoreCase) ||
        value.Contains("svg+xml", StringComparison.OrdinalIgnoreCase) ||
        value.IndexOfAny(new[] { '<', '>', '"', '\'', '\0', '\r', '\n' }) >= 0;

    private static bool ValidateDataUri(string trimmed, out string? error)
    {
        if (trimmed.Length > MaxDataUriLength)
        {
            error = $"Image data URI exceeds the maximum allowed size ({MaxDataUriLength} characters).";
            return false;
        }

        string? matchedPrefix = null;
        foreach (var prefix in AllowedDataPrefixes)
        {
            if (trimmed.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                matchedPrefix = prefix;
                break;
            }
        }

        if (matchedPrefix is null)
        {
            error = "Only base64-encoded png, jpeg, jpg, webp, and gif data URIs are permitted.";
            return false;
        }

        var payload = trimmed.AsSpan(matchedPrefix.Length);
        if (payload.IsEmpty || !IsValidBase64Characters(payload))
        {
            error = "Image data URI contains invalid base64 content.";
            return false;
        }

        error = null;
        return true;
    }

    private static bool IsValidBase64Characters(ReadOnlySpan<char> payload)
    {
        var paddingCount = 0;
        for (var i = 0; i < payload.Length; i++)
        {
            var c = payload[i];
            if (c == '=')
            {
                paddingCount++;
                if (paddingCount > 2)
                    return false;
                continue;
            }

            if (paddingCount > 0)
                return false;

            var isBase64Char =
                (c >= 'A' && c <= 'Z') ||
                (c >= 'a' && c <= 'z') ||
                (c >= '0' && c <= '9') ||
                c == '+' ||
                c == '/';

            if (!isBase64Char)
                return false;
        }

        return payload.Length > paddingCount;
    }

    private static bool ValidateRelativePath(string trimmed, out string? error)
    {
        if (trimmed.StartsWith("//", StringComparison.Ordinal) || trimmed.Contains('\\'))
        {
            error = "Protocol-relative or backslash image paths are not allowed.";
            return false;
        }

        if (trimmed.Length > MaxUrlLength)
        {
            error = $"Image path exceeds maximum length of {MaxUrlLength} characters.";
            return false;
        }

        error = null;
        return true;
    }

    private static bool ValidateHttpUrl(string trimmed, out string? error)
    {
        if (trimmed.Length > MaxUrlLength)
        {
            error = $"Image URL exceeds maximum length of {MaxUrlLength} characters.";
            return false;
        }

        if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps) ||
            string.IsNullOrWhiteSpace(uri.Host))
        {
            error = "Image URL must be a valid http:// or https:// address.";
            return false;
        }

        error = null;
        return true;
    }
}

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter, AllowMultiple = false)]
public sealed class ValidImageInputAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is null)
            return ValidationResult.Success;

        if (value is not string str)
            return new ValidationResult("Image input must be a string.");

        return ImageInputValidator.TryValidateImage(str, out var error)
            ? ValidationResult.Success
            : new ValidationResult(error ?? "Invalid image URL or data URI.");
    }
}
