// [Layer: Features/Api/Controllers]
// AltchaController.cs -- Self-hosted ALTCHA Proof-of-Work challenge generation.
// Generates cryptographic PoW challenges for bot protection without external API calls.
// Expresses all routines via clean lambda expressions (=>).

using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Features.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AltchaController : ControllerBase
{
    // HMAC secret key for signing challenges (in production, store in appsettings/secrets)
    private static readonly string HmacSecret = "KatipunerosLibrary-ALTCHA-Secret-2026!";

    /// <summary>
    /// GET /api/altcha/challenge
    /// Generates a fresh Proof-of-Work challenge for the ALTCHA widget.
    /// The widget solves the challenge in the user's browser automatically.
    /// </summary>
    [HttpGet("challenge")]
    public IActionResult GetChallenge()
    {
        var salt = GenerateRandomSalt();
        var secretNumber = RandomNumberGenerator.GetInt32(2000, 25000);
        var challenge = ComputeSha256Hash($"{salt}{secretNumber}");
        var signature = ComputeHmacSha256(challenge, HmacSecret);

        return Ok(new
        {
            algorithm = "SHA-256",
            challenge,
            maxnumber = 50000,
            salt,
            signature
        });
    }

    /// <summary>
    /// POST /api/altcha/verify
    /// Verifies the ALTCHA solution payload submitted by the widget.
    /// </summary>
    [HttpPost("verify")]
    public IActionResult VerifySolution([FromBody] AltchaVerifyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Payload))
            return BadRequest(new { success = false, message = "Missing ALTCHA payload." });

        try
        {
            // Decode the Base64 payload
            var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(request.Payload));
            var parts = System.Text.Json.JsonSerializer.Deserialize<AltchaSolution>(decoded);

            if (parts == null || string.IsNullOrEmpty(parts.challenge) || string.IsNullOrEmpty(parts.salt))
                return BadRequest(new { success = false, message = "Invalid ALTCHA solution format." });

            // Recompute: hash(salt + number) should equal the challenge
            var expectedChallenge = ComputeSha256Hash($"{parts.salt}{parts.number}");
            if (expectedChallenge != parts.challenge)
                return Ok(new { success = false, message = "Challenge mismatch. Verification failed." });

            // Verify HMAC signature
            var expectedSignature = ComputeHmacSha256(parts.challenge, HmacSecret);
            if (expectedSignature != parts.signature)
                return Ok(new { success = false, message = "Signature mismatch. Verification failed." });

            return Ok(new { success = true, message = "Human verification passed." });
        }
        catch
        {
            return BadRequest(new { success = false, message = "Failed to decode ALTCHA payload." });
        }
    }

    private static string GenerateRandomSalt()
    {
        var bytes = RandomNumberGenerator.GetBytes(12);
        return Convert.ToHexStringLower(bytes);
    }

    private static string ComputeSha256Hash(string input)
    {
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexStringLower(hashBytes);
    }

    private static string ComputeHmacSha256(string data, string key)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToHexStringLower(hashBytes);
    }
}

public class AltchaVerifyRequest
{
    public string Payload { get; set; } = string.Empty;
}

public class AltchaSolution
{
    public string algorithm { get; set; } = string.Empty;
    public string challenge { get; set; } = string.Empty;
    public int number { get; set; }
    public string salt { get; set; } = string.Empty;
    public string signature { get; set; } = string.Empty;
}
