namespace Kitverse_backend_01.Models
{
    public class OrderItem
    {
        public int OrderItemId { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;

        public int ProductId { get; set; }
        public TShirt Product { get; set; } = null!;

        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}