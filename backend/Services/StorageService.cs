using System.Net.Http.Headers;

namespace Kitverse_backend_01.Controllers
{
    public class StorageService : IStorageService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public StorageService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
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