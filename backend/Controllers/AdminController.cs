using Kitverse_backend_01.Data;
using Kitverse_backend_01.Models;
using Kitverse_backend_01.Services;
using Kitverse_backend_01.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
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
        [Authorize(Roles ="Admin")]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            var dashboard = await _adminService.GetAdminDashboard();
            return Ok(dashboard);
        }
        // GET: api/admin/users
        [Authorize(Roles = "Admin")]
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _adminService.GetUsers();
            return Ok(users);
        }

        // GET: api/admin/users/{id}
        [Authorize(Roles = "Admin")]
        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _adminService.GetUserById(id);
            if (user == null)
                return NotFound();
            return Ok(user);
        }
        // PUT: api/admin/users/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUser userUpdate)
        {
            var updatedUser = await _adminService.UpdateUser(id, userUpdate);
            if (updatedUser == null)
                return NotFound();
            return Ok(updatedUser);
        }
        // PUT: api/admin/users/{id}/role
        [Authorize(Roles = "Admin")]
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
        [Authorize(Roles ="Admin")]
        [HttpPost("banners")]
        public async Task<IActionResult> AddBanner([FromBody] Banner banner) { 
            await _adminService.AddBanner(banner);
            return Ok(banner);
        }
        // PUT: api/admin/banners/{id}
        [Authorize(Roles ="Admin")]
        [HttpPut("banners/{id}")]
        public async Task<IActionResult> UpdateBanner(int id, [FromBody] Banner bannerUpdate)
        {
            var updatedBanner = await _adminService.UpdateBanner(id, bannerUpdate);
            if (updatedBanner == null)
                return NotFound();
            return Ok(updatedBanner);
        }
        // DELETE: api/admin/banners/{id}
        [Authorize(Roles ="Admin")]
        [HttpDelete("banners/{id}")]
        public async Task<IActionResult> DeleteBanner(int id)
        {
            var result = await _adminService.DeleteBanner(id);
            if (!result)
                return NotFound();
            return Ok(new { message = "Banner deleted successfully." });
        }
        // DELETE: api/admin/users/{id}
        [Authorize(Roles ="Admin")]
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await _adminService.DeleteUser(id);
            if (!result)
                return NotFound();
            return Ok(new { message = "User deleted successfully." });
        }
        // GET: api/admin/invoices]
        [Authorize(Roles = "Admin")]
        [HttpGet("invoices")]
        public async Task<IActionResult> GetInvoices()
        {
            var invoices = await _adminService.GetInvoices();
            return Ok(invoices);
        }
        // GET: api/admin/invoices/{id}
        [Authorize (Roles ="Admin")]
        [HttpGet("invoices/{id}")]
        public async Task<IActionResult> GetInvoice(int id)
        {
            var invoice = await _adminService.GetInvoiceById(id);
            if (invoice == null)
                return NotFound();
            return Ok(invoice);
        }
        //GET: api/admin/analytics/avg-sales
        [Authorize(Roles = "Admin")]
        [HttpGet("analytics/avg-sales")]
        public async Task<IActionResult> GetAvgSales()
        {
            var avgSales = await _adminService.GetAvgSales();
            return Ok(avgSales);
        }

        //GET: api/admin/analytics/avg-users-per-month
        [Authorize(Roles = "Admin")]
        [HttpGet("analytics/avg-users")]
        public async Task<IActionResult> GetAvgUsersPerMonth()
        {
            var avgUsers = await _adminService.GetAvgUserPerMonth();
            return Ok(avgUsers);
        }

        //POST: api/admin/emails/send-newsletter
        [Authorize(Roles = "Admin")]
        [HttpPost("emails/send-newsletter")]
        public async Task<IActionResult> SendNewsletter([FromBody] Newsletter request)
        {
            try
            {
                var sentCount = await _adminService.SendNewsletter(request.subject, request.htmlBody);

                return Ok(new
                {
                    msg = "Newsletter sent successfully",
                    emailsSent = sentCount
                });


            }
            catch(Exception ex)
            {
                return BadRequest(new
                {
                    msg = ex.Message
                });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("sales-over-time")]
        public async Task<IActionResult> GetSalesOverTime([FromQuery] int months = 12)
        {
            var data = await _adminService.GetSalesOverTime(months);
            return Ok(data);
        }

        //POST: api/admin/send-invoice

        
        [HttpPost("send-invoice/{invoiceId}")]
        public async Task<IActionResult> SendInvoice(int invoiceId)
        {
            try
            {
                var success = await _adminService.SendInvoice(invoiceId);

                if (!success)
                {
                    return NotFound(new
                    {
                        message = "Invoice not found."
                    });
                }

                return Ok(new
                {
                    message = "Invoice sent successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

    }
}
