// [Layer: Features/Api/DTOs/Requests]
// AltchaRequests.cs -- Request DTOs for ALTCHA Proof-of-Work verification.
// Extracted from AltchaController to keep controllers strictly free of inline DTO definitions.
// DO NOT place business logic here.

using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Api.DTOs.Requests;

public class AltchaVerifyRequest
{
    [Required]
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
