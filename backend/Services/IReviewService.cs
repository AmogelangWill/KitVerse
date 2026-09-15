using Kitverse_backend_01.DTOs;
using Kitverse_backend_01.Models;

namespace Kitverse_backend_01.Controllers
{
    public interface IReviewService
    {
        Task<Review> AddReview(CreateReview request);
        Task<List<Review>> GetReviewsForShirt(int tshirtId);
        Task<List<Review>> GetReviewsForShirtByStars(int tshirtId, int stars);
    }
}