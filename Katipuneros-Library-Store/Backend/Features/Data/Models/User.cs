// [Layer: Features/Data/Models]
// User.cs -- Entity representation of library patrons, cashiers, and administrators.
// Contains entity properties and foreign key definitions ONLY.
// DO NOT put business logic, validation rules, or calculation methods here.

using System.ComponentModel.DataAnnotations;
using Backend.Features.Data.Enums;

namespace Backend.Features.Data.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; } = UserRole.Customer;

    [MaxLength(50)]
    public string LibraryCardNumber { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Department { get; set; } = string.Empty;

    [MaxLength(30)]
    public string? PhoneNumber { get; set; }

    [MaxLength(100)]
    public string? FirstName { get; set; }

    [MaxLength(100)]
    public string? MiddleName { get; set; }

    [MaxLength(100)]
    public string? LastName { get; set; }

    [MaxLength(100)]
    public string? Username { get; set; }

    [MaxLength(100)]
    public string? EmploymentStatus { get; set; }

    [MaxLength(300)]
    public string? CurrentAddress { get; set; }

    [MaxLength(300)]
    public string? PermanentAddress { get; set; }

    [MaxLength(10)]
    public string? Age { get; set; }

    public string? ProfilePictureUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public bool IsProtected { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public ICollection<BorrowTransaction> BorrowTransactions { get; set; } = new List<BorrowTransaction>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<FineTransaction> FineTransactions { get; set; } = new List<FineTransaction>();
}
