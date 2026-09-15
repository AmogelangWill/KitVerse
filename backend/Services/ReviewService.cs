using Kitverse_backend_01.Data;
using Kitverse_backend_01.DTOs;
using Kitverse_backend_01.Models;
using Microsoft.EntityFrameworkCore;

namespace Kitverse_backend_01.Controllers
{
    public class ReviewService : IReviewService
    {
        private readonly KitverseDbContext _context;

        public ReviewService(KitverseDbContext context)
        {
            _context = context;
        }

        public async Task<Review> AddReview(CreateReview request)
        {
            if (request.Stars < 1 || request.Stars > 5)
            {
                throw new ArgumentException("Stars must be between 1 and 5.");
            }

            var shirtExists = await _context.TShirts.AnyAsync(t => t.TShirtId == request.TShirtId);
            var userExists = await _context.Users.AnyAsync(u => u.UserId == request.UserId);
            if (!shirtExists || !userExists)
            {
                throw new ArgumentException("Shirt or user not found.");
            }

            var review = new Review
            {
                TShirtId = request.TShirtId,
                UserId = request.UserId,
                Stars = request.Stars,
                Comment = request.Comment
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return review;
        }

        public async Task<List<Review>> GetReviewsForShirt(int tshirtId)
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.TShirtId == tshirtId)
                .OrderByDescending(r => r.DateAdded)
                .ToListAsync();
        }

        public async Task<List<Review>> GetReviewsForShirtByStars(int tshirtId, int stars)
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.TShirtId == tshirtId && r.Stars == stars)
                .OrderByDescending(r => r.DateAdded)
                .ToListAsync();
        }
    }
}