// Models/Wishlist.cs
namespace Kitverse_backend_01.Models
{
    public class Wishlist
    {
        public int UserId { get; set; }
        public int TShirtId { get; set; }
        public DateTime DateAdded { get; set; }

        public Customer Customer { get; set; } = null!;
        public TShirt TShirt { get; set; } = null!;
    }
}