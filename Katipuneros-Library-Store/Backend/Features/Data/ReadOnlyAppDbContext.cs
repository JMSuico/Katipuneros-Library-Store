// [Layer: Features/Data]
// ReadOnlyAppDbContext.cs -- Read-only DbContext targeting Layer 8 PostgreSQL Replica.
using System;
using System.Threading;
using System.Threading.Tasks;
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

        public override int SaveChanges()
        {
            throw new InvalidOperationException("ReadOnlyAppDbContext is read-only. Mutation operations must be executed against Layer 7 Primary DB via AppDbContext.");
        }

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            throw new InvalidOperationException("ReadOnlyAppDbContext is read-only. Mutation operations must be executed against Layer 7 Primary DB via AppDbContext.");
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            throw new InvalidOperationException("ReadOnlyAppDbContext is read-only. Mutation operations must be executed against Layer 7 Primary DB via AppDbContext.");
        }

        public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
        {
            throw new InvalidOperationException("ReadOnlyAppDbContext is read-only. Mutation operations must be executed against Layer 7 Primary DB via AppDbContext.");
        }
    }
}
