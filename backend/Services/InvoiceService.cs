using System.Globalization;
using Kitverse_backend_01.Data;
using Kitverse_backend_01.Models;
using Kitverse_backend_01.Services;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;


namespace Kitverse_backend_01.Services
{
    public class InvoiceService : IInvoiceService
    {
        // Set to 0.15m ONLY if you are VAT-registered and your shirt prices already include VAT.
        private const decimal VatRate = 0m;

        private readonly KitverseDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<InvoiceService> _logger;

        public InvoiceService(KitverseDbContext context, IEmailService emailService,
                              ILogger<InvoiceService> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task IssueInvoiceForPaymentAsync(int paymentId)
        {
            // idempotent: Paystack can confirm the same payment more than once
            if (await _context.Invoices.AnyAsync(i => i.pay_id == paymentId)) return;

            var order = await LoadOrderAsync(paymentId);
            if (order == null)
            {
                _logger.LogWarning("No order found for payment {PaymentId}; invoice not issued", paymentId);
                return;
            }

            var total = order.TotalAmount;
            var tax = Math.Round(total * VatRate / (1 + VatRate), 2);

            var invoice = new Invoice
            {
                invoiceNumber = $"INV-{DateTime.UtcNow:yyyy}-{paymentId:D6}",
                pay_id = paymentId,
                user_id = order.CustomerId,
                invoiceDate = DateTime.UtcNow,
                subtotal = total - tax,
                tax = tax,
                total = total,
                status = "Issued"
            };

            _context.Invoices.Add(invoice);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // the unique invoice number means a parallel request issued it first
                _logger.LogWarning(ex, "Invoice for payment {PaymentId} already issued", paymentId);
                return;
            }

            try
            {
                await SendAsync(invoice);
            }
            catch (Exception ex)
            {
                // the invoice exists; an admin can resend it. Never fail the payment over an email.
                _logger.LogWarning(ex, "Emailing invoice {Number} failed", invoice.invoiceNumber);
            }
        }

        public async Task<bool> SendInvoiceAsync(int invoiceId)
        {
            var invoice = await _context.Invoices.AsNoTracking().FirstOrDefaultAsync(i => i.Id == invoiceId);
            if (invoice == null) return false;

            await SendAsync(invoice);   // errors surface to the admin here
            return true;
        }

        private async Task SendAsync(Invoice invoice)
        {
            var user = await _context.Users.AsNoTracking().FirstAsync(u => u.UserId == invoice.user_id);
            var customer = await _context.Customers.AsNoTracking().FirstOrDefaultAsync(c => c.UserId == invoice.user_id);
            var order = await LoadOrderAsync(invoice.pay_id);
            var pdf = GeneratePdf(invoice, user, order, customer);
            await _emailService.SendInvoiceEmail(user.UserEmail, user.UserName, pdf);
        }

        private Task<Order?> LoadOrderAsync(int paymentId) =>
            _context.Orders
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.PaymentId == paymentId);

        private static string Money(decimal v) => "R" + v.ToString("F2", CultureInfo.InvariantCulture);

