// Models/ShoppingCart.cs
namespace Kitverse_backend_01.Models
{
    public class ShoppingCart
    {
        public int CartId { get; set; }
        public int TotalCost { get; set; }
        public string? CartStatus { get; set; }
        public int UserId { get; set; }

        public string? PromoCode { get; set; }
        public int? PromoDiscountPercent { get; set; }

        public Customer Customer { get; set; } = null!;
        public List<ItemList> ItemLists { get; set; } = new();
        public List<Payment> Payments { get; set; } = new();
    }
}