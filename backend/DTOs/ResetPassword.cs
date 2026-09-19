namespace Kitverse_backend_01.DTOs
{
    public class ResetPassword
    {
        public string Token { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }
}
