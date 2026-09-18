using Kitverse_backend_01.Data;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;

namespace Kitverse_backend_01.Controllers
{
    public class StorageService : IStorageService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        private KitverseDbContext _context;

        

        public StorageService(HttpClient httpClient, IConfiguration config,KitverseDbContext context)
        {
            _httpClient = httpClient;
            _config = config;
            _context = context;
        }

        public async Task<string> DeleteImage(int ShirtLinkID, string bucket)
        {
            var supabaseUrl = _config["Supabase:Url"];//supabase database to target
            var serviceKey = _config["Supabase:ServiceRoleKey"]; //service roleKey for that database (it allows us to have write and delete Access to supabase

            //getting the url of the image we want to delete
            String ImageUrl="";

            if (bucket.Equals(_config["Supabase:JerseyBucket"]!,StringComparison.OrdinalIgnoreCase))
            {
                ImageUrl = await _context.ShirtLinks.Where(t => t.LinkId == ShirtLinkID).Select(t => t.ShirtLinkUrl).FirstOrDefaultAsync();

            }else if (bucket.Equals(_config["Supabase:BannerBucket"]!, StringComparison.OrdinalIgnoreCase))
            {
                ImageUrl = await _context.Banners.Where(t=> t.BannerId ==ShirtLinkID).Select(t=> t.BannerUrl).FirstOrDefaultAsync();
            }
            else
            {
                throw new ArgumentException($"Invalid Bucket name: '{bucket}'");
            }

            if (string.IsNullOrEmpty(ImageUrl))
            {
                

                throw new Exception($"NO URL found for the ShirtLinkID : {ShirtLinkID}");
            }

            //Extracting the relative Path
            var marker = "/storage/v1/object/public/";
            int markerIndex = ImageUrl.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
        
            if(markerIndex ==-1)
            {
                throw new ArgumentException("The Stored URL is not a valid Supabase URL");
            }

            var relativePath = ImageUrl.Substring(markerIndex + marker.Length);
            var deleteUrl = $"{supabaseUrl}/storage/v1/object/{relativePath}";


            //sending the DELETE request to Supabase Storage
            var request = new HttpRequestMessage(HttpMethod.Delete, deleteUrl);

            request.Headers.Add("Authorization", $"Bearer {serviceKey}");
            request.Headers.Add("apikey", serviceKey);

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Supabase delete failed: {error}");

            }

            return "Image deleted Successfully";
        }

        public async Task<string> UploadImage(IFormFile file, string bucket)
        {
            var supabaseUrl = _config["Supabase:Url"];
            var serviceKey = _config["Supabase:ServiceRoleKey"];

            // unique filename so uploads never overwrite each other
            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var encodedBucket = Uri.EscapeDataString(bucket); // handles the space in "Football jerseys"
            var encodedFileName = Uri.EscapeDataString(fileName);
            var uploadUrl = $"{supabaseUrl}/storage/v1/object/{encodedBucket}/{encodedFileName}";

            using var content = new StreamContent(file.OpenReadStream());
            content.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);

            var request = new HttpRequestMessage(HttpMethod.Post, uploadUrl)
            {
                Content = content
            };
            request.Headers.Add("Authorization", $"Bearer {serviceKey}");
            request.Headers.Add("apikey", serviceKey);

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Upload failed: {error}");
            }

            // bucket must be public for this URL to work without a token
            return $"{supabaseUrl}/storage/v1/object/public/{encodedBucket}/{encodedFileName}";
        }
    }
}