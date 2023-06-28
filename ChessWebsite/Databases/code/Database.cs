using MySql.Data.MySqlClient;
using Newtonsoft.Json.Linq;
using System.Diagnostics;

namespace ChessWebsite.Databases.code
{
    public static class Database
    {
        private static string connectionString = "";

        public static string UserLogIn(string email, string password)
        {
            try
            {
                Initialize();

                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();

                    string query = "SELECT email, username FROM Player WHERE email = @Email AND playerPassword = @Password";
                    var command = new MySqlCommand(query, connection);
                    command.Parameters.AddWithValue("@Email", email);
                    command.Parameters.AddWithValue("@Password", password);

                    using (var reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            string username = reader.GetString("username");
                            ClearConnectionString();
                            return username;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }

            ClearConnectionString();
            return "";
        }

        public static bool InsertUserSignUp(string password, string email, string username)
        {
            if (CheckIfUserExists(email, username))
                return false;

            try
            {
                Initialize();

                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "INSERT INTO Player (playerID, playerPassword, email, username) " +
                        "VALUES (@playerID, @playerPassword, @email, @username)";
                    var command = new MySqlCommand(query, connection);
                    int count = CountQuery("SELECT COUNT(*) FROM Player");

                    command.Parameters.AddWithValue("@playerID", count + 1);
                    command.Parameters.AddWithValue("@playerPassword", password);
                    command.Parameters.AddWithValue("@email", email);
                    command.Parameters.AddWithValue("@username", username);
                    command.ExecuteNonQuery();

                    email = string.Empty;
                    password = string.Empty;
                }

                ClearConnectionString();
                return true;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                return false;
            }
        }

        public static bool InsertGame(string playerWhite, string playerBlack, string result)
        {
            try
            {
                Initialize();

                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "INSERT INTO Games (gameID, playerWhite, playerBlack, result) " +
                        "VALUES (@gameID, @playerWhite, @playerBlack, @result)";
                    var command = new MySqlCommand(query, connection);
                    int count = CountQuery("SELECT COUNT(*) FROM Games");

                    command.Parameters.AddWithValue("@gameID", count + 1);
                    command.Parameters.AddWithValue("@playerWhite", playerWhite);
                    command.Parameters.AddWithValue("@playerBlack", playerBlack);
                    command.Parameters.AddWithValue("@result", result);
                    command.ExecuteNonQuery();
                }

                ClearConnectionString();
                return true;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                return false;
            }
        }

        public static List<PlayerResults> GetPlayersByRanking()
        {
            List<PlayerResults> playerRankings = new List<PlayerResults>();

            try
            {
                Initialize();

                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "SELECT playerWhite, playerBlack, result FROM Games";
                    var command = new MySqlCommand(query, connection);

                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            string playerWhite = reader.GetString("playerWhite");
                            string playerBlack = reader.GetString("playerBlack");
                            string result = reader.GetString("result");

                            UpdatePlayerRankings(playerRankings, playerWhite, playerBlack, result, true);
                            UpdatePlayerRankings(playerRankings, playerBlack, playerWhite, result, false);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }

            ClearConnectionString();
            return playerRankings;
        }

        //PRIVATE METHODS

        private static void ClearConnectionString()
        {
            connectionString = string.Empty;
        }

        private static void Initialize()
        {
            try
            {
                string filePath = "./Data/database_login.json";
                string jsonContent = File.ReadAllText(filePath);
                JObject json = JObject.Parse(jsonContent);
                connectionString = json["DatabaseConnectionString"]["ChessWebsite"].ToString();
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }
        }

        private static bool CheckIfUserExists(string email, string username)
        {
            try
            {
                Initialize();

                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "SELECT COUNT(*) FROM Player WHERE email = @Email OR username = @Username";
                    var command = new MySqlCommand(query, connection);
                    command.Parameters.AddWithValue("@Email", email);
                    command.Parameters.AddWithValue("@Username", username);
                    int count = Convert.ToInt32(command.ExecuteScalar());
                    ClearConnectionString();
                    return count > 0;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }

            ClearConnectionString();
            return false;
        }

        private static void UpdatePlayerRankings(List<PlayerResults> playerRankings, string playerName, string opponentName, string result, bool color)
        {
            PlayerResults player = playerRankings.Find(p => p.Player == playerName);

            if (player == null)
            {
                player = new PlayerResults
                {
                    Player = playerName,
                    Opponents = new List<string[]>(),
                    Wins = 0,
                    Losses = 0,
                    Draws = 0,
                    Score = 0
                };

                playerRankings.Add(player);
            }

            player.Opponents.Add(new string[] { opponentName, result, color ? "0" : "1" });

            if (result == "1/2-1/2")
            {
                player.Draws++;
                player.Score += 0.5;
            }
            else if ((result == "1-0" && color) || (result == "0-1" && !color))
            {
                player.Wins++;
                player.Score += 1;
            }
            else
            {
                player.Losses++;
                player.Score--;
            }
        }

        private static int CountQuery(string table)
        {
            int count = 0;
            string countQuery = table;

            try
            {
                Initialize();

                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    var countCmd = new MySqlCommand(countQuery, connection);
                    count = Convert.ToInt32(countCmd.ExecuteScalar());
                }

                ClearConnectionString();
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }

            return count;
        }
    }
}