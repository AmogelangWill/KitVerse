// Models/Admin.cs
namespace Kitverse_backend_01.Models
{
    public class Admin
    {
        public int UserId { get; set; }
        public DateTime LastEditDate { get; set; }

        public User User { get; set; } = null!;
    }
}