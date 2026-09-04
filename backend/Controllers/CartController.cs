using System.Threading.Tasks;
using Kitverse_backend_01.Models;
using Kitverse_backend_01.Services;
using Microsoft.AspNetCore.Mvc;

namespace Kitverse_backend_01.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetCart(int userId)
        {
            var cart = await _cartService.GetCart(userId);
            if (cart == null) return NotFound();
            return Ok(cart);
        }

        [HttpPost("{userId}/items/{itemId}")]
        public async Task<IActionResult> AddItem(int userId, int itemId, [FromQuery] int quantity = 1)
        {
            var result = await _cartService.AddItem(userId, itemId, quantity);
            if (!result) return BadRequest(new { message = "Unable to add item to cart." });
            return Ok(new { message = "Item added to cart." });
        }

        [HttpDelete("{userId}/items/{itemId}")]
        public async Task<IActionResult> RemoveItem(int userId, int itemId)
        {
            var result = await _cartService.RemoveItem(userId, itemId);
            if (!result) return NotFound(new { message = "Item not found in cart." });
            return Ok(new { message = "Item removed from cart." });
        }

        [HttpPut("{userId}/items/{itemId}")]
        public async Task<IActionResult> UpdateItem(int userId, int itemId, [FromQuery] int quantity)
        {
            var result = await _cartService.UpdateItem(userId, itemId, quantity);
            if (!result) return BadRequest(new { message = "Unable to update item." });
            return Ok(new { message = "Item updated." });
        }

        [HttpPost("{userId}/clear")]
        public async Task<IActionResult> ClearCart(int userId)
        {
            var result = await _cartService.ClearCart(userId);
            if (!result) return BadRequest(new { message = "Unable to clear cart." });
            return Ok(new { message = "Cart cleared." });
        }

        [HttpGet("{userId}/total")]
        public async Task<IActionResult> GetTotal(int userId)
        {
            var total = await _cartService.GetCartTotal(userId);
            return Ok(new { total });
        }
    }
}
