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
        private readonly Kitverse_backend_01.Services.IInvoiceService _invoiceService;

        public PaymentController(IPaymentService paymentService, Kitverse_backend_01.Services.IInvoiceService invoiceService)
        {
            _paymentService = paymentService;
            _invoiceService = invoiceService;
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

        [Authorize(Roles = "Customer,Admin")]
        [HttpGet("my-invoices")]
        public async Task<IActionResult> GetMyInvoices()
        {
            try 
            {
                var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdString, out int userId)) return Unauthorized(new { message = "Invalid token" });

                var invoices = await _invoiceService.GetUserInvoicesAsync(userId);
                return Ok(invoices);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer,Admin")]
        [HttpGet("invoice/{invoiceId}/download")]
        public async Task<IActionResult> DownloadInvoice(int invoiceId)
        {
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            var pdfBytes = await _invoiceService.GenerateInvoicePdfAsync(invoiceId, userId);
            if (pdfBytes == null) return NotFound("Invoice not found or access denied.");

            return File(pdfBytes, "application/pdf", $"KitVerse_Invoice_{invoiceId}.pdf");
        }
    }
}