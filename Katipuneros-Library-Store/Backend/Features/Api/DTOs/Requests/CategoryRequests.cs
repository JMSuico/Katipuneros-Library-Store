// [Layer: Features/Api/DTOs/Requests]
// CategoryRequests.cs -- Request DTOs for library category creation and editing.
// Data shaping and DataAnnotations attributes ONLY.
// DO NOT put business validation logic or database queries here.
// NOTE: Dewey call ranges and shelf wing/bay coordinates were retired from the category workflow.
//       The unique, ascending category code is generated server-side by CategoryService.

using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Api.DTOs.Requests;

public class CreateCategoryRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    // Subject headings / summary (comma separated headings are stored here).
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
}

public class UpdateCategoryRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
}

public class BulkDeleteCategoriesRequest
{
    [Required]
    public List<Guid> CategoryIds { get; set; } = new();
}

