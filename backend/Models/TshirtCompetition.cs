namespace Kitverse_backend_01.Models
{
    public class TShirtCompetition
    {
        public int TShirtId { get; set; }
        public int CompetitionId { get; set; }

        public TShirt TShirt { get; set; } = null!;
        public Competition Competition { get; set; } = null!;
    }
}