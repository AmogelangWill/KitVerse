namespace Kitverse_backend_01.Services
{
    public interface IEmailService
    {
        Task SendWelcomeEmail(string toEmail, string userName);

        Task SendPasswordResetEmail(string toEmail, string resetToken, byte[] qrCode);

        Task SendInvoiceEmail(string toEmail, string name, byte[] invoicePdf);

        Task SendNewsletter (string toEmail, string subject, string htmlContent);
    }
}
