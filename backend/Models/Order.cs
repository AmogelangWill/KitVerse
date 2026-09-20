namespace Kitverse_backend_01.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public User User { get; set; } = null!;

        public int? PaymentId { get; set; }
        public Payment? Payment { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        public string OrderStatus { get; set; } = "Pending";

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}