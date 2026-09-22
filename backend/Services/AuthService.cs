using System;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Kitverse_backend_01.Data;
using Kitverse_backend_01.DTOs;
using Kitverse_backend_01.Models;
using Microsoft.EntityFrameworkCore;
using static Kitverse_backend_01.Services.PasswordHasher; // importing the static class PasswordHasher to use the HashPassword method without creating an instance of the class.
using Google.Apis.Auth;
using System.Security.Cryptography;
using Kitverse_backend_01.Services;

namespace Kitverse_backend_01.Controllers
{
    public class AuthService : IAuthService // this class is used to implement the methods defined in the IAuthService interface.
    {
        private readonly KitverseDbContext _context; //this is the database connection this service will use to read and wirte system users
        private readonly IConfiguration _config; //used to read the JWT signing key from User Secrets

        private readonly IEmailService _emailService; // Inject the email service

        private readonly ILogger<AuthService> _logger;
        public AuthService(KitverseDbContext context, IConfiguration config,
                           IEmailService emailService, ILogger<AuthService> logger)
        {
            _context = context;
            _config = config;
            _emailService = emailService;
            _logger = logger;
        }


        // a failed email must never make a successful registration look like a failure
        private async Task TrySendWelcomeEmail(User user)
        {
            try
            {
                await _emailService.SendWelcomeEmail(user.UserEmail, user.UserName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Welcome email failed for user {UserId}", user.UserId);
            }
        }
        public async Task<User> Register(User user)
        {
            if (string.IsNullOrWhiteSpace(user.UserName) ||
                string.IsNullOrWhiteSpace(user.UserEmail) ||
                string.IsNullOrWhiteSpace(user.UserSurname) ||
                string.IsNullOrWhiteSpace(user.PasswordHash)) // checking if username, email and password are not null or empty
            {
                throw new ArgumentException("Username, email and password are required.");
            }
            try
            {
                var uexistingUser = await GetByEmail(user.UserEmail); // connecting to the database...

                if (uexistingUser != null)
                {
                    throw new InvalidOperationException("User with this email already exists.");
                }
                else
                {
                    // Default to Customer role if none provided
                    if (string.IsNullOrEmpty(user.Role))
                    {
                        user.Role = "Customer";
                    }

                    user.PasswordHash = HashPassword(user.PasswordHash); // hashing the password before saving it to the database.

                    _context.Users.Add(user); // adding user to the database...
                    await _context.SaveChangesAsync();

                    // To prevent foreign key crashes (like in CartService), create the corresponding subclass record
                    if (user.Role == "Customer")
                    {
                        var customer = new Customer
                        {
                            UserId = user.UserId
                        };
                        _context.Customers.Add(customer);
                        await _context.SaveChangesAsync();
                    }

                    await TrySendWelcomeEmail(user);
                }
            }
            catch (Exception ex)
            {
                throw new ArgumentException("An error occurred while registering the user: " + ex.Message, ex);
            }
            return user;
        }



        //changed login requirements from using a username to using a user email     
        //users will login with email instead of their usernames
        public async Task<User?> Login(string email, string password)
        {
            try
            {
                var user = await GetByEmail(email);

                if (user == null)
                {
                    return null;
                }

                if (string.IsNullOrEmpty(user.PasswordHash))
                {
                    // account exists but was created via Google - no password to check against yet
                    throw new InvalidOperationException("This account was created with Google. Please set a password first.");
                }

                if (user.UserEmail == email && user.PasswordHash == HashPassword(password))
                {
                    return user;
                }

                return null;
            }
            catch (InvalidOperationException)
            {
                throw; // let the controller catch and report this specific case distinctly
            }
            catch (Exception ex)
            {
                throw new ArgumentException("An error occurred while logging in: " + ex.Message);
            }
        }

        // Builds a signed JWT containing the user's id, name and role -
        // the frontend sends this back on every request that needs to prove who's logged in.
        public string GenerateToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(4),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // a songo hangwa u connect na database
        //then a remove hedzi helper method .
        private async Task<User?> GetByEmail(string email)
        {
            //returns the user by their email
            return await _context.Users.FirstOrDefaultAsync(u => u.UserEmail == email);
        }

        private async Task<bool> VerifyPassword(string email, string password)

        {

            var user = await GetByEmail(email);
            if (user == null)
            {
                return false;
            }
            return user.PasswordHash == HashPassword(password);
        }

        public async Task<User> GoogleLogin(string idToken)
        {
            GoogleJsonWebSignature.Payload payload;
            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _config["Google:ClientId"] }
                });
            }
            catch (Exception)
            {
                throw new ArgumentException("Invalid Google token.");
            }

            // only trust emails that Google has verified
            if (!payload.EmailVerified)
            {
                throw new ArgumentException("Google account email is not verified.");
            }

            // returning user: sign them in, no second welcome email
            var existingUser = await GetByEmail(payload.Email);
            if (existingUser != null)
            {
                return existingUser;
            }

            // first-time Google sign-in: create the account
            var newUser = new User
            {
                UserName = payload.GivenName ?? payload.Email.Split('@')[0],
                UserSurname = payload.FamilyName ?? string.Empty,
                UserEmail = payload.Email,
                PasswordHash = null,
                Role = "Customer"
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            var customer = new Customer { UserId = newUser.UserId };
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            // a failed email is logged, never breaks the sign-in
            await TrySendWelcomeEmail(newUser);

            return newUser;
        }

        public async Task<bool> SetPassword(int userId, string newPassword)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) return false;

            // only for accounts with no password yet (Google sign-ups);
            // changing an existing password goes through "forgot password"
            if (!string.IsNullOrEmpty(user.PasswordHash))
                throw new InvalidOperationException("This account already has a password. Use 'Forgot password' to change it.");

            user.PasswordHash = HashPassword(newPassword);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ForgotPassword(string email)
        {
            var user = await GetByEmail(email);
            if (user == null)
            {
                return false;
            }

            // Generate a password reset token and send it to the user's email
            var resetToken = RandomNumberGenerator.GetBytes(32);
           var tokenString = Convert.ToBase64String(resetToken);

            using var hasher = SHA256.Create();

            var hashBytes = hasher.ComputeHash(Encoding.UTF8.GetBytes(tokenString));
            var tokenHash = Convert.ToBase64String(hashBytes);

        var oldToken = await _context.PasswordResetTokens.Where(t => t.UserId == user.UserId && t.isValid).ToListAsync();

            foreach (var token in oldToken)
            {
                token.isValid = false; // invalidate any previous tokens for this user
            }
            var resetTokenEntity = new PasswordResetToken
            {
                TokenHash = tokenHash,
                Expiration = DateTime.UtcNow.AddMinutes(30),
                UserId = user.UserId,
                isValid = true
            };

           _context.PasswordResetTokens.Add(resetTokenEntity);
            await _context.SaveChangesAsync();

            var baseUrl = (_config["Frontend:BaseUrl"] ?? "https://kitverse.pages.dev").TrimEnd('/');
            var resetlink = $"{baseUrl}/reset-password?token={Uri.EscapeDataString(tokenString)}";             //generate QR code for the reset link
            using var qrGenerator = new QRCoder.QRCodeGenerator();

            using var qrCodeData = qrGenerator.CreateQrCode(resetlink, QRCoder.QRCodeGenerator.ECCLevel.Q);

            var qrCode = new QRCoder.PngByteQRCode(qrCodeData);

            byte[] qrCodeImage = qrCode.GetGraphic(20);

            //send the email with the reset link and QR code
            await _emailService.SendPasswordResetEmail(user.UserEmail, resetlink, qrCodeImage);
            return true;

        }

        public async Task<bool> ResetPassword(string token, string newPassword)
        {
            // Base64 tokens from URLs often have their + characters accidentally replaced by spaces
            // by browser URL decoding or email clients. Restore them.
            if (token != null) 
            {
                token = token.Replace(" ", "+");
            }

            using var hasher = SHA256.Create();
            var hashBytes = hasher.ComputeHash(Encoding.UTF8.GetBytes(token ?? ""));
            var tokenHash = Convert.ToBase64String(hashBytes);
            var resetTokenEntity =  await _context.PasswordResetTokens.FirstOrDefaultAsync(t => t.TokenHash == tokenHash && t.isValid);

            if(resetTokenEntity == null)
            {
                return false; // token is invalid
            }
            
            // Convert to universal time safely to avoid Postgres DateTime Kind mismatches
            var expirationUtc = resetTokenEntity.Expiration.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(resetTokenEntity.Expiration, DateTimeKind.Utc) 
                : resetTokenEntity.Expiration.ToUniversalTime();

            if (expirationUtc < DateTime.UtcNow)
            {
                return false; // token expired
            }

            var user = await _context.Users.FirstOrDefaultAsync
                            (u => u.UserId == resetTokenEntity.UserId);
            if(user == null)
            {
                return false;
            }
            user.PasswordHash = HashPassword(newPassword);

            resetTokenEntity.isValid = false;

            await _context.SaveChangesAsync();

            return true;
        }

        Task<bool> IAuthService.VerifyPassword(string email, string password)
        {
            return VerifyPassword(email, password);
        }

        
    }
}