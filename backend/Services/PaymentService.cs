using System.Text;
using System.Text.Json;
using Kitverse_backend_01.Data;
using Kitverse_backend_01.DTOs;
using Kitverse_backend_01.Models;
using Microsoft.EntityFrameworkCore;

namespace Kitverse_backend_01.Controllers
{
    public class PaymentService : IPaymentService
    {
        private readonly KitverseDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public PaymentService(KitverseDbContext context, HttpClient httpClient, IConfiguration config)
        {
            _context = context;
            _httpClient = httpClient;
            _config = config;
        }

        // Step 1: ask Paystack to create a transaction, get back a checkout URL
        public async Task<string> InitializeTransaction(InitializePayment request)
        {
            var cart = await _context.ShoppingCarts.FirstOrDefaultAsync(c => c.CartId == request.CartId);
            if (cart == null)
            {
                throw new ArgumentException("Cart not found.");
            }

            var secretKey = _config["Paystack:SecretKey"];//this one comes from dotnet user secrets that i set up earlier
            var amountInCents = cart.TotalCost * 100; // Paystack expects the smallest currency unit

            var payload = new
            {
                email = request.Email,
                amount = amountInCents,
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

        //Step 2: after the customer pays, confirm with Paystack directly -never trust the frontend alone
        public async Task<bool> VerifyTransaction(string reference, int cartId)
        {
            var secretKey = _config["Paystack:SecretKey"];

            var httpRequest = new HttpRequestMessage(HttpMethod.Get, $"https://api.paystack.co/transaction/verify/{reference}");
            httpRequest.Headers.Add("Authorization", $"Bearer {secretKey}");

            var response = await _httpClient.SendAsync(httpRequest);
            var responseBody = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(responseBody);
            var status = doc.RootElement.GetProperty("data").GetProperty("status").GetString();
            var amount = doc.RootElement.GetProperty("data").GetProperty("amount").GetDecimal() / 100;

            var wasSuccessful = status == "success";

            // record this attempt, whatever the outcome - keeps a real history, not just the final result
            _context.Payments.Add(new Payment
            {
                CartId = cartId,
                PayStackReference = reference,
                Amount = amount,
                PaymentStatus = wasSuccessful ? "Success" : "Failed",
                TransactionDate = DateTime.UtcNow
            });

            if (wasSuccessful)
            {
                var cart = await _context.ShoppingCarts
                    .Include(c => c.ItemLists)
                    .FirstOrDefaultAsync(c => c.CartId == cartId);

                if (cart != null)
                {
                    cart.CartStatus = "Paid";
                    await _context.SaveChangesAsync(); // save the payment row + status first, so payment.PaymentId exists

                    var payment = await _context.Payments
                        .Where(p => p.CartId == cartId && p.PaymentStatus == "Success")
                        .OrderByDescending(p => p.TransactionDate)
                        .FirstOrDefaultAsync();

                    if (payment != null)
                    {
                        await CreateOrderFromCart(cart, payment.PaymentId);
                    }
                }
            }

            await _context.SaveChangesAsync();
            return wasSuccessful;
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