using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kitverse_backend_01.Migrations
{
    /// <inheritdoc />
    public partial class AddedInventoryAndRestructuredShirt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "amount_avaliable",
                table: "t_shirts");

            migrationBuilder.DropColumn(
                name: "shirt_size",
                table: "t_shirts");

            migrationBuilder.AddColumn<bool>(
                name: "IsMain",
                table: "t_shirts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "inventory",
                columns: table => new
                {
                    t_shirt_id = table.Column<int>(type: "integer", nullable: false),
                    t_shirt_size = table.Column<string>(type: "text", nullable: false),
                    amount_available = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inventory", x => new { x.t_shirt_id, x.t_shirt_size });
                    table.ForeignKey(
                        name: "FK_inventory_t_shirts_t_shirt_id",
                        column: x => x.t_shirt_id,
                        principalTable: "t_shirts",
                        principalColumn: "t_shirt_id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "inventory");

            migrationBuilder.DropColumn(
                name: "IsMain",
                table: "t_shirts");

            migrationBuilder.AddColumn<int>(
                name: "amount_avaliable",
                table: "t_shirts",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "shirt_size",
                table: "t_shirts",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
