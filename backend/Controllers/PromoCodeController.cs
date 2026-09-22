using Kitverse_backend_01.DTOs;
using Kitverse_backend_01.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kitverse_backend_01.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PromoCodeController : ControllerBase
    {
        private readonly IPromoCodeService _promoCodeService;
        private readonly ILogger<PromoCodeController> _logger;

        public PromoCodeController(IPromoCodeService promoCodeService, ILogger<PromoCodeController> logger)
        {
            _promoCodeService = promoCodeService;
            _logger = logger;
        }

        // POST: api/PromoCode
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreatePromoCode([FromBody] CreatePromoCode request)
        {
            try
            {
                var promo = await _promoCodeService.CreatePromoCode(request);
                return Ok(promo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Creating promo code failed");
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/PromoCode
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllPromoCodes()
        {
            var promoCodes = await _promoCodeService.GetAllPromoCodes();
            return Ok(promoCodes);
        }

        // DELETE: api/PromoCode/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePromoCode(int id)
        {
            var result = await _promoCodeService.DeletePromoCode(id);
            if (!result)
                return NotFound(new { message = "Promo code not found." });

            return Ok(new { message = "Promo code deleted successfully." });
        }

        // POST: api/PromoCode/validate
        [AllowAnonymous]
        [HttpPost("validate")]
        public async Task<IActionResult> ValidatePromoCode([FromBody] ApplyPromoCode request)
        {
            var result = await _promoCodeService.ValidatePromoCode(request.Code);
            if (!result.Valid)
                return BadRequest(result);

            return Ok(result);
        }
    }
}