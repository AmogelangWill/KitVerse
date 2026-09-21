using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Gmail.v1;
using Google.Apis.Gmail.v1.Data;
using Google.Apis.Services;
using MimeKit;
using MimeKit.Utils;

namespace Kitverse_backend_01.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration; // Gmail settings come from user secrets locally / Railway variables live
        private readonly ILogger<EmailService> _logger;

        private static GmailService? _gmail;
        private static readonly object _gmailLock = new();

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        // the address the mail is sent from (must be the Gmail account the refresh token belongs to)
        private string SenderAddress =>
            _configuration["Gmail:SenderEmail"] ?? "kitverse.shop@gmail.com";

        public async Task SendWelcomeEmail(string toEmail, string userName)
        {
            var msg = new MimeMessage();

            msg.From.Add(new MailboxAddress("KitVerse", SenderAddress));

            msg.To.Add(MailboxAddress.Parse(toEmail));
            msg.Subject = "Welcome to KitVerse!";
            var builder = new BodyBuilder();

            builder.HtmlBody
                = $@" <html> <body> <h2>Welcome to KitVerse, {userName}!</h2> 
        <p> Your KitVerse account has been successfully created. </p>
        <p> You can now browse products, add items to your cart and place orders. </p> 
        <p> Thank you for joining KitVerse! </p> 
          <br> <p> Regards,<br> <strong>KitVerse Team</strong> </p>
        </body>
        </html>";

            msg.Body = builder.ToMessageBody();

            await SendEmail(msg);
        }

        public async Task SendPasswordResetEmail(string toEmail, string resetToken, byte[] qrCode)
        {
            var msg = new MimeMessage();

            msg.From.Add(new MailboxAddress("KitVerse", SenderAddress));
            msg.To.Add(MailboxAddress.Parse(toEmail));

            msg.Subject = "Password Reset Request";

            var builder = new BodyBuilder();

            builder.HtmlBody = $@"
                        <html> 
                            <body>
                                <h2>Reset Your KitVerse Password</h2>
                                     <p> We received a request to reset your KitVerse password. </p>
                                        <p> Click the link below to create a new password. </p>
                                            <p> <a href=""{resetToken}""> Reset Password</a> </p>
                                               
                                                    <p> Alternatively, you can scan the QR code below to reset your password: </p>
                                   </body> 
                            </html>";
            // adding the QR code to email
            var qrImage = builder.LinkedResources.Add("qrcode.png", qrCode);
            qrImage.ContentId = MimeUtils.GenerateMessageId();
            builder.HtmlBody += $@"<p> <img src=""cid:{qrImage.ContentId}"" 
                                 width=""200"" height=""200"" alt="" Password Reset QR Code"" /> </p>
              <p> this link will expire in 30 minutes. </p>
               <p> If you did not request a password reset, please ignore this email. </p>
                                                    <br> <p> Regards,<br> <strong>KitVerse Team</strong> </p>";

            msg.Body = builder.ToMessageBody();

            await SendEmail(msg);
        }

        public async Task SendInvoiceEmail(string toEmail, string name, byte[] invoicePdf)
        {
            var msg = new MimeMessage();
            msg.From.Add(new MailboxAddress("KitVerse", SenderAddress));
            msg.To.Add(MailboxAddress.Parse(toEmail));
            msg.Subject = "Your KitVerse Invoice";
            var builder = new BodyBuilder();
            builder.HtmlBody = $@"
                        <html> 
                            <body>
                                <h2>Invoice for Your Recent Purchase</h2>
                                     <p> Dear {name}, </p>
                                        <p> Thank you for your recent purchase on KitVerse. </p>
                                            <p> Please find your invoice attached to this email. </p>
                                               
                                                    <p> If you have any questions regarding your order, please contact our support team. </p>
                                        <p> Regards,<br> <strong>KitVerse Team</strong> </p>
                                   </body> 
                            </html>";
            // Attach the PDF invoice
            builder.Attachments.Add("KitVerse-Invoice.pdf", invoicePdf, new ContentType("application", "pdf"));
            msg.Body = builder.ToMessageBody();
            await SendEmail(msg);
        }

        public async Task SendNewsletter(string toEmail, string subject, string htmlContent)
        {
            var msg = new MimeMessage();
            msg.From.Add(new MailboxAddress("KitVerse", SenderAddress));
            msg.To.Add(MailboxAddress.Parse(toEmail));
            msg.Subject = subject;
            var builder = new BodyBuilder();
            builder.HtmlBody = htmlContent;
            msg.Body = builder.ToMessageBody();
            await SendEmail(msg);
        }

        // helper method to send email through the Gmail API (HTTPS, port 443) instead of SMTP
        
        private GmailService GetGmail(string clientId, string clientSecret, string refreshToken)
        {
            if (_gmail != null) return _gmail;

            lock (_gmailLock)
            {
                if (_gmail != null) return _gmail;

                var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = new ClientSecrets { ClientId = clientId, ClientSecret = clientSecret }
                });
                var credential = new UserCredential(flow, "me", new TokenResponse { RefreshToken = refreshToken });

                _gmail = new GmailService(new BaseClientService.Initializer
                {
                    HttpClientInitializer = credential,
                    ApplicationName = "KitVerse"
                });
                return _gmail;
            }
        }

        // helper method to send email through the Gmail API (HTTPS, port 443) instead of SMTP
        private async Task SendEmail(MimeMessage message)
        {
            var clientId = _configuration["Gmail:ClientId"];
            var clientSecret = _configuration["Gmail:ClientSecret"];
            var refreshToken = _configuration["Gmail:RefreshToken"];

            if (string.IsNullOrWhiteSpace(clientId) ||
                string.IsNullOrWhiteSpace(clientSecret) ||
                string.IsNullOrWhiteSpace(refreshToken))
            {
                throw new InvalidOperationException(
                    "Gmail settings are missing (Gmail:ClientId / Gmail:ClientSecret / Gmail:RefreshToken).");
            }

            try
            {
                var gmail = GetGmail(clientId, clientSecret, refreshToken);

                using var ms = new MemoryStream();
                await message.WriteToAsync(ms);

                // Gmail wants the raw message as base64url
                var raw = Convert.ToBase64String(ms.ToArray())
                    .Replace('+', '-')
                    .Replace('/', '_')
                    .Replace("=", "");

                await gmail.Users.Messages.Send(new Message { Raw = raw }, "me").ExecuteAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {To} with subject {Subject}",
                    message.To.ToString(), message.Subject);
                throw; // callers decide what the user sees; the real error is now in the logs
            }
        }
    }
}