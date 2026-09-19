using Kitverse_backend_01.Models;

namespace Kitverse_backend_01.Controllers
{
    public interface IAuthService // this interface is used to define the methods that will be implemented in the AuthService class.
    {
        public Task<User> Register(User user); // this method is used to register a new user

        public Task<User> Login(string username, string password); // this method is used to login a user

        public string GenerateToken(User user);


        Task<User> GoogleLogin(string idToken);
        Task<bool> SetPassword(string email, string newPassword);
        
        //Task<bool> VerifyPassword(string email, string password);

        Task <bool> ForgotPassword(string email);

        Task<bool> ResetPassword(string token, string newPassword);

    }
}
