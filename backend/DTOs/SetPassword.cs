// DTOs/SetPassword.cs
namespace Kitverse_backend_01.DTOs
{
    public class SetPassword
    {
        public string Email { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}