namespace Kitverse_backend_01.DTOs
{
    public class SizeStock
    {
        public string ShirtSize { get; set; } = string.Empty;
        public int AmountAvailable { get; set; }
    }

    public class CreateTShirt
    {
        public string ShirtName { get; set; } = string.Empty;
        public string ShirtSeason { get; set; } = string.Empty;
        public decimal ShirtPrice { get; set; }
        public string? ShirtAffiliate { get; set; }
        public string ShirtGender { get; set; } = string.Empty;
        public string ShirtDescription { get; set; } = string.Empty;
        public string ShirtStatus { get; set; } = "Available";
        public int TeamId { get; set; }
        public DateTime DateAdded { get; set; } = DateTime.UtcNow;

        public List<string> ImageUrls { get; set; } = new(); // first one becomes the main image
        public List<SizeStock> Sizes { get; set; } = new(); // per-size stock counts
    }
}