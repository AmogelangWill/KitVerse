namespace Kitverse_backend_01.DTOs
{
    public class MonthlySales
    {
        public string Month { get; set; } = string.Empty;   // "Jan", "Feb", ...
        public int Year { get; set; }
        public decimal Sales { get; set; }
        public int Orders { get; set; }
        public int ItemsSold { get; set; }
        public decimal AvgOrderValue { get; set; }
        public int NewUsers { get; set; }
        public int NewSubscribers { get; set; }
    }
}