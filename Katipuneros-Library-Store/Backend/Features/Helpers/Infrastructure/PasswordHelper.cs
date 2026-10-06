// [Layer: Features/Helpers/Infrastructure]
// PasswordHelper.cs -- BCrypt cryptographic password hashing and verification.
// Enforces modern work factor hashing for patron and staff credentials.
// DO NOT perform database operations or business workflows here.

namespace Backend.Features.Helpers.Infrastructure;

public static class PasswordHelper
{
    private const int WorkFactor = 11;

    public static string HashPassword(string plainPassword) =>
        BCrypt.Net.BCrypt.EnhancedHashPassword(plainPassword, WorkFactor);

    public static bool VerifyPassword(string plainPassword, string hashedPassword) =>
        !string.IsNullOrWhiteSpace(plainPassword) &&
        !string.IsNullOrWhiteSpace(hashedPassword) &&
        BCrypt.Net.BCrypt.EnhancedVerify(plainPassword, hashedPassword);
}
