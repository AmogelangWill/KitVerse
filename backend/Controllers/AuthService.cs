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


namespace Kitverse_backend_01.Controllers
{
    public class AuthService : IAuthService // this class is used to implement the methods defined in the IAuthService interface.
    {
        private readonly KitverseDbContext _context; //this is the database connection this service will use to read and wirte system users
        private readonly IConfiguration _config; //used to read the JWT signing key from User Secrets

        public AuthService(KitverseDbContext context, IConfiguration config) //getting a ready to use DbContext from ASP.net
        {
            _context = context;
            _config = config;
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

                    user.PasswordHash = HashPassword(user.PasswordHash); // hashing the password before saving it to the database.
                                                                         // Save the user to the database here (this part is not implemented yet).
                    _context.Users.Add(user);//adding user to the database...
                    await _context.SaveChangesAsync();


                }
            }
            catch (Exception ex)
            {
                throw new ArgumentException("An error occurred while registering the user: " + ex.Message);

            }
            return user;
        }



        //changed login requirements from using a username to using a user email     
        //users will login with email instead of their usernames
        public async Task<User> Login(string email, string password)
        {
            try
            {
                var user = await GetByEmail(email);
                if (user != null && user.UserEmail == email && user.PasswordHash == HashPassword(password))
                {
                    return user;
                }
                else
                {
                    return null;
                }
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

    }
}