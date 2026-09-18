using Microsoft.AspNetCore.Mvc;

namespace Kitverse_backend_01.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly ITShirtService _tshirtService;

        public SearchController(ITShirtService tshirtService)
        {
            _tshirtService = tshirtService;
        }

        // GET: api/Search?q=chiefs
        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return Ok(new List<object>()); //empty search returns nothing, not the whole catalog
            }

            var results = await _tshirtService.Search(q);
            return Ok(results);
        }
    }
}