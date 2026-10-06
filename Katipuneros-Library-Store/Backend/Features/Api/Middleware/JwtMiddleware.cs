// [Layer: Features/Api/Middleware]
// JwtMiddleware.cs -- Request guard extracting JWT claims and attaching identity to HttpContext.Items.
// Parses Bearer tokens and validates token expiration and issuer.
// DO NOT put application business logic or database queries here.

using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Features.Api.Middleware;

public class JwtMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;

    public JwtMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

        if (!string.IsNullOrWhiteSpace(token))
        {
            AttachUserToContext(context, token);
        }

        await _next(context);
    }

    private void AttachUserToContext(HttpContext context, string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            string secretKey = _configuration["Jwt:SecretKey"] ?? "KatipunerosLibraryStoreJwtSecretKey_2026_SecureKey_MustBeLongEnough!";
            var key = Encoding.UTF8.GetBytes(secretKey);

            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _configuration["Jwt:Issuer"] ?? "KatipunerosLibraryApi",
                ValidateAudience = true,
                ValidAudience = _configuration["Jwt:Audience"] ?? "KatipunerosLibraryClient",
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
            var userId = jwtToken.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Sub || x.Type == "sub")?.Value;

            if (Guid.TryParse(userId, out var parsedGuid))
            {
                context.Items["UserId"] = parsedGuid;
            }
        }
        catch
        {
            // Do not attach on token validation failure -- user remains unauthenticated
        }
    }
}
