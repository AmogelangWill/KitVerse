using Kitverse_backend_01.Controllers;
using Kitverse_backend_01.Data;
using Kitverse_backend_01.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.RateLimiting;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

//Service For Storage
builder.Services.AddHttpClient<IStorageService, StorageService>();
// Register the database connection - reads the connection string from raw environment variables
builder.Services.AddDbContext<KitverseDbContext>(options =>
    options.UseNpgsql(Environment.GetEnvironmentVariable("DATABASE_URL")));

// Register AuthService so controllers can request IAuthService and get a working AuthService automatically
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<ITShirtService, TShirtService>();
builder.Services.AddScoped<ICartService, CartService>();
// Register AdminService so controllers can request IAdminService and get a working AdminService automatically
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IReviewService, ReviewService>();

builder.Services.AddHttpClient<IPaymentService, PaymentService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();

// JWT authentication - lets the API verify who's logged in on protected requests
var jwtKey = builder.Configuration["Jwt:Key"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddAuthorization();

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


builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("public-forms", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1)
            }));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();