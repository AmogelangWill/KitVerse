using Kitverse_backend_01.Data;
using Kitverse_backend_01.Models;
using Kitverse_backend_01.Services;
using Kitverse_backend_01.DTOs;
using Microsoft.AspNetCore.Mvc;
namespace Kitverse_backend_01.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }
        // GET: api/admin/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            var dashboard = await _adminService.GetAdminDashboard();
            return Ok(dashboard);
        }
        // GET: api/admin/users
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _adminService.GetUsers();
            return Ok(users);
        }

        // GET: api/admin/users/{id}
        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _adminService.GetUserById(id);
            if (user == null)
                return NotFound();
            return Ok(user);
        }
        // PUT: api/admin/users/{id}
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUser userUpdate)
        {
            var updatedUser = await _adminService.UpdateUser(id, userUpdate);
            if (updatedUser == null)
                return NotFound();
            return Ok(updatedUser);
        }
        // PUT: api/admin/users/{id}/role
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> ChangeUserRole(int id, [FromBody] string newRole)
        {
            var result = await _adminService.ChangeUserRole(id, newRole);
            if (!result)
                return NotFound();
            return Ok(new { message = "User role changed successfully." });
        }
        //Get all banners
        [HttpGet("banners")]
        public async Task<IActionResult> GetBanners()
        {
            var banners = await _adminService.GetBanners();
            return Ok(banners);
        }
        // POST: api/admin/banners
        [HttpPost("banners")]
        public async Task<IActionResult> AddBanner([FromBody] Banner banner) { 
            await _adminService.AddBanner(banner);
            return Ok(banner);
        }
        // PUT: api/admin/banners/{id}
        [HttpPut("banners/{id}")]
        public async Task<IActionResult> UpdateBanner(int id, [FromBody] Banner bannerUpdate)
        {
            var updatedBanner = await _adminService.UpdateBanner(id, bannerUpdate);
            if (updatedBanner == null)
                return NotFound();
            return Ok(updatedBanner);
        }
        // DELETE: api/admin/banners/{id}
        [HttpDelete("banners/{id}")]
        public async Task<IActionResult> DeleteBanner(int id)
        {
            var result = await _adminService.DeleteBanner(id);
            if (!result)
                return NotFound();
            return Ok(new { message = "Banner deleted successfully." });
        }
        // DELETE: api/admin/users/{id} 
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await _adminService.DeleteUser(id);
            if (!result)
                return NotFound();
            return Ok(new { message = "User deleted successfully." });
        }

    }
}
