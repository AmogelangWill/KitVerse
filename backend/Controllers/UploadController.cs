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


        private async Task<IActionResult> deleteImage(int ShirtlinkId ,string Bucket)
        {
            try
            {
                var result = await _storageService.DeleteImage(ShirtlinkId, Bucket);
                return Ok(new { result });

            }
            catch (Exception ex)
            {
                return BadRequest(new {message= ex.Message });
            }
        }

        [Authorize(Roles ="Admin,Item Lister")]
        [HttpDelete("banner")]
        public async Task<IActionResult> DeleteBanner(int ShirtlinkId)
        {
            return await deleteImage(ShirtlinkId, _config["Supabase:BannerBucket"]!);
        }


        [Authorize(Roles = "Admin,Item Lister")]
        [HttpDelete("Jersey")]
        public async Task<IActionResult> DeleteJersey(int ShirtlinkId)
        {
            return await deleteImage(ShirtlinkId, _config["Supabase:JerseyBucket"]!);
        }


        //DELETE: api/Upload/cleanup-images/{bucket}
        //bucket must be exactly one of:"Football jerseys"or "Banners"
        [Authorize(Roles = "Admin")]
        [HttpDelete("cleanup-images/{bucket}")]
        public async Task<IActionResult> CleanOrphanedImages(string bucket)
        {
            try
            {
                var deleted = await _storageService.CleanOrphanedImages(bucket);
                return Ok(new { message = $"Deleted {deleted.Count} orphaned image(s).", deleted });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}