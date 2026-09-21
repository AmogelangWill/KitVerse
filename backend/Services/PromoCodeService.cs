using Kitverse_backend_01.Data;
using Kitverse_backend_01.DTOs;
using Kitverse_backend_01.Models;
using Microsoft.EntityFrameworkCore;

namespace Kitverse_backend_01.Services
{
    public class PromoCodeService : IPromoCodeService
    {
        private readonly KitverseDbContext _context;

        public PromoCodeService(KitverseDbContext context)
        {
            _context = context;
        }

        public async Task<PromoCode> CreatePromoCode(CreatePromoCode request)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
                throw new ArgumentException("Promo code is required.");

            if (request.DiscountPercent < 1 || request.DiscountPercent > 100)
                throw new ArgumentException("Discount percent must be between 1 and 100.");

            var normalizedCode = request.Code.Trim().ToUpperInvariant();

            var existing = await _context.PromoCodes
                .FirstOrDefaultAsync(p => p.Code == normalizedCode);

            if (existing != null)
                throw new InvalidOperationException("A promo code with this name already exists.");

            var promo = new PromoCode
            {
                Code = normalizedCode,
                DiscountPercent = request.DiscountPercent,
                ExpiryDate = request.ExpiryDate,
                MaxUses = request.MaxUses,
                DateAdded = DateTime.UtcNow,
                IsActive = true,
                TimesUsed = 0
            };

            _context.PromoCodes.Add(promo);
            await _context.SaveChangesAsync();

            return promo;
        }

        public async Task<List<PromoCode>> GetAllPromoCodes()
        {
            return await _context.PromoCodes
                .OrderByDescending(p => p.DateAdded)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<bool> DeletePromoCode(int promoCodeId)
        {
            var promo = await _context.PromoCodes.FirstOrDefaultAsync(p => p.PromoCodeId == promoCodeId);
            if (promo == null) return false;

            // soft delete: keeps history of what discount an order used, if orders store the code
            promo.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PromoCodeResult> ValidatePromoCode(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                return new PromoCodeResult { Valid = false, Message = "Please enter a promo code." };

            var normalizedCode = code.Trim().ToUpperInvariant();

            var promo = await _context.PromoCodes
                .FirstOrDefaultAsync(p => p.Code == normalizedCode);

            if (promo == null || !promo.IsActive)
                return new PromoCodeResult { Valid = false, Message = "This promo code is not valid." };

            if (promo.ExpiryDate.HasValue && promo.ExpiryDate.Value < DateTime.UtcNow)
                return new PromoCodeResult { Valid = false, Message = "This promo code has expired." };

            if (promo.MaxUses.HasValue && promo.TimesUsed >= promo.MaxUses.Value)
                return new PromoCodeResult { Valid = false, Message = "This promo code has reached its usage limit." };

            return new PromoCodeResult
            {
                Valid = true,
                Message = $"{promo.DiscountPercent}% discount applied.",
                DiscountPercent = promo.DiscountPercent
            };
        }

        public async Task RecordUsage(string code)
        {
            var normalizedCode = code.Trim().ToUpperInvariant();
            var promo = await _context.PromoCodes.FirstOrDefaultAsync(p => p.Code == normalizedCode);
            if (promo == null) return;

            promo.TimesUsed++;
            await _context.SaveChangesAsync();
        }
    }
}