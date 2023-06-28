use ChessWebsite;

CREATE TABLE Player (
  playerID INT,
  playerPassword varchar(50),
  email varchar(50),
  username VARCHAR(50),
  Primary key(playerID)
);

CREATE TABLE Games (
    gameID int,
    playerWhite varchar(50),
    playerBlack varchar(50),
    result varchar(10),
    PRIMARY KEY (gameID)
);

CREATE TABLE PlayerResult (
    playerID INT,
    gameID INT,
    result VARCHAR(10),
    PRIMARY KEY (playerID, gameID),
    FOREIGN KEY (playerID) REFERENCES Player(playerID),
    FOREIGN KEY (gameID) REFERENCES Games(gameID)
);

CREATE TABLE Openings (
    openingID INT,
	openingName VARCHAR(50),
    openingMoves VARCHAR(500),
	PRIMARY KEY (openingID)
);