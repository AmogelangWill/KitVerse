namespace Kitverse_backend_01.Models
{
    public class Review
    {
        public int ReviewId { get; set; }
        public int TShirtId { get; set; }
        public int UserId { get; set; }
        public int Stars { get; set; } // 1 to 5
        public string? Comment { get; set; }
        public DateTime DateAdded { get; set; } = DateTime.UtcNow;

        public TShirt TShirt { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}