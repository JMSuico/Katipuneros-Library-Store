// [Layer: Features/Data/Models]
// Category.cs -- Dewey Decimal Classification and academic taxonomy entity.
// Contains entity properties and foreign key definitions ONLY.
// DO NOT put business logic, validation rules, or calculation methods here.

using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Data.Models;

public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(50)]
    public string DeweyRange { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(50)]
    public string ShelfBayLocation { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Book> Books { get; set; } = new List<Book>();
}
