using Kitverse_backend_01.Data;
using Kitverse_backend_01.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Mail;

[ApiController]
[Route("api/newsletter")]
public class NewsletterController : ControllerBase
{
    private readonly KitverseDbContext _context;
    public NewsletterController(KitverseDbContext context) => _context = context;

    public record SubscribeRequest(string Email);

    [AllowAnonymous]
    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe(SubscribeRequest request)
    {
        var email = request.Email?.Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(email) || !MailAddress.TryCreate(email, out var addr) || addr.Address != email)
            return BadRequest(new { message = "Please enter a valid email address." });

        try
        {
            var existing = await _context.NewsletterSubscribers.FirstOrDefaultAsync(s => s.Email == email);
            if (existing == null)
            {
                _context.NewsletterSubscribers.Add(new NewsletterSubscriber { Email = email });
            }
            else if (!existing.IsActive)
            {
                existing.IsActive = true;
                existing.UnsubscribedAt = null;
                existing.SubscribedAt = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // two simultaneous requests for the same email hit the unique index: already subscribed, fine
        }

        return Ok(new { message = "Thanks for subscribing!" });
    }

    [AllowAnonymous]
    [HttpPost("unsubscribe")]
    public async Task<IActionResult> Unsubscribe([FromQuery] Guid token)
    {
        var sub = await _context.NewsletterSubscribers.FirstOrDefaultAsync(s => s.UnsubscribeToken == token);
        if (sub != null && sub.IsActive)
        {
            sub.IsActive = false;
            sub.UnsubscribedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        return Ok(new { message = "You've been unsubscribed." });
    }
}