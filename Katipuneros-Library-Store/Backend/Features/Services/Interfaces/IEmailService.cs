// [Layer: Features/Services/Interfaces]
// IEmailService.cs -- Service interface for transactional Gmail SMTP notifications across circulation lifecycle.
// DO NOT put business logic, controllers, or database queries here.

using System.Threading.Tasks;
using Backend.Features.Data.Models;

namespace Backend.Features.Services.Interfaces;

public interface IEmailService
{
    Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody, string? textBody = null);
    Task SendReservationNotificationAsync(Reservation reservation, string eventType, string? note = null);
    Task SendLoanNotificationAsync(BorrowTransaction loan, string eventType, decimal? fineAmount = null);
}
