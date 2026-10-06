// [Layer: Features/Helpers/Infrastructure]
// NotificationHelper.cs -- Reusable notification formatting and dispatch utilities.
// Formats alert payloads, timestamps, channel routing, and severity tags.
// DO NOT put database access or business workflow logic here.

using System;

namespace Backend.Features.Helpers.Infrastructure
{
    public static class NotificationHelper
    {
        public enum UrgencyLevel
        {
            Info = 1,
            Warning = 2,
            Critical = 3
        }

        public record FormattedNotification(
            Guid NotificationId,
            string Title,
            string FormattedMessage,
            UrgencyLevel Urgency,
            string Category,
            DateTime DispatchedAt,
            string FormattedTimestamp
        );

        public static FormattedNotification FormatBroadcast(string title, string rawMessage, UrgencyLevel urgency, string category = "System")
        {
            var sanitizedTitle = InputSanitizer.Sanitize(title);
            var sanitizedMessage = InputSanitizer.Sanitize(rawMessage);
            var now = DateTime.UtcNow;

            return new FormattedNotification(
                NotificationId: Guid.NewGuid(),
                Title: sanitizedTitle,
                FormattedMessage: sanitizedMessage,
                Urgency: urgency,
                Category: category,
                DispatchedAt: now,
                FormattedTimestamp: now.ToString("yyyy-MM-dd HH:mm:ss 'UTC'")
            );
        }

        public static FormattedNotification FormatDueReminder(string patronName, string bookTitle, DateTime dueDate)
        {
            var now = DateTime.UtcNow;
            var isOverdue = now > dueDate;
            var urgency = isOverdue ? UrgencyLevel.Critical : UrgencyLevel.Warning;
            var title = isOverdue ? "Overdue Circulation Notice" : "Approaching Return Deadline";
            var message = isOverdue
                ? $"Dear {InputSanitizer.Sanitize(patronName)}, your loaned title '{InputSanitizer.Sanitize(bookTitle)}' was due on {dueDate:MMM dd, yyyy}. Please return it to the circulation desk immediately to halt fine accumulation."
                : $"Dear {InputSanitizer.Sanitize(patronName)}, your loaned title '{InputSanitizer.Sanitize(bookTitle)}' is scheduled for return on {dueDate:MMM dd, yyyy}. You may request an online renewal if no waitlist hold exists.";

            return new FormattedNotification(
                NotificationId: Guid.NewGuid(),
                Title: title,
                FormattedMessage: message,
                Urgency: urgency,
                Category: "Circulation",
                DispatchedAt: now,
                FormattedTimestamp: now.ToString("yyyy-MM-dd HH:mm:ss 'UTC'")
            );
        }

        public static FormattedNotification FormatLockerPickupReady(string patronName, string bookTitle, string lockerBay, string lockerPin)
        {
            var now = DateTime.UtcNow;
            var message = $"Dear {InputSanitizer.Sanitize(patronName)}, your hold for '{InputSanitizer.Sanitize(bookTitle)}' has been staged at Smart Locker Bay {lockerBay}. Access PIN: {lockerPin}. Hold expires in 48 hours.";

            return new FormattedNotification(
                NotificationId: Guid.NewGuid(),
                Title: "Book Ready for Smart Locker Pickup",
                FormattedMessage: message,
                Urgency: UrgencyLevel.Info,
                Category: "Reservation",
                DispatchedAt: now,
                FormattedTimestamp: now.ToString("yyyy-MM-dd HH:mm:ss 'UTC'")
            );
        }
    }
}
