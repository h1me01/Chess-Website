using Microsoft.AspNetCore.SignalR;

namespace ChessWebsite.Hub
{
    public class GameRoom
    {
        public string RoomId { get; }
        public List<Player> Players { get; }

        private IGroupManager groups;

        public GameRoom(IGroupManager groups)
        {
            this.groups = groups;
            RoomId = Guid.NewGuid().ToString();
            Players = new List<Player>();
        }

        public void AddPlayer(string connectionId, string playerName)
        {
            Players.Add(new Player(connectionId, playerName));
            groups.AddToGroupAsync(connectionId, RoomId);
        }
    }
}