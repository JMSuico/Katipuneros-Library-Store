// [Layer: Features/Services/Interfaces]
// IPersonnelService.cs -- Contract for library staff CMS workflows.
// Defines operations for managing staff bios, positions, and display order.
// DO NOT put data access, raw SQL, or HTTP concerns here.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Features.Data.Models;

namespace Backend.Features.Services.Interfaces;

public interface IPersonnelService
{
    Task<List<Personnel>> GetAllPersonnelAsync(bool? isActive = null);
    Task<Personnel?> GetPersonnelByIdAsync(Guid id);
    Task<Personnel> CreatePersonnelAsync(string fullName, string position, string department, string? imageUrl, int displayOrder);
    Task<(bool Success, string? Error)> UpdatePersonnelAsync(Guid id, string fullName, string position, string department, string? imageUrl, int displayOrder, bool isActive);
    Task<(bool Success, string? Error)> DeletePersonnelAsync(Guid id);
}
