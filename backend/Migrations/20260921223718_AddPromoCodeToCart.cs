using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kitverse_backend_01.Migrations
{
    /// <inheritdoc />
    public partial class AddPromoCodeToCart : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "promo_code",
                table: "shopping_carts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "promo_discount_percent",
                table: "shopping_carts",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "promo_code",
                table: "shopping_carts");

            migrationBuilder.DropColumn(
                name: "promo_discount_percent",
                table: "shopping_carts");
        }
    }
}
