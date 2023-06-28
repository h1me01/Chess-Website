namespace ChessWebsite.Hub
{
    public class Player
    {
        public string ConnectionId { get; }
        public string PlayerName { get; }

        public Player(string connectionId, string playerName)
        {
            ConnectionId = connectionId;
            PlayerName = playerName;
        }
    }
}