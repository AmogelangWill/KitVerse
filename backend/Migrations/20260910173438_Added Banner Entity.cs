using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Kitverse_backend_01.Migrations
{
    /// <inheritdoc />
    public partial class AddedBannerEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsMain",
                table: "t_shirts");

            migrationBuilder.CreateTable(
                name: "banners",
                columns: table => new
                {
                    BannerId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    banner_name = table.Column<string>(type: "text", nullable: false),
                    team_1 = table.Column<int>(type: "integer", nullable: false),
                    team_2 = table.Column<int>(type: "integer", nullable: false),
                    banner_url = table.Column<string>(type: "text", nullable: false),
                    banner_description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_banners", x => x.BannerId);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "banners");

            migrationBuilder.AddColumn<bool>(
                name: "IsMain",
                table: "t_shirts",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
