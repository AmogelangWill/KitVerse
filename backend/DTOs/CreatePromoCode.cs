namespace Kitverse_backend_01.DTOs
{
    public class CreatePromoCode
    {
        public string Code { get; set; } = string.Empty;
        public int DiscountPercent { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int? MaxUses { get; set; }
    }

    public class ApplyPromoCode
    {
        public string Code { get; set; } = string.Empty;
    }

    public class PromoCodeResult
    {
        public bool Valid { get; set; }
        public string Message { get; set; } = string.Empty;
        public int DiscountPercent { get; set; }
    }
}