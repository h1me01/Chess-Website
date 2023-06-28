using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ChessWebsite.Pages
{
    public class LogOutModel : PageModel
    {
        public void OnGet()
        {
            TempData.Clear();
            HttpContext.Session.Clear();
            RedirectToPage("/Index");
        }
    }
}