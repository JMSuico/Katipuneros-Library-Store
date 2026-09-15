// [Layer: Features/Services/Implementations]
// PersonnelService.cs -- Implementation of library staff CMS workflows.
// Enforces input sanitization via InputSanitizer and coordinates with IPersonnelRepository.
// DO NOT access AppDbContext directly -- use IPersonnelRepository only.
// DO NOT access HttpContext -- HTTP concerns stay in controllers.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Features.Data.Models;
using Backend.Features.Helpers.Infrastructure;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Interfaces;

namespace Backend.Features.Services.Implementations;

public class PersonnelService : IPersonnelService
{
    private readonly IPersonnelRepository _personnelRepository;

    public PersonnelService(IPersonnelRepository personnelRepository) =>
        _personnelRepository = personnelRepository;

    public async Task<List<Personnel>> GetAllPersonnelAsync(bool? isActive = null) =>
        await _personnelRepository.GetAllAsync(isActive);

    public async Task<Personnel?> GetPersonnelByIdAsync(Guid id) =>
        await _personnelRepository.GetByIdAsync(id);

    public async Task<Personnel> CreatePersonnelAsync(string fullName, string position, string department, string? imageUrl, int displayOrder)
    {
        var staff = new Personnel
        {
            FullName = InputSanitizer.SanitizeText(fullName),
            Position = InputSanitizer.SanitizeText(position),
            Department = InputSanitizer.SanitizeText(department),
            ImageUrl = imageUrl?.Trim(),
            DisplayOrder = displayOrder
        };

        await _personnelRepository.AddAsync(staff);
        await _personnelRepository.SaveChangesAsync();
        return staff;
    }

    public async Task<(bool Success, string? Error)> UpdatePersonnelAsync(Guid id, string fullName, string position, string department, string? imageUrl, int displayOrder, bool isActive) =>
        await _personnelRepository.GetByIdAsync(id) is not { } staff
            ? (false, "Staff personnel record not found.")
            : await ExecutePersonnelUpdateAsync(staff, fullName, position, department, imageUrl, displayOrder, isActive);

    private async Task<(bool Success, string? Error)> ExecutePersonnelUpdateAsync(Personnel staff, string fullName, string position, string department, string? imageUrl, int displayOrder, bool isActive)
    {
        staff.FullName = InputSanitizer.SanitizeText(fullName);
        staff.Position = InputSanitizer.SanitizeText(position);
        staff.Department = InputSanitizer.SanitizeText(department);
        staff.ImageUrl = imageUrl?.Trim();
        staff.DisplayOrder = displayOrder;
        staff.IsActive = isActive;

        await _personnelRepository.UpdateAsync(staff);
        var saved = await _personnelRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to update staff personnel record.");
    }

    public async Task<(bool Success, string? Error)> DeletePersonnelAsync(Guid id) =>
        await _personnelRepository.GetByIdAsync(id) is not { } staff
            ? (false, "Staff personnel record not found.")
            : await ExecutePersonnelDeleteAsync(staff);

    private async Task<(bool Success, string? Error)> ExecutePersonnelDeleteAsync(Personnel staff)
    {
        await _personnelRepository.DeleteAsync(staff);
        var saved = await _personnelRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to delete staff personnel record.");
    }
}
