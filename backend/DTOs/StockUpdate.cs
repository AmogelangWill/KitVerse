// DTOs/StockUpdate.cs
namespace Kitverse_backend_01.DTOs
{
    public class StockUpdate
    {
        public int ShirtId { get; set; }
        public string ShirtSize { get; set; } = string.Empty;
        public int Amount { get; set; }
    }
}