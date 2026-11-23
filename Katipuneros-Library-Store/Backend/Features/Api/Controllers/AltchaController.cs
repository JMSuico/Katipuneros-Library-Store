// [Layer: Features/Api/Controllers]
// AltchaController.cs -- Thin REST endpoint handler for ALTCHA Proof-of-Work challenges.
// Delegates challenge generation and verification to IAltchaService via clean lambda expressions (=>).
// DO NOT put cryptographic logic, secrets, or business rules here.

using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Features.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AltchaController : ControllerBase
{
    private readonly IAltchaService _altchaService;

    public AltchaController(IAltchaService altchaService) =>
        _altchaService = altchaService;

    /// <summary>Generates a fresh Proof-of-Work challenge for the ALTCHA widget.</summary>
    [HttpGet("challenge")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AltchaChallengeDto), StatusCodes.Status200OK)]
    public IActionResult GetChallenge() =>
        _altchaService.GenerateChallenge() is var c
            ? Ok(new { algorithm = c.Algorithm, challenge = c.Challenge, maxnumber = c.MaxNumber, salt = c.Salt, signature = c.Signature })
            : StatusCode(500);

    /// <summary>Verifies the ALTCHA solution payload submitted by the widget.</summary>
    [HttpPost("verify")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult VerifySolution([FromBody] AltchaVerifyRequest request) =>
        _altchaService.VerifySolution(request.Payload) switch
        {
            (true, true, var msg) => Ok(new { success = true, message = msg }),
            (false, true, var msg) => Ok(new { success = false, message = msg }),
            (false, false, var msg) => BadRequest(new { success = false, message = msg }),
            _ => BadRequest(new { success = false, message = "Verification failed." })
        };
}
