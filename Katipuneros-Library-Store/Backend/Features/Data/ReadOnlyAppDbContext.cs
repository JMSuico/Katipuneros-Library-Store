// [Layer: Features/Data]
// ReadOnlyAppDbContext.cs -- Read-only DbContext targeting Layer 8 PostgreSQL Replica.
using Microsoft.EntityFrameworkCore;

namespace Backend.Features.Data
{
    public class ReadOnlyAppDbContext : AppDbContext
    {
        public ReadOnlyAppDbContext(DbContextOptions<ReadOnlyAppDbContext> options)
            : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            optionsBuilder.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
        }
    }
}
