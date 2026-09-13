using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Kitverse_backend_01.Migrations
{
    /// <inheritdoc />
    public partial class AddCompetitionsAndBridge : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "competitions",
                columns: table => new
                {
                    competition_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    competition_name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_competitions", x => x.competition_id);
                });

            migrationBuilder.CreateTable(
                name: "t_shirt_competitions",
                columns: table => new
                {
                    t_shirt_id = table.Column<int>(type: "integer", nullable: false),
                    competition_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_t_shirt_competitions", x => new { x.t_shirt_id, x.competition_id });
                    table.ForeignKey(
                        name: "FK_t_shirt_competitions_competitions_competition_id",
                        column: x => x.competition_id,
                        principalTable: "competitions",
                        principalColumn: "competition_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_t_shirt_competitions_t_shirts_t_shirt_id",
                        column: x => x.t_shirt_id,
                        principalTable: "t_shirts",
                        principalColumn: "t_shirt_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_t_shirt_competitions_competition_id",
                table: "t_shirt_competitions",
                column: "competition_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "t_shirt_competitions");

            migrationBuilder.DropTable(
                name: "competitions");
        }
    }
}
