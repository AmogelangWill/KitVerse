namespace Kitverse_backend_01.Models
{
    public class Competition
    {
        public int CompetitionId { get; set; }
        public string CompetitionName { get; set; } = string.Empty;

        public List<TShirtCompetition> TShirtCompetitions { get; set; } = new();
    }
}