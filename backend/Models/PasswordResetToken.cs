namespace Kitverse_backend_01.Models
{
    //this class is used to store the password reset token for a user. It will be used to verify the user's identity when they request a password reset.
    public class PasswordResetToken
    {
        public int Id { get; set; }
        public string TokenHash { get; set; } = null!;
        public DateTime Expiration { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public bool isValid { get; set; }
  
    }
}
