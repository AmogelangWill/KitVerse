using Kitverse_backend_01.Data;
using Kitverse_backend_01.Models;
using Microsoft.EntityFrameworkCore;

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

        public async Task<List<TShirt>>GetByTeam(String Name)
        {
            //this method is used to get tshirst By teams or by shirt name could be used for Filtering


            return await _context.TShirts.Include(t=> t.Team)
                                         .Include(t=> t.ShirtLinks)
                                         .Where(t=> t.Team.TeamName==Name || t.ShirtName==Name)
                                         .ToListAsync();
        }

        public async Task<TShirt?> GetById(int id)
        {
            return await _context.TShirts
                .Include(t => t.Team)
                .Include(t => t.ShirtLinks)
                .FirstOrDefaultAsync(t => t.TShirtId == id);
        }
    }
}