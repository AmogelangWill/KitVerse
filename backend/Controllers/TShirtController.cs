using Microsoft.AspNetCore.Mvc;

namespace Kitverse_backend_01.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TShirtController : ControllerBase
    {
        private readonly ITShirtService _tshirtService;

        public TShirtController(ITShirtService tshirtService)
        {
            _tshirtService = tshirtService;
        }

        // GET: api/TShirt
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tshirts = await _tshirtService.GetAll();
            return Ok(tshirts);
        }

        // GET: api/TShirt/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var tshirt = await _tshirtService.GetById(id);
            if (tshirt == null)
            {
                return NotFound(new { message = "Shirt not found." });
            }
            return Ok(tshirt);
        }
        //(Could be name of a team or the tshirt)
        // Get : api/TShirt/name
        [HttpGet("team/{teamName}")]
        public async Task<IActionResult> GetByTeamName(string teamName)
        {
            var tshirt =await _tshirtService.GetByTeam(teamName);

            if(tshirt == null)
            {
                return NotFound(new { message = "Shirt not found." });
            }

            return Ok(tshirt);
        }

        // Get : api/TShirt/name/ascending
        [HttpGet("team/{Name}/asc")]
        public async Task<IActionResult> SortByAscendingPrice(string Name)
        {
            var tshirt = await _tshirtService.GetByPriceAsc(Name);

            if(tshirt == null)
            {
                return NotFound(new { message = "Shirt Not Found" });
            }

            return Ok(tshirt);
        }

        // Get : api/TShirt/name/descending
        [HttpGet("team/{Name}/desc")]
        public async Task<IActionResult> SortByDescendingPrice(string Name)
        {
            var tshirt = await _tshirtService.GetByPriceDesc(Name);

            if(tshirt == null)
            {
                return NotFound( new { message="Shirt Not Found"});
            }

            return Ok(tshirt);
        }

        // GET: api/TShirt
        [HttpGet("new")]
        public async Task<IActionResult> GetNewArrivals()
        {
            var tshirts = await _tshirtService.GetNewArrivals();
            return Ok(tshirts);
        }


    }
}