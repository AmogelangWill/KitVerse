using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Collections.Generic;
using Kitverse_backend_01.Data;
using Kitverse_backend_01.Models;
using Kitverse_backend_01.DTOs;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;


namespace Kitverse_backend_01.Services
{
    public class AdminService : IAdminService
    {
        private readonly KitverseDbContext _context;
        private readonly IEmailService _emailservice;

        public AdminService(KitverseDbContext context, IEmailService emailservice)
        {
            _context = context;
            _emailservice = emailservice;   
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

                avgsales = await GetAvgSales()
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
        public async Task<User> GetUserById(int userId)
        {
            return await _context.Users.
                Where(u => u.UserId == userId).
                Select(u => new User
                {
                    UserId = u.UserId,
                    UserName = u.UserName,
                    UserSurname = u.UserSurname,
                    UserEmail = u.UserEmail,
                    Role = u.Role,
                    DateAdded = u.DateAdded,

                }).FirstOrDefaultAsync();

        }
        //update user
        public async Task<User?> UpdateUser(int userID, UpdateUser userUpdate)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userID);
            if (user == null)
                return null;

            user.UserName = userUpdate.UserName;
            user.UserSurname = userUpdate.UserSurname;
            user.UserEmail = userUpdate.UserEmail;
            user.Role = userUpdate.Role;

            await _context.SaveChangesAsync();
            return new User
            {
                UserId = user.UserId,
                UserName = user.UserName,
                UserSurname = user.UserSurname,
                UserEmail = user.UserEmail,
                Role = user.Role,
                DateAdded = user.DateAdded,

            };
        }



        public async Task<bool> DeleteUser(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<bool> ChangeUserRole(int userId, string newRole)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return false;

            // Only allow valid KitVerse roles
            if (newRole != "Customer" &&
                newRole != "Item Lister" &&
                newRole != "Admin")
            {
                return false;
            }

            user.Role = newRole;
            await _context.SaveChangesAsync();
            return true;
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
            var monthlysales = await _context.Orders
                            .Where(o => o.orderStatus != "Cancelled"
                            && o.orderStatus != "Pending")
                            .GroupBy(o =>
                                 new
                                 {
                                     o.orderDate.Year,
                                     o.orderDate.Month
                                 })
                            .Select(g => g.Sum(o => o.totalAmount))
                            .ToListAsync();

            return monthlysales.Any()
                ? (double)
                monthlysales.Average()
                : 0.0;
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
        public async Task<List<Invoice>> GetInvoices()
        {
            return await _context.Invoices
                .Include(i => i.Payment)
                .Include(i => i.User)
                .OrderByDescending(i => i.invoiceDate)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Invoice?> GetInvoiceById(int invoiceId)
        {
            return await _context.Invoices
                .Include(i => i.Payment)
                .Include(i => i.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(i => i.Id == invoiceId);
        }


        public async Task<bool> SendInvoice(int invoiceid)
        {
            var invoice = await _context.Invoices
                        .Include(i => i.User)
                        .FirstOrDefaultAsync(i => i.Id == invoiceid);
            if(invoice == null)
            {
                return false;
            }
            //invoice pdf 
            byte[] invoicePdf = GenInvPdf(invoice);

            await _emailservice.SendInvoiceEmail(
                invoice.User.UserEmail,
                invoice.User.UserName,
                invoicePdf);
            return true;
        }
        //helper method to generate invoice pdf using QuestPDF
        private byte[] GenInvPdf(Invoice invoice)
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
        

        public async Task<int> SendNewsletter(string subject, string htmlBody)
        {
            var user = await _context.Users
                        .Where(u => u.NewsLetterSub)
                        .ToListAsync();

            int sentCount = 0;

            foreach (var item in user)
            {
                try
                {
                    await _emailservice.SendNewsletter(
                            item.UserEmail,
                            subject, htmlBody);
                        sentCount++;
                }
                catch (Exception ex)
                {
                    ex.GetBaseException();
                }
            }
            return sentCount;
        }
    }
}