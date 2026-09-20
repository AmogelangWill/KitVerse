namespace Kitverse_backend_01.Models
{
    public class NewsletterSubscriber
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;   // stored lowercased
        public bool IsActive { get; set; } = true;
        public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UnsubscribedAt { get; set; }
        public Guid UnsubscribeToken { get; set; } = Guid.NewGuid();
    }
}
