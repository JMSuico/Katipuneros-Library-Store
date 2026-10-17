// [Layer: Features/Services/Implementations]
// EmailService.cs -- Production-grade Gmail SMTP transactional email dispatcher for library circulation.
// Dispatches notifications asynchronously without blocking HTTP response latency.
// DO NOT put HTTP controllers or database mutations here.

using System;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using Backend.Features.Data.Models;
using Backend.Features.Helpers.Infrastructure;
using Backend.Features.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Backend.Features.Services.Implementations;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUser;
    private readonly string _smtpPass;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly bool _enableSsl;
    private readonly bool _isConfigured;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;

        _smtpHost = SecretConfiguration.WithDefault(configuration, "SmtpSettings:Host", "smtp.gmail.com");
        _smtpPort = int.TryParse(configuration["SmtpSettings:Port"], out var p) ? p : 587;
        _enableSsl = !bool.TryParse(configuration["SmtpSettings:EnableSsl"], out var ssl) || ssl;

        // Sender identity is not secret -- safe to carry a local development default.
        _fromEmail = SecretConfiguration.WithDefault(configuration, "SmtpSettings:SenderEmail", "library@localhost");
        _fromName = SecretConfiguration.WithDefault(configuration, "SmtpSettings:SenderName", "Katipuneros Library Store");
        _smtpUser = SecretConfiguration.WithDefault(configuration, "SmtpSettings:SenderEmail", "library@localhost");

        // The app password IS secret. When absent, transactional email disables itself
        // and the rest of the circulation system continues to operate.
        var configuredPassword = SecretConfiguration.RequireIfConfigured(configuration, "SmtpSettings:AppPassword");
        _smtpPass = configuredPassword ?? string.Empty;
        _isConfigured = !string.IsNullOrWhiteSpace(configuredPassword);

        if (!_isConfigured)
        {
            _logger.LogWarning(
                "[EmailService] SmtpSettings:AppPassword is not configured. Transactional email is DISABLED. " +
                "Set env var 'SmtpSettings__AppPassword' or run: dotnet user-secrets set \"SmtpSettings:AppPassword\" \"<value>\"");
        }
    }

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody, string? textBody = null)
    {
        if (!_isConfigured)
        {
            _logger.LogWarning("[EmailService] Skipped dispatch to '{ToEmail}' -- SMTP is not configured.", toEmail);
            return false;
        }

        if (string.IsNullOrWhiteSpace(toEmail) || !toEmail.Contains('@'))
        {
            _logger.LogWarning("[EmailService] Skipped dispatch to invalid email: '{ToEmail}'", toEmail);
            return false;
        }

        try
        {
            using var message = new MailMessage();
            message.From = new MailAddress(_fromEmail, _fromName, Encoding.UTF8);
            message.To.Add(new MailAddress(toEmail.Trim()));
            message.Subject = subject;
            message.SubjectEncoding = Encoding.UTF8;
            message.Body = htmlBody;
            message.BodyEncoding = Encoding.UTF8;
            message.IsBodyHtml = true;

            if (!string.IsNullOrWhiteSpace(textBody))
            {
                var plainView = AlternateView.CreateAlternateViewFromString(textBody, Encoding.UTF8, "text/plain");
                message.AlternateViews.Add(plainView);
            }

            using var client = new SmtpClient(_smtpHost, _smtpPort)
            {
                Credentials = new NetworkCredential(_smtpUser, _smtpPass),
                EnableSsl = _enableSsl,
                Timeout = 12000
            };

            await client.SendMailAsync(message);
            _logger.LogInformation("[EmailService] Successfully dispatched email '{Subject}' to {ToEmail}", subject, toEmail);

            NotificationService.AddDispatchRecord(
                recipientName: toEmail.Split('@')[0],
                recipientEmail: toEmail,
                triggerEvent: subject,
                channel: "Email (Gmail SMTP TLS)",
                statusSeverity: "success"
            );

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EmailService] Failed to dispatch email '{Subject}' to {ToEmail}", subject, toEmail);

            NotificationService.AddDispatchRecord(
                recipientName: toEmail.Split('@')[0],
                recipientEmail: toEmail,
                triggerEvent: subject,
                channel: "Email (Gmail SMTP TLS)",
                statusSeverity: "retrying"
            );

            return false;
        }
    }

    public async Task SendReservationNotificationAsync(Reservation reservation, string eventType, string? note = null)
    {
        var patronEmail = reservation.Patron?.Email;
        if (string.IsNullOrWhiteSpace(patronEmail)) return;

        var patronName = reservation.Patron?.FullName ?? "Patron";
        var bookTitle = reservation.Book?.Title ?? "Catalog Asset";
        var bookAuthor = reservation.Book?.Author ?? "Unknown Author";

        string subject;
        string bannerTitle;
        string bannerColor;
        string detailContent;

        switch (eventType)
        {
            case "Approved":
                subject = $"[Katipuneros Library] Hold Approved & Staged: {bookTitle}";
                bannerTitle = "Hold Approved & Ready for Walk-In Pickup";
                bannerColor = "#0D7A53"; // Dark emerald
                detailContent = $@"
                    <p style=""font-size: 15px; line-height: 1.6; color: #1E293B; margin-bottom: 16px;"">
                        Greetings <strong>{WebUtility.HtmlEncode(patronName)}</strong>,
                    </p>
                    <p style=""font-size: 15px; line-height: 1.6; color: #1E293B; margin-bottom: 20px;"">
                        Your hold request for <strong>{WebUtility.HtmlEncode(bookTitle)}</strong> has been approved by the circulation desk and staged for physical walk-in collection.
                    </p>
                    <div style=""background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 18px; margin-bottom: 24px;"">
                        <table style=""width: 100%; border-collapse: collapse; font-size: 14px;"">
                            <tr>
                                <td style=""padding: 6px 0; color: #475569; width: 140px;""><strong>Pickup Bay:</strong></td>
                                <td style=""padding: 6px 0; color: #0D7A53; font-weight: bold;"">{WebUtility.HtmlEncode(reservation.LockerBay ?? "Bay 01 Counter")}</td>
                            </tr>
                            <tr>
                                <td style=""padding: 6px 0; color: #475569;""><strong>Collection PIN:</strong></td>
                                <td style=""padding: 6px 0; color: #0F172A; font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 2px;"">{WebUtility.HtmlEncode(reservation.LockerPin ?? "N/A")}</td>
                            </tr>
                            <tr>
                                <td style=""padding: 6px 0; color: #475569;""><strong>Hold Window:</strong></td>
                                <td style=""padding: 6px 0; color: #DC2626; font-weight: bold;"">48 Hours (Walk-in before {reservation.ExpiryDate:MMM dd, yyyy hh:mm tt UTC})</td>
                            </tr>
                        </table>
                    </div>
                    <p style=""font-size: 14px; color: #64748B; margin-bottom: 12px;"">
                        Please present your University ID card and quote your 4-digit Collection PIN at the circulation desk counter upon walk-in.
                    </p>";
                break;

            case "Declined":
                subject = $"[Katipuneros Library] Hold Request Update: {bookTitle}";
                bannerTitle = "Hold Request Notification";
                bannerColor = "#B91C1C"; // Burgundy/Crimson
                detailContent = $@"
                    <p style=""font-size: 15px; line-height: 1.6; color: #1E293B; margin-bottom: 16px;"">
                        Greetings <strong>{WebUtility.HtmlEncode(patronName)}</strong>,
                    </p>
                    <p style=""font-size: 15px; line-height: 1.6; color: #1E293B; margin-bottom: 20px;"">
                        Your hold request for <strong>{WebUtility.HtmlEncode(bookTitle)}</strong> could not be fulfilled at this time.
                    </p>
                    <div style=""background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 18px; margin-bottom: 24px;"">
                        <p style=""margin: 0; color: #991B1B; font-size: 14px; line-height: 1.5;"">
                            <strong>Reason:</strong> {WebUtility.HtmlEncode(note ?? "High circulation queue demand or asset undergoing conservation inspection.")}
                        </p>
                    </div>
                    <p style=""font-size: 14px; color: #64748B; margin-bottom: 12px;"">
                        You may browse alternative titles or re-queue your request when additional copies return to shelf.
                    </p>";
                break;

            default: // Submitted
                subject = $"[Katipuneros Library] Hold Request Received: {bookTitle}";
                bannerTitle = "Hold Request Received";
                bannerColor = "#123B5D"; // Katipunan Navy
                detailContent = $@"
                    <p style=""font-size: 15px; line-height: 1.6; color: #1E293B; margin-bottom: 16px;"">
                        Greetings <strong>{WebUtility.HtmlEncode(patronName)}</strong>,
                    </p>
                    <p style=""font-size: 15px; line-height: 1.6; color: #1E293B; margin-bottom: 20px;"">
                        We have logged your hold request for <strong>{WebUtility.HtmlEncode(bookTitle)}</strong> by {WebUtility.HtmlEncode(bookAuthor)}.
                    </p>
                    <p style=""font-size: 14px; color: #475569; margin-bottom: 16px;"">
                        Queue Position: <strong>#{reservation.QueuePosition}</strong>. The circulation desk is currently triaging active reserves and will notify you as soon as a copy is staged.
                    </p>";
                break;
        }

        var html = BuildStandardEmailTemplate(bannerTitle, bannerColor, detailContent);
        // Dispatch in background
        _ = Task.Run(() => SendEmailAsync(patronEmail, subject, html));
    }

    public async Task SendLoanNotificationAsync(BorrowTransaction loan, string eventType, decimal? fineAmount = null)
    {
        var patronEmail = loan.Patron?.Email;
        if (string.IsNullOrWhiteSpace(patronEmail)) return;

        var patronName = loan.Patron?.FullName ?? "Patron";
        var bookTitle = loan.Book?.Title ?? "Catalog Asset";
        var dueDateStr = loan.DueDate.ToString("MMMM dd, yyyy");

        string subject;
        string bannerTitle;
        string bannerColor;
        string detailContent;

        switch (eventType)
        {
            case "Checkout":
                subject = $"[Katipuneros Library] Circulation Checkout Confirmed: {bookTitle}";
                bannerTitle = "Book Loan Confirmed & Overdue Timer Active";
                bannerColor = "#123B5D";
                detailContent = $@"
                    <p style=""font-size: 15px; line-height: 1.6; color: #1E293B; margin-bottom: 16px;"">
                        Greetings <strong>{WebUtility.HtmlEncode(patronName)}</strong>,
                    </p>
                    <p style=""font-size: 15px; line-height: 1.6; color: #1E293B; margin-bottom: 20px;"">
                        You have successfully checked out <strong>{WebUtility.HtmlEncode(bookTitle)}</strong> at the circulation desk.
                    </p>
                    <div style=""background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 24px;"">
                        <table style=""width: 100%; border-collapse: collapse; font-size: 14px;"">
                            <tr>
                                <td style=""padding: 6px 0; color: #475569; width: 140px;""><strong>Gate Pass:</strong></td>
                                <td style=""padding: 6px 0; color: #0F172A; font-family: monospace; font-weight: bold;"">{WebUtility.HtmlEncode(loan.GatePassCode ?? "GP-ACTIVE")}</td>
                            </tr>
                            <tr>
                                <td style=""padding: 6px 0; color: #475569;""><strong>Due Date:</strong></td>
                                <td style=""padding: 6px 0; color: #B45309; font-weight: bold;"">{dueDateStr}</td>
                            </tr>
                            <tr>
                                <td style=""padding: 6px 0; color: #475569;""><strong>Schedule:</strong></td>
                                <td style=""padding: 6px 0; color: #334155;"">Standard 14-day scholarly circulation period</td>
                            </tr>
                        </table>
                    </div>
                    <p style=""font-size: 14px; color: #64748B;"">
                        Please return this copy to the circulation desk or drop box on or before the due date to maintain clean borrowing standing.
                    </p>";
                break;

            case "Returned":
                bool isOverdue = fineAmount.HasValue && fineAmount.Value > 0;
                if (isOverdue)
                {
                    subject = $"[Katipuneros Library] Overdue Return Notice: {bookTitle}";
                    bannerTitle = "Circulation Return Recorded (Overdue Penalty)";
                    bannerColor = "#C2410C"; // Amber/Orange
                    detailContent = $@"
                        <p style=""font-size: 15px; line-height: 1.6; color: #1E293B; margin-bottom: 16px;"">
                            Greetings <strong>{WebUtility.HtmlEncode(patronName)}</strong>,
                        </p>
                        <p style=""font-size: 15px; line-height: 1.6; color: #1E293B; margin-bottom: 20px;"">
                            Volume <strong>{WebUtility.HtmlEncode(bookTitle)}</strong> has been checked in past the scheduled due date ({dueDateStr}).
                        </p>
                        <div style=""background-color: #FFF7ED; border: 1px solid #FFEDD5; border-radius: 12px; padding: 18px; margin-bottom: 24px;"">
                            <table style=""width: 100%; border-collapse: collapse; font-size: 14px;"">
                                <tr>
                                    <td style=""padding: 6px 0; color: #9A3412; width: 140px;""><strong>Assessed Fine:</strong></td>
                                    <td style=""padding: 6px 0; color: #C2410C; font-weight: bold; font-size: 16px;"">₱{(fineAmount ?? 0m):F2}</td>
                                </tr>
                                <tr>
                                    <td style=""padding: 6px 0; color: #475569;""><strong>Condition:</strong></td>
                                    <td style=""padding: 6px 0; color: #334155;"">{WebUtility.HtmlEncode(loan.ConditionNotes ?? "Good")}</td>
                                </tr>
                            </table>
                        </div>
                        <p style=""font-size: 14px; color: #64748B;"">
                            Please settle outstanding balances at Cashier Bay 01 to restore full borrowing privileges.
                        </p>";
                }
                else
                {
                    subject = $"[Katipuneros Library] Return Clearance Certificate: {bookTitle}";
                    bannerTitle = "Return Clearance Certificate (On-Time)";
                    bannerColor = "#0D7A53"; // Emerald
                    detailContent = $@"
                        <p style=""font-size: 15px; line-height: 1.6; color: #1E293B; margin-bottom: 16px;"">
                            Greetings <strong>{WebUtility.HtmlEncode(patronName)}</strong>,
                        </p>
                        <p style=""font-size: 15px; line-height: 1.6; color: #1E293B; margin-bottom: 20px;"">
                            Thank you for returning <strong>{WebUtility.HtmlEncode(bookTitle)}</strong> in Good condition.
                        </p>
                        <div style=""background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 18px; margin-bottom: 24px;"">
                            <p style=""margin: 0; color: #166534; font-size: 14px; font-weight: 500;"">
                                ✓ Loan obligation fulfilled on-time. Clearance status: <strong>CLEARED (0.00 Outstanding)</strong>.
                            </p>
                        </div>
                        <p style=""font-size: 14px; color: #64748B;"">
                            Your active loan quota has been restored. Happy reading!
                        </p>";
                }
                break;

            default:
                return;
        }

        var html = BuildStandardEmailTemplate(bannerTitle, bannerColor, detailContent);
        _ = Task.Run(() => SendEmailAsync(patronEmail, subject, html));
    }

    private static string BuildStandardEmailTemplate(string bannerTitle, string bannerColor, string contentHtml) =>
        $@"<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{WebUtility.HtmlEncode(bannerTitle)}</title>
