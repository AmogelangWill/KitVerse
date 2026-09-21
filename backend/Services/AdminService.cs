using Kitverse_backend_01.Data;
using Kitverse_backend_01.DTOs;
using Kitverse_backend_01.Models;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Collections.Generic;
using System.Globalization;
using System.Security.Cryptography;
using System.Threading.Tasks;


namespace Kitverse_backend_01.Services
{
    public class AdminService : IAdminService
    {
        private readonly KitverseDbContext _context;
        private readonly IEmailService _emailservice;
        private readonly IConfiguration _config;
        private readonly ILogger<AdminService> _logger;

        private readonly IInvoiceService _invoiceService;

        public AdminService(KitverseDbContext context, IEmailService emailservice,
                            IConfiguration config, ILogger<AdminService> logger,
                            IInvoiceService invoiceService)
        {
            _context = context;
            _emailservice = emailservice;
            _config = config;
            _logger = logger;
            _invoiceService = invoiceService;
        }
        //get stats for admin dashboard
        public async Task<AdminDashboard> GetAdminDashboard()
        {
            return new AdminDashboard
            {
                TotalUsers = await _context.Users.CountAsync(),
                TotalCustomers = await _context.Users
                    .CountAsync(u => u.Role == "Customer"),

                TotalItemListers = await _context.Users
                    .CountAsync(u => u.Role == "ItemLister"),

                TotalAdmins = await _context.Users
                    .CountAsync(u => u.Role == "Admin"),
                avgdailyUsers = await GetAvgUserPerDay(),

                avgmonthlyUsers = await GetAvgUserPerMonth(),

                avgsales = await GetAvgSales(),
                
                totalProductsSold = await _context.OrderItems.SumAsync(oi => (int?)oi.Quantity) ?? 0,
                
                totalStockOnHand = await _context.Inventory.SumAsync(i => (int?)i.AmountAvailable) ?? 0
            };
        }

        //get all users
        public async Task<List<User>> GetUsers()
        {
            return await _context.Users.Select(u => new User
            {
                UserId = u.UserId,
                UserName = u.UserName,
                UserSurname = u.UserSurname,
                UserEmail = u.UserEmail,
                Role = u.Role,
                DateAdded = u.DateAdded,


            }).ToListAsync();
        }
        //get user by id
        public async Task<User?> GetUserById(int userId)
        {
            return await _context.Users
                .Where(u => u.UserId == userId)
                .Select(u => new User
                {
                    UserId = u.UserId,
                    UserName = u.UserName,
                    UserSurname = u.UserSurname,
                    UserEmail = u.UserEmail,
                    Role = u.Role,
                    DateAdded = u.DateAdded
                })
                .FirstOrDefaultAsync();
        }
        //update user
        private static readonly string[] ValidRoles = { "Customer", "ItemLister", "Admin" };

        // Stages the role change (subtype rows + Role column) WITHOUT saving,
        // so callers can save everything in one atomic SaveChangesAsync.
        private async Task<bool> ApplyRoleChange(User user, string newRole)
        {
            if (!ValidRoles.Contains(newRole)) return false;
            if (user.Role == newRole) return true;

            if (user.Role == "Admin")
            {
                var adminCount = await _context.Users.CountAsync(u => u.Role == "Admin");
                if (adminCount <= 1)
                    throw new InvalidOperationException("Cannot change the role of the last remaining admin.");
            }

            await RemoveRoleProfile(user.UserId, user.Role);
            await EnsureRoleProfile(user.UserId, newRole);
            user.Role = newRole;
            return true;
        }

        private async Task EnsureRoleProfile(int userId, string role)
        {
            switch (role)
            {
                case "Admin":
                    if (await _context.Admins.FindAsync(userId) == null)
                        _context.Admins.Add(new Admin { UserId = userId, LastEditDate = DateTime.UtcNow });
                    break;
                case "ItemLister":
                    if (await _context.ItemListers.FindAsync(userId) == null)
                        _context.ItemListers.Add(new ItemLister { UserId = userId, LastEditDate = DateTime.UtcNow });
                    break;
                case "Customer":
                    if (await _context.Customers.FindAsync(userId) == null)
                        _context.Customers.Add(new Customer { UserId = userId });
                    break;
            }
        }

