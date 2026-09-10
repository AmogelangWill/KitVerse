namespace Kitverse_backend_01.Models
{
    public class Inventory
    {
        public int TshirtID { get; set; }

        public int AmountAvailable { get; set; }

        public String ShirtSize { get; set; } = String.Empty;

        public TShirt shirt { get; set; } = null!;

    }
}
