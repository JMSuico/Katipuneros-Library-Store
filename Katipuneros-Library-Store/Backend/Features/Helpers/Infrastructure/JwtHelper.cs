// [Layer: Features/Helpers/Infrastructure]
// JwtHelper.cs -- JSON Web Token generation and claims payload construction.
// Issues signed bearer tokens for authenticated patrons, cashiers, and administrators.
// DO NOT perform database operations or business workflows here.

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Backend.Features.Data.Models;

namespace Backend.Features.Helpers.Infrastructure;

public static class JwtHelper
{
    public static string GenerateToken(User user, IConfiguration config)
    {
        string secretKey = config["Jwt:SecretKey"] ?? "KatipunerosLibraryStoreJwtSecretKey_2026_SecureKey_MustBeLongEnough!";
        string issuer = config["Jwt:Issuer"] ?? "KatipunerosLibraryApi";
        string audience = config["Jwt:Audience"] ?? "KatipunerosLibraryClient";
        int expiryHours = int.TryParse(config["Jwt:ExpiryHours"], out int h) ? h : 24;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role.ToString()),
            new("LibraryCardNumber", user.LibraryCardNumber ?? string.Empty),
            new("Department", user.Department ?? string.Empty)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiryHours),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
