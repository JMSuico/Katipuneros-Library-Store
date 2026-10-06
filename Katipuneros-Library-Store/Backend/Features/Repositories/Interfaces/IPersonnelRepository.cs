// [Layer: Features/Repositories/Interfaces]
// IPersonnelRepository.cs -- Contract for library personnel CMS data access via EF Core.
// Defines queries for library staff profiles and administration.
// DO NOT put business logic, validation rules, or HTTP concerns here.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Features.Data.Models;

namespace Backend.Features.Repositories.Interfaces;

public interface IPersonnelRepository
{
    Task<List<Personnel>> GetAllAsync(bool? isActive = null);
    Task<Personnel?> GetByIdAsync(Guid id);
    Task AddAsync(Personnel personnel);
    Task UpdateAsync(Personnel personnel);
    Task DeleteAsync(Personnel personnel);
    Task<bool> SaveChangesAsync();
}