        private static byte[] GeneratePdf(Invoice invoice, User user, Order? order, Customer? customer)
        {
            QuestPDF.Settings.License = LicenseType.Community;
            QuestPDF.Settings.UseSystemFonts = true;
            QuestPDF.Settings.ThrowOnMissingFontFamilies = false;
            QuestPDF.Settings.ThrowOnMissingTextGlyphs = false;

            // Register bundled fonts so Railway doesn't crash
            var basePath = AppContext.BaseDirectory;
            var regPath = System.IO.File.Exists(System.IO.Path.Combine(basePath, "Roboto-Regular.ttf"))
                ? System.IO.Path.Combine(basePath, "Roboto-Regular.ttf")
                : "Roboto-Regular.ttf";

            var boldPath = System.IO.File.Exists(System.IO.Path.Combine(basePath, "Roboto-Bold.ttf"))
                ? System.IO.Path.Combine(basePath, "Roboto-Bold.ttf")
                : "Roboto-Bold.ttf";

            if (System.IO.File.Exists(regPath))
            {
                QuestPDF.Drawing.FontManager.RegisterFontFromStream(System.IO.File.OpenRead(regPath));
            }
            if (System.IO.File.Exists(boldPath))
            {
                QuestPDF.Drawing.FontManager.RegisterFontFromStream(System.IO.File.OpenRead(boldPath));
            }

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.DefaultTextStyle(x => x.FontFamily("DejaVu Sans"));
                    page.Margin(40);
                    page.Header().Text("KitVerse Invoice").FontSize(24).Bold();

                    page.Content().PaddingVertical(20).Column(column =>
                    {
                        column.Item().Text($"Invoice Number: {invoice.invoiceNumber}");
                        column.Item().Text($"Invoice Date: {invoice.invoiceDate:yyyy-MM-dd}");
                        column.Item().Text($"Customer: {user.UserName} {user.UserSurname}");
                        column.Item().Text($"Email: {user.UserEmail}");
                        if (!string.IsNullOrWhiteSpace(customer?.Address))
                            column.Item().Text($"Shipping Address: {customer.Address}");
                        column.Item().PaddingTop(15).LineHorizontal(1);

                        if (order != null && order.OrderItems.Any())
                        {
                            column.Item().PaddingTop(15).Table(table =>
                            {
                                table.ColumnsDefinition(c =>
                                {
                                    c.RelativeColumn(5);
                                    c.ConstantColumn(40);
                                    c.ConstantColumn(80);
                                    c.ConstantColumn(90);
                                });

                                table.Header(h =>
                                {
                                    h.Cell().Text("Item").Bold();
                                    h.Cell().AlignRight().Text("Qty").Bold();
                                    h.Cell().AlignRight().Text("Price").Bold();
                                    h.Cell().AlignRight().Text("Total").Bold();
                                });

                                foreach (var line in order.OrderItems)
                                {
                                    table.Cell().Text(line.Product.ShirtName);
                                    table.Cell().AlignRight().Text(line.Quantity.ToString());
                                    table.Cell().AlignRight().Text(Money(line.Price));
                                    table.Cell().AlignRight().Text(Money(line.Price * line.Quantity));
                                }
                            });
                        }

                        // Calculate discounts and shipping based on rules
                        decimal itemsTotal = 0;
                        int totalQty = 0;
                        if (order != null && order.OrderItems.Any())
                        {
                            itemsTotal = order.OrderItems.Sum(oi => oi.Price * oi.Quantity);
                            totalQty = order.OrderItems.Sum(oi => oi.Quantity);
                        }

                        decimal shippingFee = itemsTotal >= 1500m ? 0m : 150m;
                        decimal volumeDiscount = totalQty >= 3 ? Math.Round(itemsTotal * 0.10m, 2) : 0m;
                        
                        // Whatever difference remains between Expected and Actual Total must be Promo Code
                        decimal expectedBeforePromo = itemsTotal + shippingFee - volumeDiscount;
                        decimal promoDiscount = expectedBeforePromo - invoice.total;
                        // Avoid floating point weirdness or negative promo if logic changes
                        if (promoDiscount < 0) promoDiscount = 0;
                        
                        column.Item().PaddingTop(15).LineHorizontal(1);
                        
                        column.Item().PaddingTop(10).Text($"Items Subtotal: {Money(itemsTotal)}");
                        column.Item().Text($"Shipping: {(shippingFee == 0 ? "Free" : Money(shippingFee))}");
                        
                        if (volumeDiscount > 0)
                            column.Item().Text($"Volume Discount (3+ items): -{Money(volumeDiscount)}");
                            
                        if (promoDiscount > 0.01m)
                            column.Item().Text($"Promo Code Applied: -{Money(promoDiscount)}");
                        
                        column.Item().PaddingTop(10).Text($"VAT (Included): {Money(invoice.tax)}");
                        column.Item().Text($"Total Paid: {Money(invoice.total)}").Bold().FontSize(16);
                        
                        column.Item().PaddingTop(10).Text($"Status: {invoice.status}");
                    });

                    page.Footer().AlignLeft().Text("Thank you for shopping with KitVerse!");
                });
            }).GeneratePdf();
        }

        public async Task<byte[]> GenerateInvoicePdfAsync(int invoiceId, int userId)
        {
            var invoice = await _context.Invoices.AsNoTracking().FirstOrDefaultAsync(i => i.Id == invoiceId && i.user_id == userId);
            if (invoice == null) return null;

            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserId == invoice.user_id);
            var customer = await _context.Customers.AsNoTracking().FirstOrDefaultAsync(c => c.UserId == invoice.user_id);
            var order = await LoadOrderAsync(invoice.pay_id);
            return GeneratePdf(invoice, user, order, customer);
        }

        public async Task<List<object>> GetUserInvoicesAsync(int userId)
        {
            var invoices = await _context.Invoices
                .Where(i => i.user_id == userId)
                .OrderByDescending(i => i.invoiceDate)
                .ToListAsync();

            var result = new List<object>();

            foreach (var inv in invoices)
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .ThenInclude(p => p.ShirtLinks)
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .ThenInclude(p => p.Team)
                    .FirstOrDefaultAsync(o => o.PaymentId == inv.pay_id);

                var itemsList = new List<object>();
                string mainImageUrl = "";
                decimal itemsTotal = 0;
                int totalQty = 0;
                
                if (order?.OrderItems != null)
                {
                    bool isFirst = true;
                    foreach (var oi in order.OrderItems)
                    {
                        var imgUrl = oi.Product?.ShirtLinks?.FirstOrDefault(l => l.IsMain)?.ShirtLinkUrl
                                  ?? oi.Product?.ShirtLinks?.FirstOrDefault()?.ShirtLinkUrl
                                  ?? "";
                        
                        if (isFirst) {
                            mainImageUrl = imgUrl;
                            isFirst = false;
                        }

                        itemsList.Add(new 
                        {
                            productId = oi.ProductId,
                            productName = $"{oi.Product?.Team?.TeamName} {oi.Product?.ShirtSeason}",
                            quantity = oi.Quantity,
                            unitPrice = oi.Price,
                            imageUrl = imgUrl
                        });
                        
                        itemsTotal += oi.Price * oi.Quantity;
                        totalQty += oi.Quantity;
                    }
                }

                decimal shippingFee = itemsTotal >= 1500m ? 0m : 150m;
                decimal volumeDiscount = totalQty >= 3 ? Math.Round(itemsTotal * 0.10m, 2) : 0m;
                decimal expectedBeforePromo = itemsTotal + shippingFee - volumeDiscount;
                decimal promoDiscount = expectedBeforePromo - inv.total;
                if (promoDiscount < 0) promoDiscount = 0;

                result.Add(new
                {
                    id = inv.Id,
                    invoiceNumber = inv.invoiceNumber,
                    invoiceDate = inv.invoiceDate,
                    subtotal = inv.subtotal,
                    tax = inv.tax,
                    total = inv.total,
                    status = inv.status,
                    imageUrl = mainImageUrl,
                    items = itemsList,
                    itemsTotal = itemsTotal,
                    shippingFee = shippingFee,
                    volumeDiscount = volumeDiscount,
                    promoDiscount = promoDiscount
                });
            }

            return result;
        }
    }
}