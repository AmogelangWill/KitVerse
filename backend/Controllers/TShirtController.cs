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
        [HttpGet("{id}")]
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
        [HttpGet("{teamName}")]
        public async Task<IActionResult> GetByTeamName(string teamName)
        {
            var tshirt =await _tshirtService.GetByTeam(teamName);

            if(tshirt == null)
            {
                return NotFound(new { message = "Shirt not found." });
            }

            return Ok(tshirt);
        }   

     
    }
}