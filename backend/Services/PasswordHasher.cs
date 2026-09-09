using System.Security.Cryptography;
using System.Text;

namespace Kitverse_backend_01.Services
{
    public static class PasswordHasher // This class is used to hash the password using SHA256 algorithm and it is a static class so that we can use it without creating an instance of the class.
    {
        public static string HashPassword(string password) // This method is used to hash the password using SHA256 algorithm and it takes the password as input and returns the hashed password.
        {
            SHA1 algorithim = SHA1.Create(); // 

            byte[] byteArray = algorithim.ComputeHash(Encoding.UTF8.GetBytes(password)); // convert the password to byte array and hash it using SHA256 algorithm

            string hashedPassword = ""; // create a string to store the hashed password
            for (int i = 0; i < byteArray.Length; i++)
            {
                hashedPassword += byteArray[i].ToString("x2"); // convert the byte array to string and store it in the hashedPassword variable

            }
            return hashedPassword;

        }

    }
}
