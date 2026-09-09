using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Collections.Generic;
using Kitverse_backend_01.Data;
using Kitverse_backend_01.Models;
using Kitverse_backend_01.DTOs;
using Microsoft.EntityFrameworkCore;


namespace Kitverse_backend_01.Services
{
    public class AdminService : IAdminService
    {
        private readonly KitverseDbContext _context;

        public AdminService(KitverseDbContext context)
        {
            _context = context;
        }
        //get stats for admin dashboard
        public async Task<AdminDashboard> GetAdminDashboard()
        {
            return new AdminDashboard
            {
                TotalUsers = await _context.Users.CountAsync(),
                TotalCustomers = await _context.Users
                    .CountAsync(u => u.Role == "Customer"),

                TotalItemListers = await _context.Users
                    .CountAsync(u => u.Role == "ItemLister"),

                TotalAdmins = await _context.Users
                    .CountAsync(u => u.Role == "Admin")
            };
        }

        //get all users
        public async Task<List<User>> GetUsers()
        {
            return await _context.Users.Select(u => new User
            {
                UserId = u.UserId,
                UserName = u.UserName,
                UserSurname = u.UserSurname,
                UserEmail = u.UserEmail,
                Role = u.Role,
                DateAdded = u.DateAdded,
           

            }).ToListAsync();
        }
        //get user by id
        public async Task<User> GetUserById(int userId)
        {
            return await _context.Users.
                Where(u => u.UserId == userId).
                Select(u => new User
                {
                    UserId = u.UserId,
                    UserName = u.UserName,
                    UserSurname = u.UserSurname,
                    UserEmail = u.UserEmail,
                    Role = u.Role,
                    DateAdded = u.DateAdded,
                  
                }).FirstOrDefaultAsync();

        }
        //update user
        public async Task<User?> UpdateUser(int userID, UpdateUser userUpdate)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userID);
            if (user == null)
                return null;

            user.UserName = userUpdate.UserName;
            user.UserSurname = userUpdate.UserSurname;
            user.UserEmail = userUpdate.UserEmail;
            user.Role = userUpdate.Role;

            await _context.SaveChangesAsync();
            return new User
            {
                UserId = user.UserId,
                UserName = user.UserName,
                UserSurname = user.UserSurname,
                UserEmail = user.UserEmail,
                Role = user.Role,
                DateAdded = user.DateAdded,
               
            };
        }

      

        public async Task<bool> DeleteUser(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<bool> ChangeUserRole(int userId, string newRole)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return false;

            // Only allow valid KitVerse roles
            if (newRole != "Customer" &&
                newRole != "ItemLister" &&
                newRole != "Admin")
            {
                return false;
            }

            user.Role = newRole;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Banner>> GetBanners()
        {
            return await _context.Banners
                .OrderByDescending(b => b.DateAdded)
                .ToListAsync();
        }

        public async Task<Banner?> UpdateBanner(int bannerId, Banner bannerUpdate)
        {
            var banner = await _context.Banners
               .FirstOrDefaultAsync(b => b.BannerId == bannerId);

            if (banner == null)
                return null;

            banner.ImageUrl = bannerUpdate.ImageUrl;

            await _context.SaveChangesAsync();

            return banner;
        }

        public async Task<bool> DeleteBanner(int bannerId)
        {
            var banner = await _context.Banners
                .FirstOrDefaultAsync(b => b.BannerId == bannerId);

            if (banner == null)
                return false;

            _context.Banners.Remove(banner);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Banner?> AddBanner(Banner banner)
        {

            banner.DateAdded = DateTime.UtcNow;

            _context.Banners.Add(banner);

            await _context.SaveChangesAsync();

            return banner;
        }
    }
}
