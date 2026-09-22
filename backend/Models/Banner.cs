namespace Kitverse_backend_01.Models
{
    public class Banner
    {
        public int BannerId { get; set; }
        public string BannerName { get; set;} =String.Empty;

        public string? BannerDescription { get; set; }
        public int Team1ID { get; set;}
        public int Team2ID { get; set;}
        public DateTime DateAdded { get; set;}

        public string BannerUrl { get; set; } = String.Empty; 
    }
}
