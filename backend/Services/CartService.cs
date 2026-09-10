using System.Threading.Tasks;
using Kitverse_backend_01.Data;
using Kitverse_backend_01.Models;
using Microsoft.EntityFrameworkCore;

namespace Kitverse_backend_01.Services
{
    public class CartService : ICartService
    {
        private readonly KitverseDbContext _context;
        public CartService(KitverseDbContext context)
        {
            _context = context;
        }
        public async Task<ShoppingCart?> GetCart(int userId)
        {
            // Retrieve the shopping cart for the given user id from the database
            var cart = _context.ShoppingCarts.Include(c => c.ItemLists).
                     ThenInclude(il => il.TShirt).
                     FirstOrDefault(c => c.UserId == userId && c.CartStatus == "Active");

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
            if (quantity <= 0)
                return false;
            var cart = await GetCart(userId);

            var tshirt = await _context.TShirts.FindAsync(itemId);

            if (tshirt == null)

                return false;


            var existingItem = cart.ItemLists.
                FirstOrDefault(i => i.TShirtId == itemId);
            if (existingItem != null)
            {
                existingItem.Quantity += quantity;
                existingItem.UnitPurchaseAtTime = tshirt.ShirtPrice;

            }
            else
            {
                var newItem = new ItemList
                {
                    CartId = cart.CartId,
                    TShirtId = itemId,
                    Quantity = quantity,
                    UnitPurchaseAtTime = tshirt.ShirtPrice


                };
                cart.ItemLists.Add(newItem);
                await UpdateTotal(cart.CartId);

                await _context.SaveChangesAsync();

                return true;


            }
            return false;
        }

        public async Task<bool> RemoveItem(int userId, int tShirtId)
        {
            try
            {
                var cart = await GetCart(userId);
                var itemList = cart.ItemLists
                    .FirstOrDefault(il => il.TShirtId == tShirtId);

                if (itemList == null)
                    return false;

                _context.ItemLists.Remove(itemList);

                // Update cart total
                await UpdateTotal(cart.CartId);

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateItem(int userId, int tShirtId, int quantity)
        {
            if (quantity < 0)
                return false;

            try
            {
                var cart = await GetCart(userId);
                var itemList = cart.ItemLists
                    .FirstOrDefault(il => il.TShirtId == tShirtId);

                if (itemList == null)
                    return false;

                if (quantity == 0)
                {
                    // Remove the item if quantity is 0
                    _context.ItemLists.Remove(itemList);
                }
                else
                {
                    // Check TShirt availability
                    var tShirt = await _context.TShirts.FindAsync(tShirtId);
                    if (tShirt == null)
                        return false;

                    // Check if TShirt is available
                    if (tShirt.ShirtStatus != "Available" && tShirt.ShirtStatus != "InStock")
                        return false;

                    itemList.Quantity = quantity;
                    itemList.UnitPurchaseAtTime = tShirt.ShirtPrice; // Update price in case it changed
                }

                // Update cart total
                await UpdateTotal(cart.CartId);

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }

        }

        public async Task UpdateTotal(int id)
        {
            var cart = await _context.ShoppingCarts
                .Include(c => c.ItemLists)
                .FirstOrDefaultAsync(c => c.CartId == id);

            if (cart != null)
            {
                cart.TotalCost = (int)cart.ItemLists.Sum(il => il.UnitPurchaseAtTime * il.Quantity);
            }

        }

        public async Task<bool> ClearCart(int userId)
        {
            try
            {
                var cart = await GetCart(userId);

                if (cart.ItemLists.Any())
                {
                    _context.ItemLists.RemoveRange(cart.ItemLists);
                    cart.TotalCost = 0;
                    await _context.SaveChangesAsync();
                }

                return true;
            }
            catch
            {
                return false;
            }

        }

        public async Task<decimal> GetCartTotal(int userId)
        {
            var cart = await GetCart(userId);
            return cart.ItemLists.Sum(il => il.UnitPurchaseAtTime * il.Quantity);

        }

        public async Task<bool> addToWishList(int userId, int t_shirt_id)
        {
           
                //code to execute if the userId and The Tshirt ID are valid  and no duplicate is entered 
                if ( await _context.Users.AnyAsync(t => t.UserId == userId) && await _context.TShirts.AnyAsync(t => t.TShirtId == t_shirt_id) &&  !await _context.Wishlists.AnyAsync(t=> t.UserId==userId && t.TShirtId==t_shirt_id))
                {
                    Wishlist list = new Wishlist
                    {
                        UserId = userId,
                        TShirtId = t_shirt_id,
                        DateAdded = DateTime.UtcNow,
                    };
                    await _context.Wishlists.AddAsync(list);
                    await _context.SaveChangesAsync();

                    return true;
                }
                else
                {
                    return false;
                }
            
            
        }



        public async Task<List<TShirt>> GetWishlist(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
            {
                return null;
            }
          
            return await _context.Wishlists //From the wishList ...
                .Where(w => w.UserId == userId)//Trim it down to the wishlist of that specifc user
                .Include(w => w.TShirt) //load the users tshirt
                .ThenInclude(t => t.ShirtLinks.Where(t=> t.IsMain ==true)) //load their ShirtLink
                .Select(w => w.TShirt) //bring back the Tshirt which satisfies the conditions above
                .ToListAsync(); //send it to the list 
        }

        public async Task<bool> RemoveFromWishList(int userId, int t_shirtId)
        {

            Wishlist List = await _context.Wishlists.FirstOrDefaultAsync(u => u.UserId == userId && u.TShirtId ==t_shirtId );

                if( List == null)
                {
                    return false;
                }
                else
                {
                     _context.Wishlists.Remove(List);
                    await _context.SaveChangesAsync();
                return true;
                }    
        }

     
    }
}
