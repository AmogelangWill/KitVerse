// Models/Customer.cs
namespace Kitverse_backend_01.Models
{
    public class Customer
    {
        public int UserId { get; set; }
        public string? Address { get; set; }

        public User User { get; set; } = null!;
    }
}