// DTOs/InitializePayment.cs
namespace Kitverse_backend_01.DTOs
{
    public class InitializePayment
    {
        public int CartId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Address { get; set; }   // new: shipping address, required if the customer has none saved
    }
}