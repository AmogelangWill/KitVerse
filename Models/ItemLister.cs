// Models/ItemLister.cs
namespace Kitverse_backend_01.Models
{
    public class ItemLister
    {
        public int UserId { get; set; }
        public DateTime LastEditDate { get; set; }

        public User User { get; set; } = null!;
    }
}