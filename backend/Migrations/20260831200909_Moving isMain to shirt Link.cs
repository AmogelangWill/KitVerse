using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kitverse_backend_01.Migrations
{
    /// <inheritdoc />
    public partial class MovingisMaintoshirtLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "is_main",
                table: "t_shirts",
                newName: "IsMain");

            migrationBuilder.AddColumn<bool>(
                name: "is_main",
                table: "shirt_links",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_main",
                table: "shirt_links");

            migrationBuilder.RenameColumn(
                name: "IsMain",
                table: "t_shirts",
                newName: "is_main");
        }
    }
}
