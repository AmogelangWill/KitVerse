using Kitverse_backend_01.Models;

namespace Kitverse_backend_01.Services
{
    public interface IInvoiceService
    {
        Task IssueInvoiceForPaymentAsync(int paymentId);   // called when a payment is verified
        Task<bool> SendInvoiceAsync(int invoiceId);        // admin "resend"
        Task<List<Invoice>> GetUserInvoicesAsync(int userId);
    }
}
