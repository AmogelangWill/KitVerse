using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kitverse_backend_01.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IStorageService _storageService;
        private readonly IConfiguration _config;

        public UploadController(IStorageService storageService, IConfiguration config)
        {
            _storageService = storageService;
            _config = config;
        }

        // POST: api/Upload/jersey
        [Authorize(Roles = "Admin,Item Lister")]
        [HttpPost("jersey")]
        public async Task<IActionResult> UploadJerseyImage(IFormFile file)
        {
            return await Upload(file, _config["Supabase:JerseyBucket"]!);
        }

        // POST: api/Upload/banner
        [Authorize(Roles = "Admin,Item Lister")]
        [HttpPost("banner")]
        public async Task<IActionResult> UploadBannerImage(IFormFile file)
        {
            return await Upload(file, _config["Supabase:BannerBucket"]!);
        }

        private async Task<IActionResult> Upload(IFormFile file, string bucket)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file provided." });
            }

            try
            {
                var url = await _storageService.UploadImage(file, bucket);
                return Ok(new { url });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}