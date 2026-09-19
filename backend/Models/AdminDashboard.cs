namespace Kitverse_backend_01.Models
{
    public class AdminDashboard
    {
        public int TotalUsers { get; set; }

        public int TotalCustomers { get; set; }
        public int TotalItemListers { get; set; }
        public int ActiveUsers { get; set; }
        public int InactiveUsers { get; set; }
        public int TotalAdmins { get; set; }

        //stats
        public double avgmonthlyUsers { get; set; }
        public double avgsales { get; set; }
        public double avgdailyUsers { get; set; }

    }
}
