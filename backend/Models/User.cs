namespace Kitverse_backend_01.Models
{
    public class User
    {
        public int UserId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string UserSurname { get; set; } = string.Empty;

        public string UserEmail { get; set; } = string.Empty;

        public string? PasswordHash { get; set; }//nullable
        public string Role { get; set; } = string.Empty;

        public DateTime? DateAdded { get; set; }



       

    }
}