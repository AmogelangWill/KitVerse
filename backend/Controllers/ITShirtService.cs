using Kitverse_backend_01.Models;

namespace Kitverse_backend_01.Controllers
{
    public interface ITShirtService
    {
        Task<List<TShirt>> GetAll();
        Task<TShirt?> GetById(int id);
    }
}