        private async Task RemoveRoleProfile(int userId, string oldRole)
        {
            switch (oldRole)
            {
                case "Admin":
                    {
                        var admin = await _context.Admins.FindAsync(userId);
                        if (admin != null) _context.Admins.Remove(admin);
                        break;
                    }
                case "ItemLister":
                    {
                        var lister = await _context.ItemListers.FindAsync(userId);
                        if (lister != null) _context.ItemListers.Remove(lister);
                        break;
                    }
                case "Customer":
                    {
                        // carts/wishlists (and through carts, payments and orders) point at this row: keep it
                        var hasHistory = await _context.ShoppingCarts.AnyAsync(c => c.UserId == userId)
                                      || await _context.Wishlists.AnyAsync(w => w.UserId == userId);
                        if (hasHistory) break;

                        var customer = await _context.Customers.FindAsync(userId);
                        if (customer != null) _context.Customers.Remove(customer);
                        break;
                    }
            }
        }

        public async Task<bool> ChangeUserRole(int userId, string newRole)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) return false;

            if (!await ApplyRoleChange(user, newRole)) return false;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<User?> UpdateUser(int userID, UpdateUser userUpdate)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userID);
            if (user == null) return null;

            // login finds users by email, and the database has no unique constraint on it
            var emailTaken = await _context.Users
                .AnyAsync(u => u.UserEmail == userUpdate.UserEmail && u.UserId != userID);
            if (emailTaken)
                throw new InvalidOperationException("Another user already uses this email.");

            user.UserName = userUpdate.UserName;
            user.UserSurname = userUpdate.UserSurname;
            user.UserEmail = userUpdate.UserEmail;

            if (!string.IsNullOrWhiteSpace(userUpdate.Role) && userUpdate.Role != user.Role)
            {
                if (!await ApplyRoleChange(user, userUpdate.Role))
                    throw new ArgumentException("Invalid role.");
            }

            await _context.SaveChangesAsync();   // name/email + role + subtype rows, all or nothing

            return new User
            {
                UserId = user.UserId,
                UserName = user.UserName,
                UserSurname = user.UserSurname,
                UserEmail = user.UserEmail,
                Role = user.Role,
                DateAdded = user.DateAdded
            };
        }

        public async Task<bool> DeleteUser(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) return false;

            if (user.Role == "Admin" && await _context.Users.CountAsync(u => u.Role == "Admin") <= 1)
                throw new InvalidOperationException("Cannot delete the last remaining admin.");

            // Only allow valid KitVerse roles
            if (newRole != "Customer" &&
                newRole != "Item Lister" &&
                newRole != "Admin")
            try
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateException)
            {
                return false; // user has orders/invoices that must be kept
            }
        }

        public async Task<List<Banner>> GetBanners()
        {
            return await _context.Banners
                .OrderByDescending(b => b.DateAdded)
                .ToListAsync();
        }

        public async Task<Banner?> UpdateBanner(int bannerId, Banner bannerUpdate)
        {
            var banner = await _context.Banners
               .FirstOrDefaultAsync(b => b.BannerId == bannerId);

            if (banner == null)
                return null;

            banner.BannerUrl = bannerUpdate.BannerUrl;

            await _context.SaveChangesAsync();

            return banner;
        }

        public async Task<bool> DeleteBanner(int bannerId)
        {
            var banner = await _context.Banners
                .FirstOrDefaultAsync(b => b.BannerId == bannerId);

            if (banner == null)
                return false;

            _context.Banners.Remove(banner);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Banner?> AddBanner(Banner banner)
        {

            banner.DateAdded = DateTime.UtcNow;

            _context.Banners.Add(banner);

            await _context.SaveChangesAsync();

            return banner;
        }

        public async Task<double> GetAvgSales()
        {
            var monthlySales = await _context.Orders
                .Where(o => o.OrderStatus != "Cancelled" && o.OrderStatus != "Pending")
                .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                .Select(g => g.Sum(o => o.TotalAmount))
                .ToListAsync();

            return monthlySales.Any() ? (double)monthlySales.Average() : 0.0;
        }

        public async Task<double> GetAvgUserPerMonth()
        {

            var firstUser = await _context.Users
                           .OrderBy(u => u.DateAdded).
                           FirstOrDefaultAsync();
            if (firstUser == null)
            {
                return 0.0;
            }
            var now = DateTime.UtcNow;

            var month = ((now.Year - firstUser.DateAdded!.Value.Year) * 12)
                         + now.Month - firstUser.DateAdded!.Value.Month + 1;
            if (month <= 0)
            {
                return 0.0;
            }
            var totalUsers = await _context.Users.CountAsync();

            return (double)totalUsers / month;
        }
        public async Task<Double> GetAvgUserPerDay()
        {
            var users = await _context.Users
                .Where(u => u.DateAdded != null)
                .ToListAsync();

            if (!users.Any())
            {
                return 0;
            }

            var firstDate = users
                .Min(u => u.DateAdded!.Value.Date);

            var lastDate = users
                .Max(u => u.DateAdded!.Value.Date);

            var numberOfDays =
                (lastDate - firstDate).Days + 1;

            if (numberOfDays <= 0)
            {
                return users.Count;
            }

            return (double)users.Count / numberOfDays;
        }
        // same definition of "a real sale" everywhere: not cancelled, not pending
        private IQueryable<Order> CountedOrders() =>
            _context.Orders.Where(o => o.OrderStatus != "Cancelled" && o.OrderStatus != "Pending");

        public async Task<List<MonthlySales>> GetSalesOverTime(int months = 12)
        {
            months = Math.Clamp(months, 1, 24);

            var now = DateTime.UtcNow;
            var start = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc)
                            .AddMonths(-(months - 1));

            // revenue and order count per month
            var orderTotals = await CountedOrders()
                .Where(o => o.OrderDate >= start)
                .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    Total = g.Sum(o => o.TotalAmount),
                    Count = g.Count()
                })
                .ToListAsync();

            // shirts sold per month (separate query keeps the SQL simple)
            var itemTotals = await _context.OrderItems
                .Where(oi => oi.Order.OrderDate >= start
                          && oi.Order.OrderStatus != "Cancelled"
                          && oi.Order.OrderStatus != "Pending")
                .GroupBy(oi => new { oi.Order.OrderDate.Year, oi.Order.OrderDate.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Qty = g.Sum(oi => oi.Quantity) })
                .ToListAsync();

            // new user sign-ups per month
            var userTotals = await _context.Users
                .Where(u => u.DateAdded != null && u.DateAdded >= start)
                .GroupBy(u => new { u.DateAdded!.Value.Year, u.DateAdded!.Value.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
                .ToListAsync();

            // new newsletter sign-ups per month
            var subTotals = await _context.NewsletterSubscribers
                .Where(s => s.SubscribedAt >= start)
                .GroupBy(s => new { s.SubscribedAt.Year, s.SubscribedAt.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
                .ToListAsync();

            // build one row per month, filling gaps with zeros
            var result = new List<MonthlySales>();
            for (int i = 0; i < months; i++)
            {
                var d = start.AddMonths(i);

                var o = orderTotals.FirstOrDefault(x => x.Year == d.Year && x.Month == d.Month);
                var it = itemTotals.FirstOrDefault(x => x.Year == d.Year && x.Month == d.Month);
                var u = userTotals.FirstOrDefault(x => x.Year == d.Year && x.Month == d.Month);
                var s = subTotals.FirstOrDefault(x => x.Year == d.Year && x.Month == d.Month);

                var sales = o?.Total ?? 0m;
                var orders = o?.Count ?? 0;

                result.Add(new MonthlySales
                {
                    Month = CultureInfo.InvariantCulture.DateTimeFormat.GetAbbreviatedMonthName(d.Month),
                    Year = d.Year,
                    Sales = sales,
                    Orders = orders,
                    ItemsSold = it?.Qty ?? 0,
                    AvgOrderValue = orders > 0 ? Math.Round(sales / orders, 2) : 0m,
                    NewUsers = u?.Count ?? 0,
                    NewSubscribers = s?.Count ?? 0
                });
            }
            return result;
        }
        public async Task<List<Invoice>> GetInvoices()
        {
            var invoices = await _context.Invoices
                .Include(i => i.Payment)
                .Include(i => i.User)
                .OrderByDescending(i => i.invoiceDate)
                .AsNoTracking()
                .ToListAsync();

            foreach (var i in invoices) i.User.PasswordHash = null;
            return invoices;
        }

        public async Task<Invoice?> GetInvoiceById(int invoiceId)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Payment)
                .Include(i => i.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(i => i.Id == invoiceId);

            if (invoice != null) invoice.User.PasswordHash = null;
            return invoice;
        }


        public Task<bool> SendInvoice(int invoiceid) => _invoiceService.SendInvoiceAsync(invoiceid);
        //helper method to generate invoice pdf using QuestPDF
        /*  private byte[] GenInvPdf(Invoice invoice)
          {
              QuestPDF.Settings.License = LicenseType.Community;

              var document = Document.Create(container =>
              {
                  container.Page(page =>

                  {
                      page.Margin(40);

                      page.Header()
                          .Text("KitVerse Invoice")
                          .FontSize(24)
                          .Bold();

                      page.Content()
                          .PaddingVertical(20)
                          .Column(column =>
                          {
                              column.Item()
                                    .Text($"Invoice Number: {invoice.invoiceNumber}");

                              column.Item()
                                    .Text($"Invoice Date: {invoice.invoiceDate}");
                              column.Item()
                                     .Text($"Customer: {invoice.User.UserName} {invoice.User.UserSurname}");
                              column.Item()
                                     .Text($"Email: {invoice.User.UserEmail}");
                              column.Item()
                                     .PaddingTop(20)
                                     .LineHorizontal(1);
                              column.Item()
                                     .PaddingTop(15)
                                     .Text($"Subtotal: R{invoice.subtotal:F2}");
                              column.Item()
                                       .Text($"Total: R{invoice.total:F2}")
                                       .Bold()
                                       .FontSize(16);

                              column.Item()
                                  .PaddingTop(15)
                                  .Text($"Status: {invoice.status}");
                          });
                      page.Footer()
                          .AlignLeft()
                          .Text("Thank you for shopping with KitVerse!");

                  });

              });
              return document.GeneratePdf();
          }

          */
        public async Task<int> SendNewsletter(string subject, string htmlBody)
        {
            var subscribers = await _context.NewsletterSubscribers
                .Where(s => s.IsActive)
                .AsNoTracking()
                .ToListAsync();

            var baseUrl = _config["Frontend:BaseUrl"] ?? "https://kitverse.pages.dev";
            int sentCount = 0;

            foreach (var sub in subscribers)
            {
                var unsubscribeUrl = $"{baseUrl}/unsubscribe?token={sub.UnsubscribeToken}";
                var body = htmlBody +
                    $"<hr><p style=\"font-size:12px;color:#888\">You're receiving this because you subscribed " +
                    $"to the KitVerse newsletter. <a href=\"{unsubscribeUrl}\">Unsubscribe</a></p>";

                try
                {
                    await _emailservice.SendNewsletter(sub.Email, subject, body);
                    sentCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Newsletter send failed for subscriber {Id}", sub.Id);
                }
            }

            // if there were subscribers but nothing went out, tell the admin instead of reporting success
            if (subscribers.Count > 0 && sentCount == 0)
                throw new InvalidOperationException(
                    "No newsletter emails could be sent. Check the server logs for the email error.");

            return sentCount;
        }

        public async Task<List<string>> GetSubscribers()
        {
            return await _context.NewsletterSubscribers
                .Where(s => s.IsActive)
                .Select(s => s.Email)
                .ToListAsync();
        }
    }
}