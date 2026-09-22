using Kitverse_backend_01.DTOs;
using Kitverse_backend_01.Models;
using Kitverse_backend_01.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

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

        [HttpGet("{userId}")] //gets the Cart of a Specific User 
        public async Task<IActionResult> GetCart(int userId)
        {
            var cart = await _cartService.GetCart(userId);
            if (cart == null) return NotFound();
            return Ok(cart);
        }

        [HttpPost("{userId}/items/{itemId}")] //adds an item To the A cart requires the Item Id and Userid
        public async Task<IActionResult> AddItem(int userId, int itemId, [FromQuery] int quantity = 1)
        {
            var result = await _cartService.AddItem(userId, itemId, quantity);
            if (!result) return BadRequest(new { message = "Unable to add item to cart." });
            return Ok(new { message = "Item added to cart." });
        }

        [HttpDelete("{userId}/items/{itemId}")] //removes the Item from the cart requires the User ID and Item ID
        public async Task<IActionResult> RemoveItem(int userId, int itemId)
        {
            var result = await _cartService.RemoveItem(userId, itemId);
            if (!result) return NotFound(new { message = "Item not found in cart." });
            return Ok(new { message = "Item removed from cart." });
        }

        [HttpPut("{userId}/items/{itemId}")] //Updates the Item
        public async Task<IActionResult> UpdateItem(int userId, int itemId, [FromQuery] int quantity)
        {
            var result = await _cartService.UpdateItem(userId, itemId, quantity);
            if (!result) return BadRequest(new { message = "Unable to update item." });
            return Ok(new { message = "Item updated." });
        }

        [HttpPost("{userId}/clear")] //clears the Cart
        public async Task<IActionResult> ClearCart(int userId)
        {
            var result = await _cartService.ClearCart(userId);
            if (!result) return BadRequest(new { message = "Unable to clear cart." });
            return Ok(new { message = "Cart cleared." });
        }

        [HttpGet("{userId}/total")]  //total cost in the cart 
        public async Task<IActionResult> GetTotal(int userId)
        {
            var total = await _cartService.GetCartTotal(userId);
            return Ok(new { total });
        }


        [Authorize(Roles = "Customer")]
        [HttpPost("Wishlist/{userId:int}/{TshirtId:int}")]
        public async Task<IActionResult> AddtoWishlist(int userId , int TshirtId)
        {   
            bool Result = await _cartService.addToWishList(userId , TshirtId);

            if (Result == true)
            {
                return Ok(new { message = "Product Added" });
            }
            else
            {
                return BadRequest(new { message = "Could Not Add to wishlist" });
            }
            
        }





        [Authorize(Roles = "Customer")]
        [HttpPost("{userId}/apply-promo")]
        public async Task<IActionResult> ApplyPromoCode(int userId, [FromBody] ApplyPromoCode request)
        {
            var result = await _cartService.ApplyPromoCode(userId, request.Code);
            if (!result.Valid)
                return BadRequest(result);
            return Ok(result);
        }

        [Authorize(Roles = "Customer")]
        [HttpDelete("{userId}/promo")]
        public async Task<IActionResult> RemovePromoCode(int userId)
        {
            await _cartService.RemovePromoCode(userId);
            return Ok(new { message = "Promo code removed." });
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("wishlist/{userId:int}")]
        public async Task<IActionResult> GetWishlist(int userId)
        {
            var wishlist = await _cartService.GetWishlist(userId);
            if (wishlist == null)
            {
                return NotFound(new { message = "User not found." });
            }
            return Ok(wishlist);
        }

        [Authorize(Roles = "Customer")]
        [HttpDelete("Wishlist/{userId:int}/{TshirtId:int}")]
        public async Task<IActionResult> RemoveFromWhishList(int userId, int TshirtId)
        {
            bool Result = await _cartService.RemoveFromWishList(userId, TshirtId);

            if (Result == true)
            {
                return Ok(new { message = "Tshirt Removed from wishlist" });

            }
            else
            {
                return BadRequest(new { message = "could not remove tshirt from wishlist" });
            } 
        }
    }
}
