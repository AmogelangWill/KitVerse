// Models/Team.cs
namespace Kitverse_backend_01.Models
{
    public class Team
    {
        public int TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;

        public List<TShirt> TShirts { get; set; } = new();
    }
}