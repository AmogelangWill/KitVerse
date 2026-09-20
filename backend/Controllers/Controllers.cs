using Microsoft.AspNetCore.Mvc;
using Kitverse_backend_01.Models;
using Kitverse_backend_01.DTOs;
using Microsoft.AspNetCore.Authorization;

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
                    UserSurname = register.UserSurname,
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
                if (result != null)
                {
                    var token = _authService.GenerateToken(result);
                    return Ok(new { token, result.UserId, result.UserName, result.UserEmail, result.Role });
                }
                return Unauthorized(new { message = "Invalid credentials" });
            }
            catch (InvalidOperationException ex)
            {
                return Ok(new { needsPassword = true, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        // POST: api/Auth/google-login
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLogin request)
        {
            try
            {
                var user = await _authService.GoogleLogin(request.IdToken);
                var token = _authService.GenerateToken(user);
                var needsPassword = string.IsNullOrEmpty(user.PasswordHash);

                return Ok(new { token, user.UserId, user.UserName, user.UserEmail, user.Role, needsPassword });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/Auth/set-password
        [Authorize]
        [HttpPost("set-password")]
        public async Task<IActionResult> SetPassword([FromBody] SetPassword request)
        {
            var success = await _authService.SetPassword(request.Email, request.NewPassword);
            if (!success)
            {
                return NotFound(new { message = "User not found." });
            }
            return Ok(new { message = "Password set successfully." });
        }
        //POST: /api/Auth/forgot-password
        [HttpPost("forgot-password")]
        public async Task <IActionResult> ForgotPassword([FromBody] ForgotPassword request)
        {
            try
            {
                await _authService.ForgotPassword(request.Email);

                return Ok(new
                {
                    message = "Password reset link sent to email, please check your email and spam folder"

                });
            }catch(Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message

                });
            }

        }
        //POST: /api/Auth/reset-password 
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPassword request)
        {
            try
            {
                var success = await _authService.ResetPassword
                               (request.Token, request.NewPassword);
                if (!success)
                {
                    return BadRequest(new
                    {
                        message = "Invalid or expired password reset token"
                    });

                }

                return Ok(new { 
                msg =  "Password reset successfully"
                });

            }catch(Exception ex)
            {
                return BadRequest(new
                {
                    msg = ex.Message
                });
            }
        }
    }
}