// [Layer: Features/Helpers/Infrastructure]
// PostgresXmlRepository.cs -- PostgreSQL-backed ASP.NET Core Data Protection XML key repository.
// Persists Data Protection keys in AppDbContext.DataProtectionKeys so keys survive ephemeral container restarts.
// DO NOT place domain business logic here.

using System.Xml.Linq;
using Backend.Features.Data;
using Backend.Features.Data.Models;
using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Microsoft.AspNetCore.DataProtection.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Backend.Features.Helpers.Infrastructure;

public sealed class PostgresXmlRepository : IXmlRepository
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PostgresXmlRepository> _logger;
    private int _tableEnsured;

    public PostgresXmlRepository(IServiceScopeFactory scopeFactory, ILogger<PostgresXmlRepository> logger)
    {
        _scopeFactory = scopeFactory ?? throw new ArgumentNullException(nameof(scopeFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public IReadOnlyCollection<XElement> GetAllElements()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        EnsureTableCreated(db);

        var rows = db.DataProtectionKeys
            .AsNoTracking()
            .OrderBy(k => k.CreatedAt)
            .ToList();

        var elements = new List<XElement>(rows.Count);
        foreach (var row in rows)
        {
            if (string.IsNullOrWhiteSpace(row.Xml))
                continue;

            try
            {
                elements.Add(XElement.Parse(row.Xml));
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Skipping malformed DataProtectionKey entry '{KeyId}'.", row.Id);
            }
        }

        return elements.AsReadOnly();
    }

    public void StoreElement(XElement element, string friendlyName)
    {
        ArgumentNullException.ThrowIfNull(element);

        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        EnsureTableCreated(db);

        var keyId = string.IsNullOrWhiteSpace(friendlyName)
            ? Guid.NewGuid().ToString("N")
            : friendlyName.Trim();

        if (keyId.Length > 200)
            keyId = keyId[..200];

        var xmlPayload = element.ToString(SaveOptions.DisableFormatting);

        try
        {
            var existing = db.DataProtectionKeys.FirstOrDefault(k => k.Id == keyId);
            if (existing is null)
            {
                db.DataProtectionKeys.Add(new DataProtectionKey
                {
                    Id = keyId,
                    FriendlyName = string.IsNullOrWhiteSpace(friendlyName) ? null : friendlyName,
                    Xml = xmlPayload,
                    CreatedAt = DateTime.UtcNow
                });
            }
            else
            {
                existing.FriendlyName = string.IsNullOrWhiteSpace(friendlyName) ? existing.FriendlyName : friendlyName;
                existing.Xml = xmlPayload;
            }

            db.SaveChanges();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to persist DataProtectionKey '{KeyId}' to PostgreSQL.", keyId);
            throw;
        }
    }

    private void EnsureTableCreated(AppDbContext db)
    {
        if (Interlocked.CompareExchange(ref _tableEnsured, 1, 0) != 0)
            return;

        if (!db.Database.IsNpgsql())
            return;

        try
        {
            db.Database.ExecuteSqlRaw(@"
                CREATE TABLE IF NOT EXISTS ""DataProtectionKeys"" (
                    ""Id"" character varying(200) NOT NULL,
                    ""FriendlyName"" character varying(255) NULL,
                    ""Xml"" text NOT NULL,
                    ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT NOW(),
                    CONSTRAINT ""PK_DataProtectionKeys"" PRIMARY KEY (""Id"")
                );
            ");
        }
        catch (Exception ex)
        {
            Interlocked.Exchange(ref _tableEnsured, 0);
            _logger.LogError(ex, "Failed to ensure DataProtectionKeys table exists in PostgreSQL.");
            throw;
        }
    }
}

public sealed class ConfigureDataProtectionOptions : IConfigureOptions<KeyManagementOptions>
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PostgresXmlRepository> _logger;

    public ConfigureDataProtectionOptions(
        IServiceScopeFactory scopeFactory,
        ILogger<PostgresXmlRepository> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public void Configure(KeyManagementOptions options)
    {
        options.XmlRepository = new PostgresXmlRepository(_scopeFactory, _logger);
    }
}
