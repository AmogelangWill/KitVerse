namespace Kitverse_backend_01.DTOs
{
    public class CreateReview
    {
        public int TShirtId { get; set; }
        public int UserId { get; set; }
        public int Stars { get; set; }
        public string? Comment { get; set; }
    }
}