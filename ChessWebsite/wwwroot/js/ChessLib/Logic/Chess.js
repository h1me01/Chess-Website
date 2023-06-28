"use strict";

import { Move } from './Move.js';
import { Fen } from './Fen.js';

const connection = new signalR.HubConnectionBuilder().withUrl("/chessHub").withAutomaticReconnect().build();
const playerWhite = document.getElementById('playerWhite');
const playerBlack = document.getElementById('playerBlack');
const playerWhiteTime = document.getElementById('playerWhiteTime');
const playerBlackTime = document.getElementById('playerBlackTime');
const fenFunctions = new Fen();

let gameData = {
    roomID: null,
    playerWhite: {
        name: '',
        time: 1800
    },
    playerBlack: {
        name: '',
        time: 1800
    },
    fen: fenFunctions.getFen(),
    result: null,
};
let playerData = {
    name: '',
    color: null
};

let oldSquare = null;
let newSquare = null;
let piece = null;
let timer;

function switchColor(fen) {
    return fen.includes(' w ') ? fen.replace(' w ', ' b ') : fen.replace(' b ', ' w ');
}

function displayTimer(playerColor) {
    clearTimeout(timer);

    timer = setInterval(() => {
        const player = playerColor ? gameData.playerWhite : gameData.playerBlack;
        player.time--;

        if (player.time <= 0) {
            result = playerColor ? '0-1' : '1-0';
            clearInterval(timer);
        }

        const minutes = Math.floor(player.time / 60);
        const seconds = player.time % 60;
        const formattedTime = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        !playerColor ? playerWhiteTime.innerHTML = formattedTime : playerBlackTime.innerHTML = formattedTime;
    }, 1000);
}

function createBoard(playerColor) {
    const board = document.getElementById('chessboard');

    for (let row = 0; row < 8; row++) {
        const tr = document.createElement('tr');

        for (let col = 0; col < 8; col++) {
            const td = document.createElement('td');
            td.className = (row + col) % 2 === 0 ? 'white' : 'black';

            if (playerColor) 
                td.id = (7 - row).toString() + col.toString();
            else 
                td.id = row.toString() + (7 - col).toString();
            
            tr.appendChild(td);
        }

        board.appendChild(tr);
    }
}

function handleMouseDown(event) {
    oldSquare = event.currentTarget;
    const img = oldSquare.querySelector("img");

    if (img !== null) {
        const cursor = `url(${img.src}) 40 40, auto`;
        document.body.style.cursor = cursor;
        piece = img;
        img.parentNode.removeChild(img);
    }
}

function handleMouseUp(event) {
    newSquare = event.currentTarget;
    const img = newSquare.querySelector('img');

    if (piece === null)
        return;

    const pieceName = piece.src.charAt(piece.src.length - 5);
    const pieceColor = piece.src.charAt(piece.src.length - 6) === 'w';
    const playerColor = gameData.fen.charAt(gameData.fen.indexOf(' ') + 1) === 'w';
    const move = new Move(oldSquare.id, newSquare.id, gameData.fen, pieceName);

    if (!move.isLegal() || pieceColor !== playerColor || playerData.color !== playerColor) {
        oldSquare.appendChild(piece);
        piece = null;
        document.body.style.cursor = 'default';
        return;
    }

    gameData.fen = fenFunctions.update(move.getFen(), oldSquare.id, newSquare.id, pieceName);
    gameData.fen = switchColor(gameData.fen);

    if (img !== null)
        img.parentNode.removeChild(img);

    newSquare.appendChild(piece);
    piece = null;
    document.body.style.cursor = 'default';

    let end = move.end(oldSquare.id, newSquare.id, gameData.fen, pieceName);

    if (end === 'checkmate') 
        gameData.result = playerColor === true ? '1-0' : '0-1';
    else if (end === 'draw') 
        gameData.result = '1/2-1/2';  

    connection.invoke('MakeMove', gameData.roomID, gameData.fen, playerData.color, gameData.playerWhite.name, gameData.playerBlack.name, gameData.result)
        .catch(err => console.error(err.toString()));
    event.preventDefault();
}

function handleResignButton() {
    if (gameData.roomID === null)
        return;

    gameData.result = playerData.color === true ? '0-1' : '1-0';

    connection.invoke('MakeMove', gameData.roomID, gameData.fen, playerData.color, gameData.playerWhite.name, gameData.playerBlack.name, gameData.result)
        .catch(err => console.error(err.toString()));
}

function initializeChessGame() {
    connection.start().then(() => console.log('SignalR connection established.')).catch(err => console.error(err.toString()));
    connection.on("AlreadyJoined", () => console.log('You have already joined the game'));
    connection.on('PlayerJoined', playerName => console.log(`${playerName} has joined the game`));

    connection.on('GameStarted', (players, roomID) => {
        const chessboard = document.getElementById('chessboard');
        chessboard.innerHTML = '';

        console.log('Game has started between ' + players[0].playerName + ' and ' + players[1].playerName);

        gameData.roomID = roomID;
        gameData.playerWhite.name = players[0].playerName;
        gameData.playerBlack.name = players[1].playerName;

        playerWhite.innerHTML = 'White: ' + gameData.playerWhite.name;
        playerBlack.innerHTML = 'Black: ' + gameData.playerBlack.name;

        playerData.color = gameData.playerWhite.name === playerData.name ? true : false;

        createBoard(playerData.color);
        fenFunctions.draw(gameData.fen);

        document.querySelectorAll('td').forEach(square => {
            square.addEventListener('mousedown', handleMouseDown);
            square.addEventListener('mouseup', handleMouseUp);
        });
    });

    connection.on('DisconnectGroup', () => {
        alert("Game Ended!");
        connection.stop();
    });

    connection.on('ReceiveMessage', (fen, playerColor) => {
        gameData.fen = fen;
        fenFunctions.draw(gameData.fen);
        displayTimer(playerColor);
    });

    //With User Sign Up
    document.getElementById('startGame').addEventListener('click', () => {
        playerData.name = document.getElementById('playerName').innerHTML;

        if (playerData.name === '')
            return;

        connection.invoke('JoinGame', playerData.name);
    });

/* //Without User Sign Up TEST
   document.getElementById('joinButton').addEventListener('click', () => {
        playerData.name = document.getElementById('playerName').value;

        if (playerData.name === '')
            return;

        connection.invoke('JoinGame', playerData.name);
    });*/
}

createBoard(true);
fenFunctions.draw(gameData.fen);

initializeChessGame();

document.getElementById('resignButton').addEventListener('click', handleResignButton);

document.addEventListener('mousemove', (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const chessboardRect = document.getElementById("chessboard").getBoundingClientRect();

    if (
        !(mouseX >= chessboardRect.left &&
            mouseX <= chessboardRect.right &&
            mouseY >= chessboardRect.top &&
            mouseY <= chessboardRect.bottom)
    ) {
        if (piece != null) {
            oldSquare.appendChild(piece);
            piece = null;
        }

        document.body.style.cursor = "default";
    }
});

window.addEventListener('beforeunload', function (e) {
    let confirmationMessage = 'Leaving the Page might lead to data loss.';
    e.returnValue = confirmationMessage;
});