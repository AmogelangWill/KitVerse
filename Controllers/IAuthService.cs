using Kitverse_backend_01.Models;

namespace Kitverse_backend_01.Controllers
{
    public interface IAuthService // this interface is used to define the methods that will be implemented in the AuthService class.
    {
        public Task<User> Register (User user); // this method is used to register a new user
        
        public  Task<int> Login(string username, string password); // this method is used to login a user

      
       
    }
}
