// [Layer: Features/Data/Enums]
// InquiryStatus.cs -- Workflow states for public visitor contact inquiries.
// Fixed enumerations ONLY.
// DO NOT put business logic or methods here.

namespace Backend.Features.Data.Enums;

public enum InquiryStatus
{
    New = 1,
    InProgress = 2,
    Resolved = 3,
    Closed = 4
}
