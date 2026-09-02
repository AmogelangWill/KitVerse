using System.Threading.Tasks;
using Kitverse_backend_01.Data;
using Kitverse_backend_01.Models;

namespace Kitverse_backend_01.Services
{
    public class CartService : ICartService
    {
        private readonly KitverseDbContext _context;
        public CartService(KitverseDbContext context)
        {
            _context = context;
        }
        public  async Task<ShoppingCart?> GetCart(int userId)
        {
            // Retrieve the shopping cart for the given user id from the database
            var cart = await _context.ShoppingCarts
                .Include(c => c.ItemLists)
                .ThenInclude(il => il.TShirt)
                .ThenInclude(t => t.Team) // Include Team details if needed
                .Include(c => c.Customer)
                .FirstOrDefaultAsync(c => c.UserId == userId && c.CartStatus == "Active");

            // If no active cart exists, create a new one for the user
            if (cart == null)
            {
                cart = new ShoppingCart
                {
                    UserId = userId,
                    TotalCost = 0,
                    CartStatus = "Active",
                    ItemLists = new List<ItemList>()
                };
                _context.ShoppingCarts.Add(cart);
                _context.SaveChanges();
            }

            return cart;
        }

        public async Task<bool> AddItem(int userId, int itemId, int quantity)
        {
            return 
        }

        public async Task<bool> RemoveItem(int userId, int itemId)
        {
            return 
        }

        public async Task<bool> UpdateItem(int userId, int itemId, int quantity)
        {
            return 
        }

        public async Task<bool> UpdateTotal(int id)
        {
            
        }

        public async Task<bool> ClearCart(int userId)
        {

        }

        public async Task<decimal> GetCartTotal(int userId)
        {
            
        }
    }
}
