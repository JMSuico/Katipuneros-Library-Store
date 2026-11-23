// [Layer: Features/Services/Interfaces]
// IAltchaService.cs -- Service contract for ALTCHA Proof-of-Work challenge generation and verification.
// DO NOT access HttpContext or database contexts from this interface.

namespace Backend.Features.Services.Interfaces;

public record AltchaChallengeDto(string Algorithm, string Challenge, int MaxNumber, string Salt, string Signature);

public interface IAltchaService
{
    AltchaChallengeDto GenerateChallenge();
    (bool Success, bool IsValidFormat, string Message) VerifySolution(string payload);
}
