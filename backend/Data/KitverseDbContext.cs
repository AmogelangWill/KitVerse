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

        public DbSet<Team> Teams { get; set; }
        public DbSet<TShirt> TShirts { get; set; }
        public DbSet<ShirtLink> ShirtLinks { get; set; }
        public DbSet<ShoppingCart> ShoppingCarts { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<ItemList> ItemLists { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; }
        public DbSet<Inventory> Inventory { get; set; }
        public DbSet<Banner> Banners { get; set; }

        public DbSet<Competition> Competitions { get; set; }
        public DbSet<TShirtCompetition> TShirtCompetitions { get; set; }

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
        }
    }
}