</head>
<body style=""margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;"">
    <table role=""presentation"" style=""width: 100%; border-collapse: collapse; background-color: #F1F5F9; padding: 32px 16px;"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" style=""max-width: 600px; width: 100%; border-collapse: collapse; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);"">
                    <!-- Brand Banner Header -->
                    <tr>
                        <td style=""background-color: {bannerColor}; padding: 28px 32px; text-align: left;"">
                            <table style=""width: 100%; border-collapse: collapse;"">
                                <tr>
                                    <td>
                                        <div style=""font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255, 255, 255, 0.8); font-weight: 700; margin-bottom: 4px;"">
                                            Katipuneros Scholastic Library
                                        </div>
                                        <div style=""font-size: 20px; font-weight: 800; color: #FFFFFF;"">
                                            {WebUtility.HtmlEncode(bannerTitle)}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Main Body -->
                    <tr>
                        <td style=""padding: 32px;"">
                            {contentHtml}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style=""background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 32px; text-align: center; font-size: 12px; color: #64748B;"">
                            <p style=""margin: 0 0 6px 0;"">
                                <strong>Katipuneros Library Store System</strong> • Circulation &amp; Scholastic Terminal
                            </p>
                            <p style=""margin: 0 0 6px 0;"">
                                Ground Floor Front Desk Bay 01 • Main Campus University Complex
                            </p>
                            <p style=""margin: 0; color: #94A3B8;"">
                                This automated notice was dispatched by the Katipuneros Circulation Engine.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
}
