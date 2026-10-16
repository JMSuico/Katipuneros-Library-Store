// [Layer: Features/Api/DTOs/Requests]
// CheckoutRequest.cs -- Request DTO for circulation desk checkout.
// Data shaping and DataAnnotations attributes ONLY.
// DO NOT put business validation logic or database queries here.

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Features.Api.DTOs.Requests;

public class CheckoutRequest
{
    [Required]
    public Guid PatronId { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "At least one book barcode must be scanned for checkout.")]
    public List<string> BookBarcodes { get; set; } = new();

    public DateTime? DueDate { get; set; }

    public string? PickupPin { get; set; }

    public Guid? ReservationId { get; set; }
}
