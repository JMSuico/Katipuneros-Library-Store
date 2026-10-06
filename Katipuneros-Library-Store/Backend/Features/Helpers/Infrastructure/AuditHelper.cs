// [Layer: Features/Helpers/Infrastructure]
// AuditHelper.cs -- Cryptographic SHA-256 hash chaining for immutable audit logs.
// Generates tamper-evident hash links connecting sequential system operations.
// DO NOT perform database operations or business workflows here.

using System;
using System.Security.Cryptography;
using System.Text;

namespace Backend.Features.Helpers.Infrastructure;

public static class AuditHelper
{
    public const string GenesisHash = "0000000000000000000000000000000000000000000000000000000000000000";

    public static string ComputeHash(string previousHash, string action, string targetEntity, string payload, DateTime timestamp) =>
        Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes($"{previousHash}|{action}|{targetEntity}|{payload}|{timestamp:O}")));
}
