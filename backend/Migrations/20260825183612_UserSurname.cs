using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kitverse_backend_01.Migrations
{
    /// <inheritdoc />
    public partial class UserSurname : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "user_surname",
                table: "system_users",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "user_surname",
                table: "system_users");
        }
    }
}
