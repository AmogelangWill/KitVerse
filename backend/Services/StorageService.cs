using Kitverse_backend_01.Data;
using Kitverse_backend_01.Models;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

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

            try
            {
                if (bucket.Equals(_config["Supabase:JerseyBucket"]!, StringComparison.OrdinalIgnoreCase))
                {
                    ShirtLink toDelete = await _context.ShirtLinks.FirstOrDefaultAsync(t => t.LinkId == ShirtLinkID);

                    if (toDelete != null)
                    {
                        _context.ShirtLinks.Remove(toDelete);
                        await _context.SaveChangesAsync();
                    }
                }
                else if (bucket.Equals(_config["Supabase:BannerBucket"]!, StringComparison.OrdinalIgnoreCase))
                {
                    var toDelete = await _context.Banners.FirstOrDefaultAsync(t => t.BannerId == ShirtLinkID);

                    if (toDelete != null)
                    {
                        _context.Banners.Remove(toDelete);
                        _context.SaveChangesAsync();
                    }
                }

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
           
            return "Image deleted Successfully";
        }


        public async Task<List<string>> CleanOrphanedImages(string bucket)
        {
            bool isJerseyBucket = bucket.Equals(_config["Supabase:JerseyBucket"]!, StringComparison.OrdinalIgnoreCase);
            bool isBannerBucket = bucket.Equals(_config["Supabase:BannerBucket"]!, StringComparison.OrdinalIgnoreCase);

            List<string> referencedUrls;

            if (isJerseyBucket)
            {
                referencedUrls = await _context.ShirtLinks.Select(sl => sl.ShirtLinkUrl).ToListAsync();
            }
            else if (isBannerBucket)
            {
                referencedUrls = await _context.Banners.Select(b => b.BannerUrl).ToListAsync();
            }
            else
            {
                throw new ArgumentException($"Invalid bucket name: '{bucket}'");
            }

            var filesInBucket = await ListFiles(bucket);

            var referencedFileNames = referencedUrls
                .Select(url => Uri.UnescapeDataString(url.Split('/').Last()))
                .ToHashSet();

            var orphaned = filesInBucket.Where(f => !referencedFileNames.Contains(f)).ToList();

            if (orphaned.Any())
            {
                await DeleteFiles(bucket, orphaned);
            }

            return orphaned;
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

        // Lists every file actually sitting in a bucket
        public async Task<List<string>> ListFiles(string bucket)
        {
            var supabaseUrl = _config["Supabase:Url"];
            var serviceKey = _config["Supabase:ServiceRoleKey"];
            var encodedBucket = Uri.EscapeDataString(bucket);

            var listUrl = $"{supabaseUrl}/storage/v1/object/list/{encodedBucket}";
            var payload = new { prefix = "" };
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage(HttpMethod.Post, listUrl) { Content = content };
            request.Headers.Add("Authorization", $"Bearer {serviceKey}");
            request.Headers.Add("apikey", serviceKey);

            var response = await _httpClient.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Failed to list bucket contents: {responseBody}");
            }

            using var doc = JsonDocument.Parse(responseBody);
            var fileNames = new List<string>();
            foreach (var item in doc.RootElement.EnumerateArray())
            {
                var name = item.GetProperty("name").GetString();
                if (name != null) fileNames.Add(name);
            }
            return fileNames;
        }

        // Deletes one or more files from a bucket in a single call
        public async Task DeleteFiles(string bucket, List<string> fileNames)
        {
            if (fileNames.Count == 0) return;

            var supabaseUrl = _config["Supabase:Url"];
            var serviceKey = _config["Supabase:ServiceRoleKey"];
            var encodedBucket = Uri.EscapeDataString(bucket);

            var deleteUrl = $"{supabaseUrl}/storage/v1/object/{encodedBucket}";
            var payload = new { prefixes = fileNames };
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage(HttpMethod.Delete, deleteUrl) { Content = content };
            request.Headers.Add("Authorization", $"Bearer {serviceKey}");
            request.Headers.Add("apikey", serviceKey);

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Failed to delete files: {error}");
            }
        }
    }
}