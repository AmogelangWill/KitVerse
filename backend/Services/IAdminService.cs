using Kitverse_backend_01.Models;
using Kitverse_backend_01.DTOs;
namespace Kitverse_backend_01.Services
{


    public interface IAdminService
    {
        Task<AdminDashboard> GetAdminDashboard();

        Task<List<User>> GetUsers();


        Task<User> GetUserById(int userId);

        Task<User?> UpdateUser(int userID, UpdateUser userUpdate);

        Task<bool> ChangeUserRole(int userId, string newRole);

        Task<bool> DeleteUser(int userId);
        //Banner management
        Task<List<Banner>> GetBanners();

        Task<Banner?> AddBanner(Banner banner);

        Task<Banner?> UpdateBanner(int bannerId, Banner bannerUpdate);

        Task<bool> DeleteBanner(int bannerId);
    }
}



