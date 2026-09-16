using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Kitverse_backend_01.DTOs;

namespace Kitverse_backend_01.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        // POST: api/Payment/initialize
        [Authorize]
        [HttpPost("initialize")]
        public async Task<IActionResult> Initialize([FromBody] InitializePayment request)
        {
            try
            {
                var url = await _paymentService.InitializeTransaction(request);
                return Ok(new { authorizationUrl = url });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/Payment/verify/{reference}/{cartId}
        [Authorize]
        [HttpGet("verify/{reference}/{cartId:int}")]
        public async Task<IActionResult> Verify(string reference, int cartId)
        {
            var success = await _paymentService.VerifyTransaction(reference, cartId);
            if (success)
            {
                return Ok(new { message = "Payment verified successfully." });
            }
            return BadRequest(new { message = "Payment verification failed." });
        }
    }
}