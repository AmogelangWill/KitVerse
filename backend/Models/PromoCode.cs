using System.ComponentModel.DataAnnotations;

namespace Kitverse_backend_01.Models
{
    public class PromoCode
    {
        public int PromoCodeId { get; set; }

        [Required]
        [MaxLength(30)]
        public string Code { get; set; } = string.Empty;

        [Range(1, 100)]
        public int DiscountPercent { get; set; }

        public DateTime DateAdded { get; set; } = DateTime.UtcNow;

        // null = never expires
        public DateTime? ExpiryDate { get; set; }

        // null = unlimited uses
        public int? MaxUses { get; set; }

        public int TimesUsed { get; set; } = 0;

        public bool IsActive { get; set; } = true;
    }
}