// [Layer: Features/Api/DTOs/Responses]
// BookCopyResponses.cs -- Response DTOs for individual physical book copies, QR codes, and scanner resolution.
// Pure data contracts ONLY.
// DO NOT put business logic, validation rules, or database queries here.

using Backend.Features.Data.Enums;

namespace Backend.Features.Api.DTOs.Responses;

public class BookCopyDto
{
    public Guid Id { get; set; }
    public Guid BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public string BookAuthor { get; set; } = string.Empty;
    public string BookIsbn { get; set; } = string.Empty;
    public string DeweyCode { get; set; } = string.Empty;
    public string? CoverImage { get; set; }
    public int CopyNumber { get; set; }
    public string AccessionNumber { get; set; } = string.Empty;
    public string QrCodeData { get; set; } = string.Empty;
    public string Status { get; set; } = "Available";
    public string Condition { get; set; } = "Good";
    public string? ConditionNotes { get; set; }
    public string? BayLocation { get; set; }
    public DateTime AcquiredDate { get; set; }
    public DateTime? LastReturnedDate { get; set; }
    public bool IsBorrowed { get; set; }
    public ActiveBorrowerDto? CurrentBorrower { get; set; }
}

public class ActiveBorrowerDto
{
    public Guid TransactionId { get; set; }
    public Guid PatronId { get; set; }
    public string PatronName { get; set; } = string.Empty;
    public string PatronLibraryId { get; set; } = string.Empty;
    public string? PatronAvatar { get; set; }
    public string? GatePassCode { get; set; }
    public DateTime BorrowDate { get; set; }
    public DateTime DueDate { get; set; }
    public bool IsOverdue { get; set; }
    public int OverdueDays { get; set; }
    public decimal EstimatedOverdueFine { get; set; }
}

public class BookCopyScanResultDto
{
    public BookCopyDto Copy { get; set; } = new();
    public ActiveBorrowerDto? ActiveLoan { get; set; }
    public decimal DailyFineRate { get; set; } = 5.00m;
    public decimal MaximumFineCap { get; set; } = 500.00m;
    public decimal DefaultDamageFee { get; set; } = 150.00m;
}
