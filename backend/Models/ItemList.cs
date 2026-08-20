// Models/ItemList.cs
namespace Kitverse_backend_01.Models
{
    public class ItemList
    {
        public int CartId { get; set; }
        public int TShirtId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPurchaseAtTime { get; set; }

        public ShoppingCart ShoppingCart { get; set; } = null!;
        public TShirt TShirt { get; set; } = null!;
    }
}