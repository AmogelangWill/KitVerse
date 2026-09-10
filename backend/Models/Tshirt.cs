// Models/TShirt.cs
namespace Kitverse_backend_01.Models
{
    public class TShirt
    {
        //Fixed 
        public int TShirtId { get; set; }
        public string ShirtSeason { get; set; } = string.Empty;
        public decimal ShirtPrice { get; set; }
        public string? ShirtAffiliate { get; set; }
        public string ShirtGender { get; set; } = string.Empty;
        public string ShirtDescription { get; set; } = string.Empty;
        public string ShirtStatus { get; set; } = string.Empty;
        public string ShirtName { get; set; } = string.Empty;
        public int TeamId { get; set; }
        public DateTime? DateAdded { get; set; }



        public Team Team { get; set; } = null!;
        public List<ShirtLink> ShirtLinks { get; set; } = new();
    }
}