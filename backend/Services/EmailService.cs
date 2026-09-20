using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Utils;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Kitverse_backend_01.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration; // Inject IConfiguration to access email settings from appsettings.json

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendWelcomeEmail(string toEmail, string userName)
        {
            var msg = new MimeMessage();

            msg.From.
                Add
                (new MailboxAddress("KitVerse", _configuration["EmailSettings:userName"]));

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

            msg.From.Add
                (new MailboxAddress
                ("KitVerse", _configuration["EmailSettings:userName"]));
            msg.To.Add(MailboxAddress.Parse(toEmail));

            msg.Subject = "Password Reset Request";

            var builder = new BodyBuilder();

            builder.HtmlBody = $@"
                        <html> 
                            <body>
                                <h2>Reset Your KitVerse Password</h2>
                                     <p> We received a request to reset your KitVerse password. </p>
                                        <p> Click the link below to create a new password. </p>
                                            <p> <a href=""{ resetToken}""> Reset Password</a> </p>
                                               
                                                    <p> Alternatively, you can scan the QR code below to reset your password: </p>
                                   </body> 
                            </html>";
            //adding the QR code to email
            var qrImage = builder.LinkedResources.Add("qrcode.png", qrCode);
            qrImage.ContentId = MimeUtils.GenerateMessageId();
            builder.HtmlBody += $@"<p> <img src=""cid:{qrImage.ContentId}"" 
                                 width=""200"" height=""200"" alt="" Password Reset QR Code"" /> </p>
              <p> this link will expire in 30 minutes. </p>
               <p> If you did not request a password reset, please ignore this email. </p>
                                                    <br> <p> Regards,<br> <strong>KitVerse Team</strong> </p>"
              ;

            msg.Body = builder.ToMessageBody();

            await SendEmail(msg);
        }

        public async Task SendInvoiceEmail(string toEmail, string name, byte[] invoicePdf)
        {

            var msg = new MimeMessage();
            msg.From.Add(new MailboxAddress("KitVerse", _configuration["EmailSettings:userName"]));
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
            msg.From.Add(new MailboxAddress("KitVerse", _configuration["EmailSettings:userName"]));
            msg.To.Add(MailboxAddress.Parse(toEmail));
            msg.Subject = subject;
            var builder = new BodyBuilder();
            builder.HtmlBody = htmlContent;
            msg.Body = builder.ToMessageBody();
            await SendEmail(msg);

        }

        // helper method to send email
        private async Task SendEmail(MimeMessage message)
        {
            using var smtp = new SmtpClient();
           await smtp.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_configuration["EmailSettings:userName"], _configuration["EmailSettings:password"]);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);

        }
    }
}
