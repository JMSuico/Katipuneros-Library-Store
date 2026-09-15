// [Layer: Features/Data/Models]
// Reservation.cs -- Holds, queue rankings, and smart locker pickup assignments.
// Contains entity properties and foreign key definitions ONLY.
// DO NOT put business logic, validation rules, or calculation methods here.

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Features.Data.Enums;

namespace Backend.Features.Data.Models;

public class Reservation
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid PatronId { get; set; }

    [ForeignKey(nameof(PatronId))]
    public User? Patron { get; set; }

    [Required]
    public Guid BookId { get; set; }

    [ForeignKey(nameof(BookId))]
    public Book? Book { get; set; }

    public DateTime ReservationDate { get; set; } = DateTime.UtcNow;

    public DateTime ExpiryDate { get; set; }

    public DateTime? FulfilledDate { get; set; }

    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;

    [MaxLength(50)]
    public string? LockerBay { get; set; }

    [MaxLength(20)]
    public string? LockerPin { get; set; }

    [MaxLength(50)]
    public string? PickupBranch { get; set; }

    public int QueuePosition { get; set; } = 1;
}
