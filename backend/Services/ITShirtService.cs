using Kitverse_backend_01.DTOs;
using Kitverse_backend_01.Models;

namespace Kitverse_backend_01.Controllers
{
    public interface ITShirtService
    {
        Task<List<TShirt>> GetAll();

        Task<List<TShirt>> GetNewArrivals();
        Task<TShirt?> GetById(int id);

        Task<List<TShirt>> GetByPriceAsc(String Name);

        Task<List<TShirt>> GetByPriceDesc(String Name);

        Task<List<int>> GetCountPerSzie(String ShirtSize, int ShirtId);

        Task<List<TShirt>> GetByTeam(String Name);

        Task<TShirt> Create(CreateTShirt request);

        Task<Banner> CreateBanner(CreateBanner request);

        Task<List<TShirt>> GetFromBAnnerClick(int ID1,int ID2);

        Task<bool> UpdateShirt(UpdateTShirt shirt);

        Task<List<Competition>> GetAllCompetitions();
        Task<List<TShirt>> GetByCompetition(int competitionId);
        Task AddShirtToCompetition(int tshirtId, int competitionId);
        Task<Competition> CreateCompetition(string competitionName);

        Task<List<TShirt>> Search(string query);

        Task<List<string>> UpdateStockSizesBulk(List<StockUpdate> updates);

        Task<bool> DeleteShirt(int id);
    }
}