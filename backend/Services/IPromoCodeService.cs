using Kitverse_backend_01.DTOs;
using Kitverse_backend_01.Models;

namespace Kitverse_backend_01.Services
{
    public interface IPromoCodeService
    {
        Task<PromoCode> CreatePromoCode(CreatePromoCode request);
        Task<List<PromoCode>> GetAllPromoCodes();
        Task<bool> DeletePromoCode(int promoCodeId);
        Task<PromoCodeResult> ValidatePromoCode(string code);
        Task RecordUsage(string code);
    }
}