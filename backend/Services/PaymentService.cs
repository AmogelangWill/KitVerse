using System.Text;
using System.Text.Json;
using Kitverse_backend_01.Data;
using Kitverse_backend_01.DTOs;
using Kitverse_backend_01.Models;
using Kitverse_backend_01.Services;
using Microsoft.EntityFrameworkCore;

namespace Kitverse_backend_01.Controllers
{
    public class PaymentService : IPaymentService
    {
        private readonly KitverseDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly IInvoiceService _invoiceService;

        private readonly IPromoCodeService _promoCodeService;

        public PaymentService(KitverseDbContext context, HttpClient httpClient, IConfiguration config,IInvoiceService invoiceService, IPromoCodeService promoCodeService)
        {
            _context = context;
            _httpClient = httpClient;
            _config = config;
            _invoiceService = invoiceService;
            _promoCodeService = promoCodeService;
        }

        // Step 1: ask Paystack to create a transaction, get back a checkout URL
        public async Task<string> InitializeTransaction(InitializePayment request)
        {
            var cart = await _context.ShoppingCarts.FirstOrDefaultAsync(c => c.CartId == request.CartId);
            if (cart == null)
            {
                throw new ArgumentException("Cart not found.");
            }

            var secretKey = (_config["Paystack:SecretKey"] ?? "").Trim();
            // Guard: remove accidental "Bearer " prefix if the env var was set with it
            if (secretKey.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                secretKey = secretKey.Substring(7).Trim();
            var amountInCents = cart.TotalCost * 100; // Paystack expects the smallest currency unit

            var payload = new
            {
                email = request.Email,
                amount = amountInCents,
                callback_url = $"https://kitverse.pages.dev/payment-success?cartId={request.CartId}",
                metadata = new { cart_id = request.CartId }
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://api.paystack.co/transaction/initialize")
            {
                Content = content
            };
            httpRequest.Headers.Add("Authorization", $"Bearer {secretKey}");

            var response = await _httpClient.SendAsync(httpRequest);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Paystack initialization failed: {responseBody}");
            }

            using var doc = JsonDocument.Parse(responseBody);
            var authorizationUrl = doc.RootElement.GetProperty("data").GetProperty("authorization_url").GetString();

            return authorizationUrl!;
        }
        //Step 2: after the customer pays, confirm with Paystack directly - never trust the frontend alone
        public async Task<bool> VerifyTransaction(string reference, int cartId)
        {
            // Already processed this reference? Then don't create a second payment/order/invoice
            // (a callback + webhook, or a page refresh, can both call this).
            var already = await _context.Payments
                .FirstOrDefaultAsync(p => p.PayStackReference == reference && p.PaymentStatus == "Success");
            if (already != null)
            {
                if (already.CartId != cartId) return false;   // this reference paid for a different cart
                await FinalizePaidCartAsync(already);         // safe to repeat: fills in anything missing
                return true;
            }

            var cart = await _context.ShoppingCarts.FirstOrDefaultAsync(c => c.CartId == cartId);
            if (cart == null) return false;

            var secretKey = (_config["Paystack:SecretKey"] ?? "").Trim();
            if (secretKey.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                secretKey = secretKey.Substring(7).Trim();
            var httpRequest = new HttpRequestMessage(HttpMethod.Get, $"https://api.paystack.co/transaction/verify/{reference}");
            httpRequest.Headers.Add("Authorization", $"Bearer {secretKey}");

            var response = await _httpClient.SendAsync(httpRequest);
            var responseBody = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode) return false;   // unknown reference, etc.

            using var doc = JsonDocument.Parse(responseBody);
            var data = doc.RootElement.GetProperty("data");
            var status = data.GetProperty("status").GetString();
            var amount = data.GetProperty("amount").GetDecimal() / 100;

            var paystackSaysPaid = status == "success";

            // the cart id must match what Paystack recorded at initialize, and the amount must match the cart
            var genuine = paystackSaysPaid && ReadCartId(data) == cartId && amount == cart.TotalCost;

            // record this attempt whatever the outcome; "Mismatch" = paid, but not for this cart/amount
            var payment = new Payment
            {
                CartId = cartId,
                PayStackReference = reference,
                Amount = amount,
                PaymentStatus = genuine ? "Success" : paystackSaysPaid ? "Mismatch" : "Failed",
                TransactionDate = DateTime.UtcNow
            };
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();   // payment.PaymentId now exists

            if (genuine)
            {
                await FinalizePaidCartAsync(payment);
            }

            return genuine;
        }

        // marks the cart paid, creates the order once, issues the invoice once
        private async Task FinalizePaidCartAsync(Payment payment)
        {
            var cart = await _context.ShoppingCarts
                .Include(c => c.ItemLists)
                .FirstOrDefaultAsync(c => c.CartId == payment.CartId);
            if (cart == null) return;

            cart.CartStatus = "Paid";

            if (!await _context.Orders.AnyAsync(o => o.PaymentId == payment.PaymentId))
                await CreateOrderFromCart(cart, payment.PaymentId);
            else
                await _context.SaveChangesAsync();

            await _invoiceService.IssueInvoiceForPaymentAsync(payment.PaymentId);

            if (!string.IsNullOrEmpty(cart.PromoCode))
            {
                await _promoCodeService.RecordUsage(cart.PromoCode);
                cart.PromoCode = null;
                await _context.SaveChangesAsync();
            }
        }

        // reads the cart_id that InitializeTransaction put in Paystack's metadata
        private static int? ReadCartId(JsonElement data)
        {
            if (!data.TryGetProperty("metadata", out var meta) || meta.ValueKind != JsonValueKind.Object) return null;
            if (!meta.TryGetProperty("cart_id", out var id)) return null;

            if (id.ValueKind == JsonValueKind.Number && id.TryGetInt32(out var n)) return n;
            if (id.ValueKind == JsonValueKind.String && int.TryParse(id.GetString(), out var s)) return s;
            return null;
        }

        private async Task CreateOrderFromCart(ShoppingCart cart, int paymentId)
        {
            var order = new Order
            {
                CustomerId = cart.UserId,
                PaymentId = paymentId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = cart.TotalCost,
                OrderStatus = "Paid",
                OrderItems = cart.ItemLists.Select(il => new OrderItem
                {
                    ProductId = il.TShirtId,
                    Quantity = il.Quantity,
                    Price = il.UnitPurchaseAtTime // the locked-in price at time of purchase
                }).ToList()
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
        }

        Task IPaymentService.CreateOrderFromCart(ShoppingCart cart, int paymentId)
        {
            return CreateOrderFromCart(cart, paymentId);
        }
    }
}