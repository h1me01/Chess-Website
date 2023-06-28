using ChessWebsite.Databases.code;
using ChessWebsite.Hub;
using Microsoft.AspNetCore.SignalR;

namespace SignalRChess.Hubs
{
    public class ChessHub : Hub
    {
        private static readonly List<Player> waitingPlayers = new();
        private static readonly List<GameRoom> gameRooms = new();

        public async Task MakeMove(string roomID, string fen, bool playerColor, string playerWhite, string playerBlack, string result)
        {
            if (result != null)
            {
                Database.InsertGame(playerWhite, playerBlack, result);
                await DisconnectGroup(roomID);
            }

            await Clients.Group(roomID).SendAsync("ReceiveMessage", fen, playerColor);
        }

        public async Task JoinGame(string playerName)
        {
            if (waitingPlayers.Exists(p => p.ConnectionId == Context.ConnectionId))
            {
                await Clients.Caller.SendAsync("AlreadyJoined");
                return;
            }

            waitingPlayers.Add(new Player(Context.ConnectionId, playerName));
            await Clients.Caller.SendAsync("PlayerJoined", playerName);
            MatchPlayers();
        }

        private void MatchPlayers()
        {
            while (waitingPlayers.Count >= 2)
            {
                Player player1 = waitingPlayers[0];
                Player player2 = waitingPlayers[1];

                waitingPlayers.RemoveRange(0, 2);

                GameRoom gameRoom = CreateGameRoom(Groups);
                gameRooms.Add(gameRoom);

                gameRoom.AddPlayer(player1.ConnectionId, player1.PlayerName);
                gameRoom.AddPlayer(player2.ConnectionId, player2.PlayerName);

                StartGame(gameRoom);
            }
        }

        private GameRoom CreateGameRoom(IGroupManager groups)
        {
            return new GameRoom(groups);
        }

        private void StartGame(GameRoom gameRoom)
        {
            Clients.Group(gameRoom.RoomId).SendAsync("GameStarted", gameRoom.Players, gameRoom.RoomId);
        }

        private async Task DisconnectGroup(string roomID)
        {
            await Clients.Group(roomID).SendAsync("DisconnectGroup");
        }
    }
}