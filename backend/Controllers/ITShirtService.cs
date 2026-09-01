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


    }
}