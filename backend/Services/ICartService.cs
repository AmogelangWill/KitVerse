using Kitverse_backend_01.Models;

namespace Kitverse_backend_01.Services
{
    public interface ICartService
    {

        Task<ShoppingCart?> GetCart(int userId);

        Task<bool> AddItem(int userId, int itemId, int quantity);

        Task<bool> RemoveItem(int userId, int itemId);

        Task<bool> UpdateItem(int userId, int itemId, int quantity);

        Task<bool> UpdateTotal(int id);

        Task<bool> ClearCart(int userId);

        Task<decimal> GetCartTotal(int userId);
    }
}
