using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Kitverse_backend_01.Migrations
{
    /// <inheritdoc />
    public partial class SyncOrdersInvoicesResetTokensNewsletter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_payments_PaymentId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_system_users_UserId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_Orders_OrderId",
                table: "OrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_t_shirts_ProductId",
                table: "OrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_payments_paymentID",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_system_users_UserId",
                table: "Orders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Orders",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_paymentID",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_UserId",
                table: "Orders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Invoices",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_PaymentId",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_UserId",
                table: "Invoices");

            migrationBuilder.DropPrimaryKey(
                name: "PK_OrderItems",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PaymentId",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Invoices");

            migrationBuilder.RenameTable(
                name: "Orders",
                newName: "orders");

            migrationBuilder.RenameTable(
                name: "Invoices",
                newName: "invoices");

            migrationBuilder.RenameTable(
                name: "OrderItems",
                newName: "order_items");

            migrationBuilder.RenameColumn(
                name: "totalAmount",
                table: "orders",
                newName: "total_amount");

            migrationBuilder.RenameColumn(
                name: "paymentID",
                table: "orders",
                newName: "payment_id");

            migrationBuilder.RenameColumn(
                name: "orderStatus",
                table: "orders",
                newName: "order_status");

            migrationBuilder.RenameColumn(
                name: "orderDate",
                table: "orders",
                newName: "order_date");

            migrationBuilder.RenameColumn(
                name: "CustomerId",
                table: "orders",
                newName: "customer_id");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "orders",
                newName: "order_id");

            migrationBuilder.RenameColumn(
                name: "invoiceNumber",
                table: "invoices",
                newName: "invoice_number");

            migrationBuilder.RenameColumn(
                name: "invoiceDate",
                table: "invoices",
                newName: "invoice_date");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "invoices",
                newName: "invoice_id");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                table: "order_items",
                newName: "quantity");

            migrationBuilder.RenameColumn(
                name: "Price",
                table: "order_items",
                newName: "price");

            migrationBuilder.RenameColumn(
                name: "ProductId",
                table: "order_items",
                newName: "product_id");

            migrationBuilder.RenameColumn(
                name: "OrderId",
                table: "order_items",
                newName: "order_id");

            migrationBuilder.RenameColumn(
                name: "OrderItemId",
                table: "order_items",
                newName: "order_item_id");

            migrationBuilder.RenameIndex(
                name: "IX_OrderItems_ProductId",
                table: "order_items",
                newName: "IX_order_items_product_id");

            migrationBuilder.RenameIndex(
                name: "IX_OrderItems_OrderId",
                table: "order_items",
                newName: "IX_order_items_order_id");

            migrationBuilder.AlterColumn<string>(
                name: "order_status",
                table: "orders",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_orders",
                table: "orders",
                column: "order_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_invoices",
                table: "invoices",
                column: "invoice_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_order_items",
                table: "order_items",
                column: "order_item_id");

            migrationBuilder.CreateTable(
                name: "newsletter_subscribers",
                columns: table => new
                {
                    subscriber_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    email = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    subscribed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    unsubscribed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    unsubscribe_token = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_newsletter_subscribers", x => x.subscriber_id);
                });

            migrationBuilder.CreateTable(
                name: "password_reset_tokens",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    token_hash = table.Column<string>(type: "text", nullable: false),
                    expiration = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_valid = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_password_reset_tokens", x => x.id);
                    table.ForeignKey(
                        name: "FK_password_reset_tokens_system_users_user_id",
                        column: x => x.user_id,
                        principalTable: "system_users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_orders_customer_id",
                table: "orders",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_orders_payment_id",
                table: "orders",
                column: "payment_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_invoices_invoice_number",
                table: "invoices",
                column: "invoice_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_invoices_pay_id",
                table: "invoices",
                column: "pay_id");

            migrationBuilder.CreateIndex(
                name: "IX_invoices_user_id",
                table: "invoices",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_newsletter_subscribers_email",
                table: "newsletter_subscribers",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_newsletter_subscribers_unsubscribe_token",
                table: "newsletter_subscribers",
                column: "unsubscribe_token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_password_reset_tokens_token_hash",
                table: "password_reset_tokens",
                column: "token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_password_reset_tokens_user_id",
                table: "password_reset_tokens",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_invoices_payments_pay_id",
                table: "invoices",
                column: "pay_id",
                principalTable: "payments",
                principalColumn: "payment_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_invoices_system_users_user_id",
                table: "invoices",
                column: "user_id",
                principalTable: "system_users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_order_items_orders_order_id",
                table: "order_items",
                column: "order_id",
                principalTable: "orders",
                principalColumn: "order_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_order_items_t_shirts_product_id",
                table: "order_items",
                column: "product_id",
                principalTable: "t_shirts",
                principalColumn: "t_shirt_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_orders_payments_payment_id",
                table: "orders",
                column: "payment_id",
                principalTable: "payments",
                principalColumn: "payment_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_orders_system_users_customer_id",
                table: "orders",
                column: "customer_id",
                principalTable: "system_users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_invoices_payments_pay_id",
                table: "invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_invoices_system_users_user_id",
                table: "invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_order_items_orders_order_id",
                table: "order_items");

            migrationBuilder.DropForeignKey(
                name: "FK_order_items_t_shirts_product_id",
                table: "order_items");

            migrationBuilder.DropForeignKey(
                name: "FK_orders_payments_payment_id",
                table: "orders");

            migrationBuilder.DropForeignKey(
                name: "FK_orders_system_users_customer_id",
                table: "orders");

            migrationBuilder.DropTable(
                name: "newsletter_subscribers");

            migrationBuilder.DropTable(
                name: "password_reset_tokens");

            migrationBuilder.DropPrimaryKey(
                name: "PK_orders",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_orders_customer_id",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_orders_payment_id",
                table: "orders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_invoices",
                table: "invoices");

            migrationBuilder.DropIndex(
                name: "IX_invoices_invoice_number",
                table: "invoices");

            migrationBuilder.DropIndex(
                name: "IX_invoices_pay_id",
                table: "invoices");

            migrationBuilder.DropIndex(
                name: "IX_invoices_user_id",
                table: "invoices");

            migrationBuilder.DropPrimaryKey(
                name: "PK_order_items",
                table: "order_items");

            migrationBuilder.RenameTable(
                name: "orders",
                newName: "Orders");

            migrationBuilder.RenameTable(
                name: "invoices",
                newName: "Invoices");

            migrationBuilder.RenameTable(
                name: "order_items",
                newName: "OrderItems");

            migrationBuilder.RenameColumn(
                name: "total_amount",
                table: "Orders",
                newName: "totalAmount");

            migrationBuilder.RenameColumn(
                name: "payment_id",
                table: "Orders",
                newName: "paymentID");

            migrationBuilder.RenameColumn(
                name: "order_status",
                table: "Orders",
                newName: "orderStatus");

            migrationBuilder.RenameColumn(
                name: "order_date",
                table: "Orders",
                newName: "orderDate");

            migrationBuilder.RenameColumn(
                name: "customer_id",
                table: "Orders",
                newName: "CustomerId");

            migrationBuilder.RenameColumn(
                name: "order_id",
                table: "Orders",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "invoice_number",
                table: "Invoices",
                newName: "invoiceNumber");

            migrationBuilder.RenameColumn(
                name: "invoice_date",
                table: "Invoices",
                newName: "invoiceDate");

            migrationBuilder.RenameColumn(
                name: "invoice_id",
                table: "Invoices",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "quantity",
                table: "OrderItems",
                newName: "Quantity");

            migrationBuilder.RenameColumn(
                name: "price",
                table: "OrderItems",
                newName: "Price");

            migrationBuilder.RenameColumn(
                name: "product_id",
                table: "OrderItems",
                newName: "ProductId");

            migrationBuilder.RenameColumn(
                name: "order_id",
                table: "OrderItems",
                newName: "OrderId");

            migrationBuilder.RenameColumn(
                name: "order_item_id",
                table: "OrderItems",
                newName: "OrderItemId");

            migrationBuilder.RenameIndex(
                name: "IX_order_items_product_id",
                table: "OrderItems",
                newName: "IX_OrderItems_ProductId");

            migrationBuilder.RenameIndex(
                name: "IX_order_items_order_id",
                table: "OrderItems",
                newName: "IX_OrderItems_OrderId");

            migrationBuilder.AlterColumn<string>(
                name: "orderStatus",
                table: "Orders",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Orders",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PaymentId",
                table: "Invoices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Invoices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Orders",
                table: "Orders",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Invoices",
                table: "Invoices",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_OrderItems",
                table: "OrderItems",
                column: "OrderItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_paymentID",
                table: "Orders",
                column: "paymentID");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserId",
                table: "Orders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_PaymentId",
                table: "Invoices",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_UserId",
                table: "Invoices",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_payments_PaymentId",
                table: "Invoices",
                column: "PaymentId",
                principalTable: "payments",
                principalColumn: "payment_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_system_users_UserId",
                table: "Invoices",
                column: "UserId",
                principalTable: "system_users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_Orders_OrderId",
                table: "OrderItems",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_t_shirts_ProductId",
                table: "OrderItems",
                column: "ProductId",
                principalTable: "t_shirts",
                principalColumn: "t_shirt_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_payments_paymentID",
                table: "Orders",
                column: "paymentID",
                principalTable: "payments",
                principalColumn: "payment_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_system_users_UserId",
                table: "Orders",
                column: "UserId",
                principalTable: "system_users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
