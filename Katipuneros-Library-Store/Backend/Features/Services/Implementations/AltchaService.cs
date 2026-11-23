// [Layer: Features/Services/Implementations]
// AltchaService.cs -- Cryptographic ALTCHA Proof-of-Work challenge generation and HMAC verification.
// Enforces secret validation via SecretConfiguration without hardcoded secret fallbacks.
// DO NOT access HttpContext here -- HTTP concerns stay in AltchaController.

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
    private readonly string _hmacSecret;
    private readonly ILogger<AltchaService> _logger;

    public AltchaService(IConfiguration configuration, ILogger<AltchaService> logger) =>
        (_hmacSecret, _logger) = (SecretConfiguration.Require(configuration, "Altcha:HmacSecret"), logger);

    public AltchaChallengeDto GenerateChallenge()
    {
        var salt = Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(12));
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
            if (parts == null || string.IsNullOrEmpty(parts.challenge) || string.IsNullOrEmpty(parts.salt))
                return (false, false, "Invalid ALTCHA solution format.");

            var expectedChallenge = ComputeSha256Hash($"{parts.salt}{parts.number}");
            if (!CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(expectedChallenge),
                    Encoding.UTF8.GetBytes(parts.challenge)))
                return (false, true, "Challenge mismatch. Verification failed.");

            var expectedSignature = ComputeHmacSha256(parts.challenge, _hmacSecret);
            if (!CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(expectedSignature),
                    Encoding.UTF8.GetBytes(parts.signature)))
                return (false, true, "Signature mismatch. Verification failed.");

            return (true, true, "Human verification passed.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "ALTCHA payload decoding failed.");
            return (false, false, "Failed to decode ALTCHA payload.");
        }
    }

    private static string ComputeSha256Hash(string input) =>
        Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(input)));

    private static string ComputeHmacSha256(string data, string key) =>
        Convert.ToHexStringLower(HMACSHA256.HashData(Encoding.UTF8.GetBytes(key), Encoding.UTF8.GetBytes(data)));
}
