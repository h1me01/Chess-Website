using ChessWebsite.Databases.code;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ChessWebsite.Pages
{
    public class RankingsModel : PageModel
    {
        public List<PlayerResults> PlayerRankings { get; set; }

        public void OnGet()
        {
            PlayerRankings = Database.GetPlayersByRanking();
            PlayerRankings = PlayerRankings.OrderByDescending(p => p.Score).ToList();
        }
    }
}