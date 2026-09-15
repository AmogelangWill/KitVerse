namespace Kitverse_backend_01.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }

        public User User { get; set; }

        public int? paymentID { get; set; }
        public Payment? Payment { get; set; }

        public DateTime orderDate { get; set; }
        public decimal totalAmount { get; set; }
        
        public string? orderStatus { get; set; }= "Pending";

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
