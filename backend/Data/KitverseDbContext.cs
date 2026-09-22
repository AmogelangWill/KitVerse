using Microsoft.EntityFrameworkCore;
using Kitverse_backend_01.Models;

namespace Kitverse_backend_01.Data
{
    public class KitverseDbContext : DbContext
    {
        public KitverseDbContext(DbContextOptions<KitverseDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<ItemLister> ItemListers { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

        public DbSet<NewsletterSubscriber> NewsletterSubscribers { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<TShirt> TShirts { get; set; }
        public DbSet<ShirtLink> ShirtLinks { get; set; }
        public DbSet<ShoppingCart> ShoppingCarts { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<ItemList> ItemLists { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; }
        public DbSet<Inventory> Inventory { get; set; }
        public DbSet<Banner> Banners { get; set; }

        public DbSet<Competition> Competitions { get; set; }
        public DbSet<TShirtCompetition> TShirtCompetitions { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<PromoCode> PromoCodes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //this is where we tell which Entity to Map to in PostgreSQL in our cloud host
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("system_users");
                entity.HasKey(u => u.UserId);
                entity.Property(u => u.UserId).HasColumnName("user_id");
                entity.Property(u => u.UserName).HasColumnName("user_name");
                entity.Property(u => u.UserEmail).HasColumnName("user_email");
                entity.Property(u => u.UserSurname).HasColumnName("user_surname");
                entity.Property(u => u.PasswordHash).HasColumnName("password_hash");
                entity.Property(t => t.DateAdded).HasColumnName("date_added").HasDefaultValueSql("now()");
                entity.Property(u => u.Role).HasColumnName("role");
            });


            modelBuilder.Entity<Admin>(entity =>
            {
                entity.ToTable("admins");//name of our table in postgres
                entity.HasKey(a => a.UserId);//primary key 
                entity.Property(a => a.UserId).HasColumnName("user_id");
                entity.Property(a => a.LastEditDate).HasColumnName("last_edit_date");
                entity.HasOne(a => a.User).WithOne().HasForeignKey<Admin>(a => a.UserId); //Foreign Key
            });

            modelBuilder.Entity<ItemLister>(entity =>
            {
                entity.ToTable("item_listers");
                entity.HasKey(i => i.UserId);
                entity.Property(i => i.UserId).HasColumnName("user_id");
                entity.Property(i => i.LastEditDate).HasColumnName("last_edit_date");
                entity.HasOne(i => i.User).WithOne().HasForeignKey<ItemLister>(i => i.UserId);
            });

            modelBuilder.Entity<Customer>(entity =>
            {
                entity.ToTable("customers");
                entity.HasKey(c => c.UserId);
                entity.Property(c => c.UserId).HasColumnName("user_id");
                entity.Property(c => c.Address).HasColumnName("address");
                entity.HasOne(c => c.User).WithOne().HasForeignKey<Customer>(c => c.UserId);
            });

            modelBuilder.Entity<Team>(entity =>
            {
                entity.ToTable("teams");
                entity.HasKey(t => t.TeamId);
                entity.Property(t => t.TeamId).HasColumnName("team_id");
                entity.Property(t => t.TeamName).HasColumnName("team_name");
            });

            modelBuilder.Entity<TShirt>(entity =>
            {
                entity.ToTable("t_shirts");
                entity.HasKey(t => t.TShirtId);
                entity.Property(t => t.TShirtId).HasColumnName("t_shirt_id");
                entity.Property(t => t.ShirtSeason).HasColumnName("shirt_season");
                entity.Property(t => t.ShirtPrice).HasColumnName("shirt_price");
                entity.Property(t => t.ShirtAffiliate).HasColumnName("shirt_affiliate");
                entity.Property(t => t.ShirtGender).HasColumnName("shirt_gender");
                entity.Property(t => t.ShirtDescription).HasColumnName("shirt_description");
                entity.Property(t => t.ShirtStatus).HasColumnName("shirt_status");
                entity.Property(t => t.ShirtName).HasColumnName("shirt_name");
                entity.Property(t => t.TeamId).HasColumnName("team_id");
                
                entity.Property(t => t.DateAdded).HasColumnName("date_added").HasDefaultValueSql("now()");
                entity.HasOne(t => t.Team).WithMany(team => team.TShirts).HasForeignKey(t => t.TeamId);
            });

            modelBuilder.Entity<ShirtLink>(entity =>
            {
                entity.ToTable("shirt_links");
                entity.HasKey(s => s.LinkId);
                entity.Property(s => s.LinkId).HasColumnName("link_id");
                entity.Property(s => s.ShirtLinkUrl).HasColumnName("shirt_link");
                entity.Property(s => s.TShirtId).HasColumnName("t_shirt_id");
                entity.Property(t => t.IsMain).HasColumnName("is_main");
                entity.Property(t => t.DateAdded).HasColumnName("date_added").HasDefaultValueSql("now()");
                entity.HasOne(s => s.TShirt).WithMany(t => t.ShirtLinks).HasForeignKey(s => s.TShirtId);
            });

            modelBuilder.Entity<ShoppingCart>(entity =>
            {
                entity.ToTable("shopping_carts");
                entity.HasKey(s => s.CartId);
                entity.Property(s => s.CartId).HasColumnName("cart_id");
                entity.Property(s => s.TotalCost).HasColumnName("total_cost");
                entity.Property(s => s.CartStatus).HasColumnName("cart_status");
                entity.Property(s => s.UserId).HasColumnName("user_id");
                entity.Property(s => s.PromoCode).HasColumnName("promo_code");
                entity.Property(s => s.PromoDiscountPercent).HasColumnName("promo_discount_percent");
                entity.HasOne(s => s.Customer).WithMany().HasForeignKey(s => s.UserId);
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.ToTable("payments");
                entity.HasKey(p => p.PaymentId);
                entity.Property(p => p.PaymentId).HasColumnName("payment_id");
                entity.Property(p => p.PayStackReference).HasColumnName("pay_stack_reference");
                entity.Property(p => p.Amount).HasColumnName("amount");
                entity.Property(p => p.PaymentStatus).HasColumnName("payment_status");
                entity.Property(p => p.TransactionDate).HasColumnName("transaction_date");
                entity.Property(p => p.CartId).HasColumnName("cart_id");
                entity.HasOne(p => p.ShoppingCart).WithMany(s => s.Payments).HasForeignKey(p => p.CartId);
            });

            modelBuilder.Entity<ItemList>(entity =>
            {
                entity.ToTable("item_lists");
                entity.HasKey(i => new { i.CartId, i.TShirtId }); // composite primary key
                entity.Property(i => i.CartId).HasColumnName("cart_id");
                entity.Property(i => i.TShirtId).HasColumnName("t_shirt_id");
                entity.Property(i => i.Quantity).HasColumnName("quantity");
                entity.Property(i => i.UnitPurchaseAtTime).HasColumnName("unit_purchase_at_time");
                entity.HasOne(i => i.ShoppingCart).WithMany(s => s.ItemLists).HasForeignKey(i => i.CartId);
                entity.HasOne(i => i.TShirt).WithMany().HasForeignKey(i => i.TShirtId);
            });

            modelBuilder.Entity<Wishlist>(entity =>
            {
                entity.ToTable("wishlists");
                entity.HasKey(w => new { w.UserId, w.TShirtId }); // composite primary key
                entity.Property(w => w.UserId).HasColumnName("user_id");
                entity.Property(w => w.TShirtId).HasColumnName("t_shirt_id");
                entity.Property(w => w.DateAdded).HasColumnName("date_added").HasDefaultValueSql("now()");
                entity.HasOne(w => w.Customer).WithMany().HasForeignKey(w => w.UserId);
                entity.HasOne(w => w.TShirt).WithMany().HasForeignKey(w => w.TShirtId);
            });

            modelBuilder.Entity<Inventory>(entity =>
            {
                entity.ToTable("inventory");
                entity.HasKey(i => new { i.TshirtID, i.ShirtSize });
                entity.Property(i => i.TshirtID).HasColumnName("t_shirt_id");
                entity.Property(i => i.ShirtSize).HasColumnName("t_shirt_size");
                entity.Property(i => i.AmountAvailable).HasColumnName("amount_available");

                entity.HasOne(i => i.shirt).WithMany().HasForeignKey(i => i.TshirtID);

            });

            modelBuilder.Entity<Competition>(entity =>
            {
                entity.ToTable("competitions");
                entity.HasKey(c => c.CompetitionId);
                entity.Property(c => c.CompetitionId).HasColumnName("competition_id");
                entity.Property(c => c.CompetitionName).HasColumnName("competition_name");
            });

            modelBuilder.Entity<TShirtCompetition>(entity =>
            {
                entity.ToTable("t_shirt_competitions");
                entity.HasKey(tc => new { tc.TShirtId, tc.CompetitionId }); // composite key - prevents duplicate links
                entity.Property(tc => tc.TShirtId).HasColumnName("t_shirt_id");
                entity.Property(tc => tc.CompetitionId).HasColumnName("competition_id");
                entity.HasOne(tc => tc.TShirt).WithMany(t => t.TShirtCompetitions).HasForeignKey(tc => tc.TShirtId);
                entity.HasOne(tc => tc.Competition).WithMany(c => c.TShirtCompetitions).HasForeignKey(tc => tc.CompetitionId);
            });

            modelBuilder.Entity<Banner>(entity =>
            {
                entity.ToTable("banners");
                entity.HasKey(t => t.BannerId);
                entity.Property(t => t.BannerName).HasColumnName("banner_name");
                entity.Property(t => t.BannerDescription).HasColumnName("banner_description");
                entity.Property(t => t.Team1ID).HasColumnName("team_1");
                entity.Property(t => t.Team2ID).HasColumnName("team_2");
                entity.Property(t => t.DateAdded).HasColumnName("banner_date_added").HasDefaultValueSql("now()");
                entity.Property(t => t.BannerUrl).HasColumnName("banner_url");

            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.ToTable("reviews");
                entity.HasKey(r => r.ReviewId);
                entity.Property(r => r.ReviewId).HasColumnName("review_id");
                entity.Property(r => r.TShirtId).HasColumnName("t_shirt_id");
                entity.Property(r => r.UserId).HasColumnName("user_id");
                entity.Property(r => r.Stars).HasColumnName("stars");
                entity.Property(r => r.Comment).HasColumnName("comment");
                entity.Property(r => r.DateAdded).HasColumnName("date_added").HasDefaultValueSql("now()");
                entity.HasOne(r => r.TShirt).WithMany(t => t.Reviews).HasForeignKey(r => r.TShirtId);
                entity.HasOne(r => r.User).WithMany().HasForeignKey(r => r.UserId);
            });
            modelBuilder.Entity<Order>(entity =>
            {
                entity.ToTable("orders");
                entity.HasKey(o => o.Id);
                entity.Property(o => o.Id).HasColumnName("order_id");
                entity.Property(o => o.CustomerId).HasColumnName("customer_id");
                entity.Property(o => o.PaymentId).HasColumnName("payment_id");
                entity.Property(o => o.OrderDate).HasColumnName("order_date");
                entity.Property(o => o.TotalAmount).HasColumnName("total_amount");
                entity.Property(o => o.OrderStatus).HasColumnName("order_status");
                entity.HasIndex(o => o.PaymentId).IsUnique(); // one order per payment

                entity.HasOne(o => o.User).WithMany()
                      .HasForeignKey(o => o.CustomerId)
                      .OnDelete(DeleteBehavior.Restrict);      // can't delete a user who has orders

                entity.HasOne(o => o.Payment).WithMany()
                      .HasForeignKey(o => o.PaymentId)
                      .OnDelete(DeleteBehavior.Restrict);      // can't delete a payment that has an order
            });

            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.ToTable("order_items");
                entity.HasKey(oi => oi.OrderItemId);
                entity.Property(oi => oi.OrderItemId).HasColumnName("order_item_id");
                entity.Property(oi => oi.OrderId).HasColumnName("order_id");
                entity.Property(oi => oi.ProductId).HasColumnName("product_id");
                entity.Property(oi => oi.Quantity).HasColumnName("quantity");
                entity.Property(oi => oi.Price).HasColumnName("price");

                entity.HasOne(oi => oi.Order).WithMany(o => o.OrderItems)
                      .HasForeignKey(oi => oi.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);       // deleting an order removes its line items

                entity.HasOne(oi => oi.Product).WithMany()
                      .HasForeignKey(oi => oi.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);      // can't delete a shirt that has been sold
            });

            modelBuilder.Entity<Invoice>(entity =>
            {
                entity.ToTable("invoices");
                entity.HasKey(i => i.Id);
                entity.Property(i => i.Id).HasColumnName("invoice_id");
                entity.Property(i => i.invoiceNumber).HasColumnName("invoice_number").IsRequired();
                entity.Property(i => i.pay_id).HasColumnName("pay_id");
                entity.Property(i => i.user_id).HasColumnName("user_id");
                entity.Property(i => i.invoiceDate).HasColumnName("invoice_date");
                entity.Property(i => i.subtotal).HasColumnName("subtotal");
                entity.Property(i => i.tax).HasColumnName("tax");
                entity.Property(i => i.total).HasColumnName("total");
                entity.Property(i => i.status).HasColumnName("status");
                entity.HasIndex(i => i.invoiceNumber).IsUnique();

                entity.HasOne(i => i.Payment).WithMany()
                      .HasForeignKey(i => i.pay_id)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(i => i.User).WithMany()
                      .HasForeignKey(i => i.user_id)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PasswordResetToken>(entity =>
            {
                entity.ToTable("password_reset_tokens");
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Id).HasColumnName("id");
                entity.Property(p => p.UserId).HasColumnName("user_id");
                entity.Property(p => p.TokenHash).HasColumnName("token_hash").IsRequired();
                entity.Property(p => p.Expiration).HasColumnName("expiration");
                entity.Property(p => p.isValid).HasColumnName("is_valid");
                entity.HasIndex(p => p.TokenHash).IsUnique();
                entity.HasIndex(p => p.UserId);
                entity.HasOne(p => p.User).WithMany().HasForeignKey(p => p.UserId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<NewsletterSubscriber>(entity =>
            {
                entity.ToTable("newsletter_subscribers");
                entity.HasKey(n => n.Id);
                entity.Property(n => n.Id).HasColumnName("subscriber_id");
                entity.Property(n => n.Email).HasColumnName("email").IsRequired();
                entity.Property(n => n.IsActive).HasColumnName("is_active");
                entity.Property(n => n.SubscribedAt).HasColumnName("subscribed_at").HasDefaultValueSql("now()");
                entity.Property(n => n.UnsubscribedAt).HasColumnName("unsubscribed_at");
                entity.Property(n => n.UnsubscribeToken).HasColumnName("unsubscribe_token");
                entity.HasIndex(n => n.Email).IsUnique();
                entity.HasIndex(n => n.UnsubscribeToken).IsUnique();
            });

            modelBuilder.Entity<PromoCode>(entity =>
            {
                entity.ToTable("promo_codes");
                entity.HasKey(p => p.PromoCodeId);
                entity.Property(p => p.PromoCodeId).HasColumnName("promo_code_id");
                entity.Property(p => p.Code).HasColumnName("code").IsRequired();
                entity.Property(p => p.DiscountPercent).HasColumnName("discount_percent");
                entity.Property(p => p.DateAdded).HasColumnName("date_added").HasDefaultValueSql("now()");
                entity.Property(p => p.ExpiryDate).HasColumnName("expiry_date");
                entity.Property(p => p.MaxUses).HasColumnName("max_uses");
                entity.Property(p => p.TimesUsed).HasColumnName("times_used");
                entity.Property(p => p.IsActive).HasColumnName("is_active");
                entity.HasIndex(p => p.Code).IsUnique();
            });

           
        }
    }
}