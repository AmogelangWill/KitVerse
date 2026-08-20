using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Kitverse_backend_01.Migrations
{
    /// <inheritdoc />
    public partial class AddTeamsTShirtsAndShirtLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "teams",
                columns: table => new
                {
                    team_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    team_name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_teams", x => x.team_id);
                });

            migrationBuilder.CreateTable(
                name: "t_shirts",
                columns: table => new
                {
                    t_shirt_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    shirt_season = table.Column<string>(type: "text", nullable: false),
                    shirt_price = table.Column<decimal>(type: "numeric", nullable: false),
                    shirt_affiliate = table.Column<string>(type: "text", nullable: true),
                    amount_avaliable = table.Column<int>(type: "integer", nullable: true),
                    shirt_size = table.Column<string>(type: "text", nullable: false),
                    shirt_gender = table.Column<string>(type: "text", nullable: false),
                    shirt_description = table.Column<string>(type: "text", nullable: false),
                    shirt_status = table.Column<string>(type: "text", nullable: false),
                    shirt_name = table.Column<string>(type: "text", nullable: false),
                    team_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_t_shirts", x => x.t_shirt_id);
                    table.ForeignKey(
                        name: "FK_t_shirts_teams_team_id",
                        column: x => x.team_id,
                        principalTable: "teams",
                        principalColumn: "team_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shirt_links",
                columns: table => new
                {
                    link_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    shirt_link = table.Column<string>(type: "text", nullable: false),
                    t_shirt_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shirt_links", x => x.link_id);
                    table.ForeignKey(
                        name: "FK_shirt_links_t_shirts_t_shirt_id",
                        column: x => x.t_shirt_id,
                        principalTable: "t_shirts",
                        principalColumn: "t_shirt_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_shirt_links_t_shirt_id",
                table: "shirt_links",
                column: "t_shirt_id");

            migrationBuilder.CreateIndex(
                name: "IX_t_shirts_team_id",
                table: "t_shirts",
                column: "team_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "shirt_links");

            migrationBuilder.DropTable(
                name: "t_shirts");

            migrationBuilder.DropTable(
                name: "teams");
        }
    }
}
