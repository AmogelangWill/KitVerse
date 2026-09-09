using Kitverse_backend_01.Data;
using Kitverse_backend_01.Controllers;
using Microsoft.EntityFrameworkCore;
using Kitverse_backend_01.Services;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Register the database connection - reads the connection string from raw environment variables
builder.Services.AddDbContext<KitverseDbContext>(options =>
    options.UseNpgsql(Environment.GetEnvironmentVariable("DATABASE_URL")));

// Register AuthService so controllers can request IAuthService and get a working AuthService automatically
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<ITShirtService, TShirtService>();

// Register CartService so controllers can request ICartService and get a working CartService automatically
builder.Services.AddScoped<ICartService, CartService>();
// Register AdminService so controllers can request IAdminService and get a working AdminService automatically
builder.Services.AddScoped<IAdminService, AdminService>();




builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5175", "http://localhost:5173", "https://kitverse.pages.dev", "https://*.kitverse.pages.dev")
              .SetIsOriginAllowedToAllowWildcardSubdomains() // Localhost and Cloudflare
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});



var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();

app.MapControllers();

app.Run();
