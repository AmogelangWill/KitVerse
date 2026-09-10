using Kitverse_backend_01.Data;
using Kitverse_backend_01.DTOs;
using Kitverse_backend_01.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;

namespace Kitverse_backend_01.Controllers
{
    public class TShirtService : ITShirtService
    {
        private readonly KitverseDbContext _context;

        public TShirtService(KitverseDbContext context)
        {
            _context = context;
        }

        public async Task<List<TShirt>> GetAll()
        {
            // Include() pulls in the related Team and ShirtLinks in the same query,
            // so the frontend gets team name + image links without extra requests
            return await _context.TShirts
                .Include(t => t.Team)
                .Include(t => t.ShirtLinks)
                .ToListAsync();
        }

        public async Task<List<TShirt>> GetByTeam(String Name)
        {
            //this method is used to get tshirst By teams or by shirt name could be used for Filtering


            return await _context.TShirts.Include(t => t.Team)
                                     .Include(t => t.ShirtLinks)// I Used EF Cores provider ILike function instead of .Contains to avoid case sensetivity 
                                     .Where(t => EF.Functions.ILike(t.Team.TeamName, $"%{Name}%") || EF.Functions.ILike(t.ShirtName, $"%{Name}%"))
                                     .ToListAsync();
        }

        public async Task<TShirt?> GetById(int id)
        {
            return await _context.TShirts
                .Include(t => t.Team)
                .Include(t => t.ShirtLinks)
                .FirstOrDefaultAsync(t => t.TShirtId == id);
        }

        public async Task<List<TShirt>> GetByPriceAsc(String Name)
        {
            return await _context.TShirts.Include(t => t.Team)
                                          .Include(t => t.ShirtLinks)
                                          .Where(t => t.ShirtName == Name) //this is to allow us to get the names of the Shirts in the Sections before ordering their prices in Ascending 
                                          .OrderBy(t => t.ShirtPrice)
                                          .ToListAsync();
        }

        public async Task<List<TShirt>> GetByPriceDesc(String Name)
        {
            return await _context.TShirts.Include(t => t.Team)
                                         .Include(t => t.ShirtLinks)
                                         .Where(t => t.ShirtName == Name) //this is to allow us to get the names of the Shirts in the Sections before ordering their prices in Ascending 
                                         .OrderByDescending(t => t.ShirtPrice)
                                         .ToListAsync();

        }

        public async Task<List<TShirt>> GetNewArrivals()
        {
            // this method gets all tshirts which were added in the last 3 months
            var cutoff = DateTime.UtcNow.AddMonths(-3);

            return await _context.TShirts
                .Include(t => t.Team)
                .Include(t => t.ShirtLinks)
                .Where(t => t.DateAdded >= cutoff)
                .ToListAsync();
        }

        public async Task<List<int>> GetCountPerSzie(string ShirtSize, int ShirtId)
        {   //gets the amount of tshirts avaiilable per size
            return await _context.Inventory.Where(t => t.TshirtID == ShirtId && t.ShirtSize == ShirtSize)
                                            .Select(t => t.AmountAvailable)
                                            .ToListAsync();
        }

        public async Task<Banner> CreateBanner(CreateBanner request)
        {
            var banner = new Banner
            {
                BannerId = request.BannerId,
                BannerName = request.BannerName,
                BannerDescription = request.BannerDescription,
                BannerUrl = request.BannerUrl,
                Team1ID = request.Team1ID,
                Team2ID = request.Team2ID,
            };

            _context.Banners.Add(banner);
            await _context.SaveChangesAsync();

            return banner;

        }

        public async Task<TShirt> Create(CreateTShirt request)
        {
            var tshirt = new TShirt
            {
                ShirtName = request.ShirtName,
                ShirtSeason = request.ShirtSeason,
                ShirtPrice = request.ShirtPrice,
                ShirtAffiliate = request.ShirtAffiliate,
                ShirtGender = request.ShirtGender,
                ShirtDescription = request.ShirtDescription,
                ShirtStatus = request.ShirtStatus,
                TeamId = request.TeamId,
                DateAdded = request.DateAdded,
                ShirtLinks = request.ImageUrls.Select((url, index) => new ShirtLink
                {
                    ShirtLinkUrl = url,
                    IsMain = index == 0 // first image submitted is treated as the main product image
                }).ToList()
            };

            _context.TShirts.Add(tshirt);
            await _context.SaveChangesAsync(); // saved first so tshirt.TShirtId is generated for the inventory rows below

            foreach (var size in request.Sizes)
            {
                _context.Inventory.Add(new Inventory
                {
                    TshirtID = tshirt.TShirtId,
                    ShirtSize = size.ShirtSize,
                    AmountAvailable = size.AmountAvailable
                });
            }
            await _context.SaveChangesAsync();

            return tshirt;
        }

        public async Task<List<TShirt>> GetFromBAnnerClick(int ID1, int ID2)
        {
            return await _context.TShirts.Include(t => t.Team)
                                  .Include(t => t.ShirtLinks)
                                  .Where(t => t.TShirtId == ID1 || t.TShirtId ==ID2).ToListAsync();

        }
    }
}