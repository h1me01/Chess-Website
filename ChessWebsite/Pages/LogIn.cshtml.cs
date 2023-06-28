using ChessWebsite.Databases.code;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Diagnostics;

namespace ChessWebsite.Pages
{
    public class LogInModel : PageModel
    {
        [BindProperty]
        public string Email { get; set; }

        [BindProperty]
        public string Password { get; set; }

        public string ErrorMessage { get; set; }

        public IActionResult OnPost()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            if (LoginUser())
            {
                return RedirectToPage("/Index");
            }
            else
            {
                ErrorMessage = "Invalid email or password";
                return Page();
            }
        }

        private bool LoginUser()
        {
            try
            {
                if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
                {
                    return false;
                }

                string username = Database.UserLogIn(Email, Password);

                if (username != "")
                {
                    HttpContext.Session.SetString("username", username);
                    HttpContext.Session.SetString("email", Email);

                    Email = string.Empty;
                    Password = string.Empty;
                    return true;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }

            return false;
        }
    }
}