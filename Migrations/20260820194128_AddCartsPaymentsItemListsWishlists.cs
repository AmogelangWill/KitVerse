using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Kitverse_backend_01.Migrations
{
    /// <inheritdoc />
    public partial class AddCartsPaymentsItemListsWishlists : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "shopping_carts",
                columns: table => new
                {
                    cart_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    total_cost = table.Column<int>(type: "integer", nullable: false),
                    cart_status = table.Column<string>(type: "text", nullable: true),
                    user_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shopping_carts", x => x.cart_id);
                    table.ForeignKey(
                        name: "FK_shopping_carts_customers_user_id",
                        column: x => x.user_id,
                        principalTable: "customers",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wishlists",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    t_shirt_id = table.Column<int>(type: "integer", nullable: false),
                    date_added = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wishlists", x => new { x.user_id, x.t_shirt_id });
                    table.ForeignKey(
                        name: "FK_wishlists_customers_user_id",
                        column: x => x.user_id,
                        principalTable: "customers",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_wishlists_t_shirts_t_shirt_id",
                        column: x => x.t_shirt_id,
                        principalTable: "t_shirts",
                        principalColumn: "t_shirt_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "item_lists",
                columns: table => new
                {
                    cart_id = table.Column<int>(type: "integer", nullable: false),
                    t_shirt_id = table.Column<int>(type: "integer", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    unit_purchase_at_time = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_item_lists", x => new { x.cart_id, x.t_shirt_id });
                    table.ForeignKey(
                        name: "FK_item_lists_shopping_carts_cart_id",
                        column: x => x.cart_id,
                        principalTable: "shopping_carts",
                        principalColumn: "cart_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_item_lists_t_shirts_t_shirt_id",
                        column: x => x.t_shirt_id,
                        principalTable: "t_shirts",
                        principalColumn: "t_shirt_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "payments",
                columns: table => new
                {
                    payment_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    pay_stack_reference = table.Column<string>(type: "text", nullable: false),
                    amount = table.Column<decimal>(type: "numeric", nullable: false),
                    payment_status = table.Column<string>(type: "text", nullable: true),
                    transaction_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    cart_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payments", x => x.payment_id);
                    table.ForeignKey(
                        name: "FK_payments_shopping_carts_cart_id",
                        column: x => x.cart_id,
                        principalTable: "shopping_carts",
                        principalColumn: "cart_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_item_lists_t_shirt_id",
                table: "item_lists",
                column: "t_shirt_id");

            migrationBuilder.CreateIndex(
                name: "IX_payments_cart_id",
                table: "payments",
                column: "cart_id");

            migrationBuilder.CreateIndex(
                name: "IX_shopping_carts_user_id",
                table: "shopping_carts",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_wishlists_t_shirt_id",
                table: "wishlists",
                column: "t_shirt_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "item_lists");

            migrationBuilder.DropTable(
                name: "payments");

            migrationBuilder.DropTable(
                name: "wishlists");

            migrationBuilder.DropTable(
                name: "shopping_carts");
        }
    }
}
