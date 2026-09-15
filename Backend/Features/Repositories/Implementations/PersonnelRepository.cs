// [Layer: Features/Repositories/Implementations]
// PersonnelRepository.cs -- Data access implementation for Personnel entity via EF Core.
// Queries AppDbContext directly with expression-bodied members.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Features.Data;
using Backend.Features.Data.Models;
using Backend.Features.Repositories.Interfaces;

namespace Backend.Features.Repositories.Implementations;

public class PersonnelRepository : IPersonnelRepository
{
    private readonly AppDbContext _context;

    public PersonnelRepository(AppDbContext context) =>
        _context = context;

    public async Task<List<Personnel>> GetAllAsync(bool? isActive = null) =>
        await _context.Personnel
            .Where(p => !isActive.HasValue || p.IsActive == isActive.Value)
            .OrderBy(p => p.DisplayOrder)
            .ThenBy(p => p.FullName)
            .ToListAsync();

    public async Task<Personnel?> GetByIdAsync(Guid id) =>
        await _context.Personnel.FindAsync(id);

    public async Task AddAsync(Personnel personnel) =>
        await _context.Personnel.AddAsync(personnel);

    public Task UpdateAsync(Personnel personnel) =>
        Task.FromResult(_context.Personnel.Update(personnel));

    public Task DeleteAsync(Personnel personnel) =>
        Task.FromResult(_context.Personnel.Remove(personnel));

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() > 0;
}
