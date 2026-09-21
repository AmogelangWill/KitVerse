using Kitverse_backend_01.DTOs;
using Kitverse_backend_01.Models;

namespace Kitverse_backend_01.Controllers
{
    public interface IPaymentService
    {
        Task<string> InitializeTransaction(InitializePayment request);
        Task<bool> VerifyTransaction(string reference, int cartId);
        Task CreateOrderFromCart(ShoppingCart cart, int paymentId);    }
}