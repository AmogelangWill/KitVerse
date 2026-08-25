namespace Kitverse_backend_01.DTOs
{
    public class CreateTShirt
    {
        public string ShirtName { get; set; } = string.Empty;
        public string ShirtSeason { get; set; } = string.Empty;
        public decimal ShirtPrice { get; set; }
        public string? ShirtAffiliate { get; set; }
        public int? AmountAvailable { get; set; }
        public string ShirtSize { get; set; } = string.Empty;
        public string ShirtGender { get; set; } = string.Empty;
        public string ShirtDescription { get; set; } = string.Empty;
        public string ShirtStatus { get; set; } = "Available";
        public int TeamId { get; set; }
        public List<string> ImageUrls { get; set; } = new(); // URLs already uploaded to Supabase Storage
    }
}