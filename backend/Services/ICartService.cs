using Kitverse_backend_01.DTOs;
using Kitverse_backend_01.Models;

namespace Kitverse_backend_01.Services
{
    public interface ICartService
    {

        Task<ShoppingCart?> GetCart(int userId);

        Task<bool> AddItem(int userId, int itemId, int quantity);

        Task<bool> RemoveItem(int userId, int itemId);

        Task<bool> UpdateItem(int userId, int itemId, int quantity);

        Task UpdateTotal(int id);

        Task<bool> ClearCart(int userId);

        Task<decimal> GetCartTotal(int userId);

        Task<bool> addToWishList(int userId,int t_shirt_id);

        Task<bool> RemoveFromWishList(int userId, int t_shirtId);

        Task<List<TShirt>> GetWishlist(int userId);

        Task<PromoCodeResult> ApplyPromoCode(int userId, string code);
        Task<bool> RemovePromoCode(int userId);

    }
}
