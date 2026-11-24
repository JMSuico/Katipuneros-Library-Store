// [Layer: Features/Services/Implementations]
// AltchaService.cs -- Cryptographic ALTCHA Proof-of-Work challenge generation and HMAC verification.
// Enforces secret validation via SecretConfiguration, bounded 10-minute expiration, and replay protection.
// DO NOT access HttpContext here -- HTTP concerns stay in AltchaController.

using System.Collections.Concurrent;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Helpers.Infrastructure;
using Backend.Features.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Backend.Features.Services.Implementations;

public class AltchaService : IAltchaService
{
    private static readonly TimeSpan ChallengeTtl = TimeSpan.FromMinutes(10);
    private static readonly ConcurrentDictionary<string, long> _usedChallenges = new();

    private readonly string _hmacSecret;
    private readonly ILogger<AltchaService> _logger;

    public AltchaService(IConfiguration configuration, ILogger<AltchaService> logger) =>
        (_hmacSecret, _logger) = (SecretConfiguration.Require(configuration, "Altcha:HmacSecret"), logger);

    public AltchaChallengeDto GenerateChallenge()
    {
        var expiresAt = DateTimeOffset.UtcNow.Add(ChallengeTtl).ToUnixTimeSeconds();
        var nonce = Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(12));
        var salt = $"{nonce}?expires={expiresAt}";
        var secretNumber = RandomNumberGenerator.GetInt32(2000, 25000);
        var challenge = ComputeSha256Hash($"{salt}{secretNumber}");
        var signature = ComputeHmacSha256(challenge, _hmacSecret);
        return new AltchaChallengeDto("SHA-256", challenge, 50000, salt, signature);
    }

    public (bool Success, bool IsValidFormat, string Message) VerifySolution(string payload)
    {
        if (string.IsNullOrWhiteSpace(payload))
            return (false, false, "Missing ALTCHA payload.");

        try
        {
            var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(payload));
            var parts = JsonSerializer.Deserialize<AltchaSolution>(decoded);
            if (parts == null ||
                string.IsNullOrEmpty(parts.challenge) ||
                string.IsNullOrEmpty(parts.salt) ||
                string.IsNullOrEmpty(parts.signature))
            {
                return (false, false, "Invalid ALTCHA solution format.");
            }

            if (!TryExtractExpiration(parts.salt, out var expiresUnix))
                return (false, true, "Invalid or missing ALTCHA expiration.");

            var nowUnix = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            if (nowUnix > expiresUnix)
                return (false, true, "ALTCHA challenge has expired. Please request a new challenge.");

            var expectedChallenge = ComputeSha256Hash($"{parts.salt}{parts.number}");
            if (!CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(expectedChallenge),
                    Encoding.UTF8.GetBytes(parts.challenge)))
            {
                return (false, true, "Challenge mismatch. Verification failed.");
            }

            var expectedSignature = ComputeHmacSha256(parts.challenge, _hmacSecret);
            if (!CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(expectedSignature),
                    Encoding.UTF8.GetBytes(parts.signature)))
            {
                return (false, true, "Signature mismatch. Verification failed.");
            }

            PruneExpiredChallenges(nowUnix);
            if (!_usedChallenges.TryAdd(parts.challenge, expiresUnix))
                return (false, true, "ALTCHA challenge has already been redeemed.");

            return (true, true, "Human verification passed.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "ALTCHA payload decoding failed.");
            return (false, false, "Failed to decode ALTCHA payload.");
        }
    }

    private static bool TryExtractExpiration(string salt, out long expiresUnix)
    {
        expiresUnix = 0;
        var queryStart = salt.IndexOf('?');
        if (queryStart < 0 || queryStart >= salt.Length - 1)
            return false;

        var query = salt[(queryStart + 1)..];
        foreach (var segment in query.Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var eq = segment.IndexOf('=');
            if (eq <= 0) continue;

            var name = segment[..eq];
            if (!name.Equals("expires", StringComparison.Ordinal))
                continue;

            var value = segment[(eq + 1)..];
            return long.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out expiresUnix);
        }

        return false;
    }

    private static void PruneExpiredChallenges(long nowUnix)
    {
        if (_usedChallenges.Count <= 1000)
            return;

        foreach (var kv in _usedChallenges)
        {
            if (kv.Value < nowUnix)
            {
                _usedChallenges.TryRemove(kv.Key, out _);
            }
        }
    }

    private static string ComputeSha256Hash(string input) =>
        Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(input)));

    private static string ComputeHmacSha256(string data, string key) =>
        Convert.ToHexStringLower(HMACSHA256.HashData(Encoding.UTF8.GetBytes(key), Encoding.UTF8.GetBytes(data)));
}
