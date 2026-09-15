namespace Kitverse_backend_01.Models
{
    public class Invoice
    {
        public int Id { get; set; }

        public string invoiceNumber { get; set; } = string.Empty;

        public int pay_id { get; set; }

        public Payment Payment { get; set; } = null!;

        public int user_id { get; set; }

        public User User { get; set; } = null!;

        public DateTime invoiceDate { get; set; }

        public decimal subtotal { get; set; }

        public decimal tax { get; set; }

        public decimal total { get; set; }

        public string status { get; set; } = "Issued";

    }
}
