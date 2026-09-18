namespace Kitverse_backend_01.Controllers
{
    public interface IStorageService
    {
        Task<string> UploadImage(IFormFile file, string bucket);

        Task<String> DeleteImage(int ShirtLinkID,string bucket);
    }
}