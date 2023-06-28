import { King } from './King.js';
import { Move } from './Move.js';
import { Fen } from './Fen.js';

export class End {
    constructor(oldMove, newMove, fen, piece) {
        const fenFunctions = new Fen();
        this.fen = fenFunctions.untangleFen(fen);
        this.fenLength = this.fen.indexOf(' ');
        this.playerColor = this.fen[this.fenLength + 1] == 'w';
        this.kingProperties = new King(oldMove, newMove, this.fen, piece);
    }

    getSquares() {
        let squares = [];

        for (let file = 0; file <= 7; file++) {
            for (let rank = 0; rank <= 7; rank++) {
                squares.push(`${file}${rank}`);
            }
        }

        return squares;
    }

    getPiecesPos() {
        let getAllPieces = [];
        let currentRank = 7;
        let letterPos = -1;

        for (let i = 0; i < this.fenLength; i++) {
            let c = this.fen[i];
            letterPos += parseInt(this.fen.substring(i, i + 1)) || 1;
            let isDigit = Number.isInteger(parseInt(c));
            let isWhite = c === c.toUpperCase();

            if (c === '/') {
                currentRank--;
                letterPos = -1;
            } else if (this.playerColor && isWhite && !isDigit) 
                getAllPieces.push(c + currentRank + letterPos);
              else if (!this.playerColor && !isWhite && !isDigit) 
                getAllPieces.push(c + currentRank + letterPos);
        }

        return getAllPieces;
    }

    moves() {
        let getAllSquares = this.getSquares();
        let getAllPieces = this.getPiecesPos();

        for (let item of getAllPieces) {
            for (let item1 of getAllSquares) {
                let piece = item[0];
                let oldMove = item.toLowerCase().substring(1);
                let newMove = item1;
                const move = new Move(oldMove, newMove, this.fen, piece);

                if (move.isLegal() && oldMove != newMove) 
                    return true;                           
            }
        }

        return false;
    }


    checkmate() {
        return !this.moves() && this.kingProperties.inCheck(false);
    }

    draw() {
        const tempFen = this.fen.toLowerCase();
        return !tempFen.split('').some((c) => "qrbnp".includes(c));
    }

    stalemate() {
        return !this.moves() && !this.kingProperties.inCheck(false);
    }
}