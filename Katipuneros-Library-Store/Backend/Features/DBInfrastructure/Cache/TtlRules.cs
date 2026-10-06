// [Layer: Features/DBInfrastructure/Cache]
// TtlRules.cs -- Standardized cache Time-To-Live duration constants.
// Establishes eviction lifetimes according to Katipuneros Library system policies.
// DO NOT put computation logic or cache mutations here.

using System;

namespace Backend.Features.DBInfrastructure.Cache
{
    public static class TtlRules
    {
        public static readonly TimeSpan Short = TimeSpan.FromMinutes(2);
        public static readonly TimeSpan UserPermissions = TimeSpan.FromMinutes(5);
        public static readonly TimeSpan BookList = TimeSpan.FromMinutes(10);
        public static readonly TimeSpan BookDetail = TimeSpan.FromMinutes(30);
        public static readonly TimeSpan DashboardStats = TimeSpan.FromMinutes(5);
        public static readonly TimeSpan CategoriesList = TimeSpan.FromHours(2);
        public static readonly TimeSpan SystemSettings = TimeSpan.FromHours(1);
    }
}
