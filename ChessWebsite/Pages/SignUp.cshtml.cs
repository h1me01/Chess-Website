using ChessWebsite.Databases.code;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Diagnostics;
using System.Text.RegularExpressions;

namespace ChessWebsite.Pages
{
    public class SignUpModel : PageModel
    {
        [BindProperty]
        public string Username { get; set; }

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

            if (RegisterUser())
            {
                Email = string.Empty;
                Password = string.Empty;
                return RedirectToPage("/LogIn");
            }
            else
            {
                return Page();
            }
        }

        private bool RegisterUser()
        {
            try
            {
                if (!IsValidEmail(Email) || Password.Length < 8 || string.IsNullOrWhiteSpace(Username))
                {
                    ErrorMessage = "Email, Password or Username is invalid!";
                    return false;
                }

                if (Database.InsertUserSignUp(Password, Email, Username))
                {
                    ClearInputFields();
                    return true;
                }
                else
                {
                    ErrorMessage = "E-Mail or Username already exist!";
                    return false;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                return false;
            }
        }

        private void ClearInputFields()
        {
            Username = string.Empty;
            Email = string.Empty;
            Password = string.Empty;
        }

        private bool IsValidEmail(string email)
        {
            Regex regex = new Regex(@"^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$", RegexOptions.CultureInvariant | RegexOptions.Singleline);
            return regex.IsMatch(email);
        }
    }
}