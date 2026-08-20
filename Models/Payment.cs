// Models/Payment.cs
namespace Kitverse_backend_01.Models
{
    public class Payment
    {
        public int PaymentId { get; set; }
        public string PayStackReference { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? PaymentStatus { get; set; }
        public DateTime? TransactionDate { get; set; }
        public int CartId { get; set; }

        public ShoppingCart ShoppingCart { get; set; } = null!;
    }
}