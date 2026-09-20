namespace Kitverse_backend_01.Controllers
{
    public interface IStorageService
    {
        Task<string> UploadImage(IFormFile file, string bucket);
        Task<string> DeleteImage(int ShirtLinkID,string bucket);
        Task<List<string>> ListFiles(string bucket);
        Task DeleteFiles(string bucket, List<string> fileNames);
        Task<List<string>> CleanOrphanedImages(string bucket);
    }
}