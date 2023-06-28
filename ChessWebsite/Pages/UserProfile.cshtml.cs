using ChessWebsite.Databases.code;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Diagnostics;

namespace ChessWebsite.Pages
{
    public class UserProfileModel : PageModel
    {
        public string Username { get; set; }
        public PlayerResults Results { get; set; }
        public int Wins { get; set; }
        public int Losses { get; set; }
        public int Draws { get; set; }

        public void OnGet()
        {
            if (HttpContext.Session.GetString("username") != null)
            {
                string username = HttpContext.Session.GetString("username");
                Username = username;
                Results = Database.GetPlayersByRanking().FirstOrDefault(player => player.Player == username);
                AddGames();
            }
            else
            {
                Username = "Not logged in yet!";
            }
        }

        private void AddGames()
        {
            try
            {
                string username = HttpContext.Session.GetString("username");
                string email = HttpContext.Session.GetString("email");


                if (Results != null)
                {
                    Wins = Results.Wins;
                    Losses = Results.Losses;
                    Draws = Results.Draws;
                }
                else
                {
                    Wins = 0;
                    Losses = 0;
                    Draws = 0;
                }

                email = string.Empty;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }
        }
    }
}