namespace Kitverse_backend_01.DTOs
{
    public class UpdateTShirt
    {
        public int TShirtId { get; set; }
        public string ShirtSeason { get; set; } = string.Empty;
        public decimal ShirtPrice { get; set; }
        public string? ShirtAffiliate { get; set; }
        public string ShirtGender { get; set; } = string.Empty;
        public string ShirtDescription { get; set; } = string.Empty;
        public string ShirtStatus { get; set; } = string.Empty;
        public string ShirtName { get; set; } = string.Empty;
        public int TeamId { get; set; }
    }
}
