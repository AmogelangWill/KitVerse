// DTOs/GoogleLogin.cs
namespace Kitverse_backend_01.DTOs
{
    public class GoogleLogin
    {
        public string IdToken { get; set; } = string.Empty; // the token your frontend already gets from Google
    }
}