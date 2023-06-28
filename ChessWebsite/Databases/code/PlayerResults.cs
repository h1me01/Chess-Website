namespace ChessWebsite.Databases.code
{
    public class PlayerResults
    {
        public string? Player { get; set; }
        public List<string[]>? Opponents { get; set; }
        public int Wins { get; set; }
        public int Losses { get; set; }
        public int Draws { get; set; }
        public double Score { get; set; }
    }
}