// [Layer: Features/DBInfrastructure/Cache]
// CacheInvalidation.cs -- Cache eviction utility for mutating domain workflows.
// Invalidates affected cache keys after updates, inserts, or deletes.
// DO NOT query database or apply business rules here.

using System;
using System.Threading.Tasks;

namespace Backend.Features.DBInfrastructure.Cache
{
    public class CacheInvalidation
    {
        private readonly ICacheService _cacheService;

        public CacheInvalidation(ICacheService cacheService)
        {
            _cacheService = cacheService;
        }

        public async Task InvalidateBookAsync(Guid bookId)
        {
            await _cacheService.RemoveAsync(CacheKeys.BookDetail(bookId));
            await _cacheService.RemoveAsync(CacheKeys.BookList());
            await _cacheService.RemoveAsync(CacheKeys.SpotlightBooks());
            await _cacheService.RemoveAsync(CacheKeys.DashboardStats());
        }

        public async Task InvalidateCategoriesAsync()
        {
            await _cacheService.RemoveAsync(CacheKeys.CategoriesList());
            await _cacheService.RemoveAsync(CacheKeys.BookList());
        }

        public async Task InvalidateUserPermissionsAsync(Guid userId)
        {
            await _cacheService.RemoveAsync(CacheKeys.UserPermissions(userId));
        }

        public async Task InvalidateCirculationAsync(Guid userId)
        {
            await _cacheService.RemoveAsync(CacheKeys.ActiveBorrowings(userId));
            await _cacheService.RemoveAsync(CacheKeys.DashboardStats());
        }
    }
}
