using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Kitverse_backend_01.DTOs;

namespace Kitverse_backend_01.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        //POST: api/Review
        [Authorize] //any logged-in user can leave a review, not just Admin/Item Lister
        [HttpPost]
        public async Task<IActionResult> AddReview([FromBody] CreateReview request)
        {
            try
            {
                var review = await _reviewService.AddReview(request);
                return Ok(review);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //GET: api/Review/shirt/5
        [HttpGet("shirt/{tshirtId:int}")]
        public async Task<IActionResult> GetReviewsForShirt(int tshirtId)
        {
            var reviews = await _reviewService.GetReviewsForShirt(tshirtId);
            return Ok(reviews);
        }

        //GET: api/Review/shirt/5/stars/4
        [HttpGet("shirt/{tshirtId:int}/stars/{stars:int}")]
        public async Task<IActionResult> GetReviewsForShirtByStars(int tshirtId, int stars)
        {
            var reviews = await _reviewService.GetReviewsForShirtByStars(tshirtId, stars);
            return Ok(reviews);
        }
    }
}