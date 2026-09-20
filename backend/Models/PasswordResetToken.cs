using Kitverse_backend_01.Models;

public class PasswordResetToken
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string TokenHash { get; set; } = null!;   // SHA-256 of the emailed token, never the raw token
    public DateTime Expiration { get; set; }
    public bool isValid { get; set; } = true;        // false once used or superseded
}