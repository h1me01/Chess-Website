import { Pawn } from './Pawn.js';

export class Fen {
    static fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -';

    getFen() {
        return Fen.fen;
    }

    clearBoard() {
        const squares = document.querySelectorAll('td');

        squares.forEach((square) => {
            const img = square.querySelector('img');
            if (img) 
                square.removeChild(img);         
        });
    }

    draw(fen) {
        const squares = document.querySelectorAll('td');
        this.clearBoard();
        let fenLength = fen.indexOf(' ');
        let col = 0;
        let row = 7;

        for (let i = 0; i < fenLength; i++) {
            let c = fen.charAt(i);
            let isNumber = parseInt(c) || 0;
            let whichPlayer = c === c.toUpperCase();
            col += isNumber;

            if (c === '/') {
                row--;
                col = 0;
            } else if (isNumber === 0) {
                let piece = (whichPlayer ? 'w' + c.toLowerCase() : 'b' + c.toLowerCase()) + '.png';

                squares.forEach((square) => {
                    if (square.id === `${row}${col}`) {
                        const img = document.createElement('img');
                        img.src = this.pieceSrc(piece);
                        img.style.width = '80%';
                        img.style.height = '80%';
                        square.appendChild(img);
                    }
                });

                col++;
            }
        }
    }

    pieceSrc(pieceName) {
        return './js/ChessLib/ChessPieces/' + pieceName;
    }

    update(fen, oldMove, newMove, piece, tangleFen = true) {
        fen = this.untangleFen(fen);
        const pawn = new Pawn(oldMove, newMove, fen);
        const oldMoveLetter = parseInt(oldMove.slice(1, 2));
        const newMoveLetter = parseInt(newMove.slice(1, 2));
        const oldMoveRank = parseInt(oldMove.slice(0, 1));
        const newMoveRank = parseInt(newMove.slice(0, 1));
        const fenLength = fen.indexOf(' ');
        const playerColor = fen[fenLength + 1] === 'w';
        let row = 7;
        let col = -1;

        for (let i = 0; i < fenLength; i++) {
            const c = fen[i];
            col += parseInt(c) || 1;

            if (c === '/') {
                row--;
                col = -1;
            }

            if (row === oldMoveRank && col === oldMoveLetter) 
                fen = `${fen.slice(0, i)}1${fen.slice(i + 1)}`;
            
            if (row === newMoveRank && col === newMoveLetter && !(pawn.promotion() && piece.toLowerCase() === 'p')) 
                fen = `${fen.slice(0, i)}${playerColor ? piece.toUpperCase() : piece}${fen.slice(i + 1)}`;           
        }

        if (tangleFen) 
            fen = this.tangleFen(fen);
        
        fen = pawn.delEnPassant(playerColor, fen);
        return fen;
    }

    tangleFen(fen) {
        let currentNumber = 0;
        let indexStart = 0;

        for (let i = 0; i < fen.length; i++) {
            const c = fen.charAt(i);
            const n = parseInt(c);

            if (!isNaN(n)) {
                currentNumber += n;

                if (currentNumber === n)
                    indexStart = i;
            } else {
                if (currentNumber > 0) {
                    fen = fen.slice(0, indexStart) + currentNumber + fen.slice(i);
                    i = indexStart;
                    currentNumber = 0;
                }
            }
        }

        return fen;
    }

    untangleFen(fen) {
        let fenLength = fen.indexOf(' ');

        for (let i = 0; i < fenLength; i++) {
            const c = fen.charAt(i);
            const n = parseInt(c);
            if (!isNaN(n) && n > 1) {
                const newStr = '1'.repeat(n);
                fen = fen.slice(0, i) + newStr + fen.slice(i + 1);
            }

            fenLength = fen.indexOf(' ');
        }

        return fen;
    }
}