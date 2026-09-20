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
                DateAdded=DateTime.UtcNow,
            };

            _context.Banners.Add(banner);
            await _context.SaveChangesAsync();

            return banner;

        }

        public async Task<bool> UpdateShirt(UpdateTShirt shirt)
        {
            var shirt1 = await _context.TShirts.Include(t => t.ShirtLinks).FirstOrDefaultAsync(t => t.TShirtId == shirt.TShirtId);
            if (shirt1 != null)
            {
                shirt1.ShirtSeason = shirt.ShirtSeason;
                shirt1.ShirtPrice = shirt.ShirtPrice;
                shirt1.ShirtAffiliate = shirt.ShirtAffiliate;
                shirt1.ShirtGender = shirt.ShirtGender;
                shirt1.ShirtDescription = shirt.ShirtDescription;
                shirt1.ShirtStatus = shirt.ShirtStatus;
                shirt1.ShirtName = shirt.ShirtName;
                shirt1.TeamId = shirt.TeamId;
                shirt1.DateAdded = shirt.DateAdded;

                if (shirt.ImageUrls != null && shirt.ImageUrls.Any())
                {
                    _context.ShirtLinks.RemoveRange(shirt1.ShirtLinks);
                    shirt1.ShirtLinks = shirt.ImageUrls.Select((url, index) => new ShirtLink
                    {
                        ShirtLinkUrl = url,
                        IsMain = index == 0
                    }).ToList();
                }

                await _context.SaveChangesAsync();
                return true;
            }
            return false;
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

        public async Task<List<string>> UpdateStockSizesBulk(List<StockUpdate> updates)
        {
            var failed = new List<string>();

            foreach (var update in updates)
            {
                var size = await _context.Inventory.FirstOrDefaultAsync(
                    t => t.TshirtID == update.ShirtId && t.ShirtSize == update.ShirtSize);

                if (size == null)
                {
                    var shirtExists = await _context.TShirts.AnyAsync(t => t.TShirtId == update.ShirtId);
                    if (!shirtExists)
                    {
                        failed.Add($"Shirt {update.ShirtId} does not exist.");
                        continue;
                    }

                    // no stock row yet for this size - create it fresh instead of skipping
                    _context.Inventory.Add(new Inventory
                    {
                        TshirtID = update.ShirtId,
                        ShirtSize = update.ShirtSize,
                        AmountAvailable = update.Amount
                    });
                    continue;
                }

                size.AmountAvailable += update.Amount;
            }

            await _context.SaveChangesAsync();
            return failed;
        }

        public async Task<List<TShirt>> GetFromBAnnerClick(int ID1, int ID2)
        {
            return await _context.TShirts.Include(t => t.Team)
                                  .Include(t => t.ShirtLinks)
                                  .Where(t => t.TShirtId == ID1 || t.TShirtId ==ID2).ToListAsync();

        }

        public async Task<List<Competition>> GetAllCompetitions()
        {
            return await _context.Competitions.ToListAsync();
        }

        public async Task<List<TShirt>> GetByCompetition(int competitionId)
        {
            return await _context.TShirtCompetitions
                .Where(tc => tc.CompetitionId == competitionId)
                .Include(tc => tc.TShirt).ThenInclude(t => t.Team)
                .Include(tc => tc.TShirt).ThenInclude(t => t.ShirtLinks)
                .Select(tc => tc.TShirt)
                .ToListAsync();
        }

        public async Task AddShirtToCompetition(int tshirtId, int competitionId)
        {
            var shirtExists = await _context.TShirts.AnyAsync(t => t.TShirtId == tshirtId);
            var competitionExists = await _context.Competitions.AnyAsync(c => c.CompetitionId == competitionId);

            if (!shirtExists || !competitionExists)
            {
                throw new ArgumentException("Shirt or competition not found.");
            }

            var alreadyLinked = await _context.TShirtCompetitions
                .AnyAsync(tc => tc.TShirtId == tshirtId && tc.CompetitionId == competitionId);

            if (alreadyLinked)
            {
                throw new InvalidOperationException("This shirt is already linked to this competition.");
            }

            _context.TShirtCompetitions.Add(new TShirtCompetition
            {
                TShirtId = tshirtId,
                CompetitionId = competitionId
            });
            await _context.SaveChangesAsync();
        }

        public async Task<Competition> CreateCompetition(string competitionName)
        {
            var exists = await _context.Competitions.AnyAsync(c => c.CompetitionName == competitionName);
            if (exists)
            {
                throw new InvalidOperationException("A competition with this name already exists.");
            }

            var competition = new Competition { CompetitionName = competitionName };
            _context.Competitions.Add(competition);
            await _context.SaveChangesAsync();
            return competition;
        }

        public async Task<List<TShirt>> Search(string query)
        {
            return await _context.TShirts
                .Include(t => t.Team)
                .Include(t => t.ShirtLinks)
                .Where(t =>
                    EF.Functions.ILike(t.ShirtName, $"%{query}%") ||
                    EF.Functions.ILike(t.Team.TeamName, $"%{query}%") ||
                    EF.Functions.ILike(t.ShirtDescription, $"%{query}%") ||
                    EF.Functions.ILike(t.ShirtSeason, $"%{query}%"))
                .ToListAsync();
        }

    }
}