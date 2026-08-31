// Models/ShirtLink.cs
namespace Kitverse_backend_01.Models
{
    public class ShirtLink
    {
        public int LinkId { get; set; }
        public string ShirtLinkUrl { get; set; } = string.Empty;
        public int TShirtId { get; set; }
        public DateTime? DateAdded { get; set; }
        public bool IsMain { get; set; }

        public TShirt TShirt { get; set; } = null!;
    }
}