using Microsoft.AspNetCore.Mvc;
using Kitverse_backend_01.Models;
using Kitverse_backend_01.DTOs;

namespace Kitverse_backend_01.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        //POST: api/Auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Register register)
        {
            try
            {
                var user = new User
                {
                    UserName = register.UserName,
                    UserEmail = register.UserEmail,
                    PasswordHash = register.Password, // AuthService hashes this internally before saving
                    Role = "Customer"
                };

                var newUser = await _authService.Register(user);
                return Ok(newUser);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Login login)
        {
            try
            {
                var result = await _authService.Login(login.Email, login.Password);
                if (result == 1)
                    return Ok(new { message = "Login successful" });
                return Unauthorized(new { message = "Invalid credentials" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
