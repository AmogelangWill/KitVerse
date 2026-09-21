using Kitverse_backend_01.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Kitverse_backend_01.DTOs;

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
            var tshirt = await _tshirtService.GetByTeam(teamName);

            if (tshirt == null)
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

            if (tshirt == null)
            {
                return NotFound(new { message = "Shirt Not Found" });
            }

            return Ok(tshirt);
        }

        // Get : api/Tshirt/shirtSize/ShirtID/AmountPerSize  (Already Implemented in the FrontEnd)
        [HttpGet("Inventory /{ShirtSize}/{ShirtId}/AmountPerSize")]
        public async Task<IActionResult> GetAmountAvaliablePerSize(String ShirtSize, int ShirtId)
        {
            List<int> NumberList = await _tshirtService.GetCountPerSzie(ShirtSize, ShirtId);
            if (NumberList == null)
            {
                return NotFound(new { message = "Amount Available per size not Found" });

            }
            return Ok(NumberList);
        }

        // Get : api/TShirt/name/descending
        [HttpGet("team/{Name}/desc")]
        public async Task<IActionResult> SortByDescendingPrice(string Name)
        {
            var tshirt = await _tshirtService.GetByPriceDesc(Name);

            if (tshirt == null)
            {
                return NotFound(new { message = "Shirt Not Found" });
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

        // POST: api/TShirt
        [Authorize(Roles = "Admin,Item Lister")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTShirt request)
        {
            try
            {
                var created = await _tshirtService.Create(request);
                return Ok(created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Item Lister")]
        [HttpPost("Tshirt")]
        public async Task<IActionResult> UpdateTshirt([FromBody] UpdateTShirt request)
        {
            bool Results = await _tshirtService.UpdateShirt(request);

            if (Results == true)
            {
                return Ok(new {message="Shirt Updated"});
            }
            else
            {
                return BadRequest(new { message = "COuld not update the Tshirt" });
            }
        }



        // POST: api/TShirt
        [Authorize(Roles = "Admin,Item Lister")]
        [HttpPost("Banner")]
        public async Task<IActionResult> CreateBanner([FromBody] CreateBanner request)
        {
            try
            {
                var created = await _tshirtService.CreateBanner(request);
                return Ok(created ) ;
            }
            catch(Exception ex)
            {
                return BadRequest(new {message = ex.Message});
            }
        }

        [HttpGet("Banner/{ID1}/{ID2}")]
        public async Task<IActionResult> GetFromBannerClick(int ID1, int ID2)
        {
            var Shirts = await _tshirtService.GetFromBAnnerClick(ID1, ID2);
            if(Shirts != null)
            {
                return Ok(Shirts);
            }
            else
            {
                return NotFound(new {message="Associated Shirts Dont't exists"});
            }
           
            
        }


        // GET: api/TShirt/competitions
        [HttpGet("competitions")]
        public async Task<IActionResult> GetAllCompetitions()
        {
            var competitions = await _tshirtService.GetAllCompetitions();
            return Ok(competitions);
        }

        // GET: api/TShirt/competition/5
        [HttpGet("competition/{competitionId:int}")]
        public async Task<IActionResult> GetByCompetition(int competitionId)
        {
            var tshirts = await _tshirtService.GetByCompetition(competitionId);
            return Ok(tshirts);
        }

        // POST: api/TShirt/competition
        [Authorize(Roles = "Admin,Item Lister")]
        [HttpPost("competition")]
        public async Task<IActionResult> AddShirtToCompetition([FromBody] AddShirtToCompetition request)
        {
            try
            {
                await _tshirtService.AddShirtToCompetition(request.TShirtId, request.CompetitionId);
                return Ok(new { message = "Shirt added to competition." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/TShirt/competitions
        [Authorize(Roles = "Admin,Item Lister")]
        [HttpPost("competitions")]
        public async Task<IActionResult> CreateCompetition([FromBody] CreateCompetition request)
        {
            try
            {
                var competition = await _tshirtService.CreateCompetition(request.CompetitionName);
                return Ok(competition);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles ="Admin,Item Lister")]
        [HttpPut("StockUpdate")]
        public async Task<IActionResult> UpdateStock([FromBody] List< StockUpdate> Stock)
        { 
            try
            {
                var list = await _tshirtService.UpdateStockSizesBulk(Stock);

                if (list == null) //it means that all tshirts were successfully updated
                {
                    return Ok(new { message = "All Shirts Stock Successfully updated" });
                }
                else //some or all were unsuccessfully Updated ... you will check the message 
                {
                    return Ok(list);
                }
            }
            catch(Exception ex) //to return if an exception was encountered 
            {
                 return BadRequest(new {message = ex.Message});
            }
            
        }

        [Authorize(Roles = "Admin,Item Lister")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteShirt(int id)
        {
            try
            {
                var success = await _tshirtService.DeleteShirt(id);
                if (!success) return NotFound(new { message = "Shirt not found." });
                return Ok(new { message = "Shirt successfully deleted." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}