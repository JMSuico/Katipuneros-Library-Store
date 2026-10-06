// [Layer: Features/DBInfrastructure/Cache]
// CacheKeys.cs -- Standardized cache key generators for application caching.
// Provides deterministic key patterns across catalog, dashboards, and patron scopes.
// DO NOT put caching logic or database access here.

using System;

namespace Backend.Features.DBInfrastructure.Cache
{
    public static class CacheKeys
    {
        public static string BookDetail(Guid id) => $"book:{id}";
        public static string BookList() => "book:list";
        public static string SpotlightBooks() => "book:spotlight";
        public static string CategoriesList() => "categories:list";
        public static string DashboardStats() => "dashboard:stats";
        public static string UserPermissions(Guid userId) => $"user:perms:{userId}";
        public static string ActiveBorrowings(Guid userId) => $"borrow:active:{userId}";
        public static string SystemSettings() => "system:settings";
    }
}
