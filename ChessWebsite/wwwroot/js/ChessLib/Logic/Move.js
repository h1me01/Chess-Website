import { Check } from './Check.js';
import { Fen } from './Fen.js';
import { King } from './King.js';
import { Pawn } from './Pawn.js';
import { Pieces } from './Pieces.js';
import {End} from './End.js'; 

export class Move {
    constructor(oldMove, newMove, fen, piece) {
        const fenFunctions = new Fen();
        fen = fenFunctions.untangleFen(fen);
        this.piece = piece.toLowerCase();
        this.check = new Check(oldMove, newMove, fen);
        this.pawn = new Pawn(oldMove, newMove, fen);
        this.pieces = new Pieces(oldMove, newMove, fen, piece);
        this.kingProperties = new King(oldMove, newMove, fen, piece);
        this.fen = fen;
    }

    getFen() {
        if (this.piece === 'p') 
            return this.pawn.getFen();
        else if (this.piece === 'r' || this.piece === 'k') 
            return this.pieces.getFen();      

        return this.fen;
    }

    isLegal() {
        if (this.check.ownPieceCapture() || this.kingProperties.inCheck()) {
            return false;
        }

        switch (this.piece) {
            case 'k':
                return this.pieces.king();
            case 'q':
                return this.pieces.queen();
            case 'r':
                return this.pieces.rook();
            case 'b':
                return this.pieces.bishop();
            case 'n':
                return this.pieces.knight();
            case 'p':
                return this.pawn.move();
            default:
                return false;
        }
    }

    end(oldSquare, newSquare, fen, piece) {
        const end = new End(oldSquare, newSquare, fen, piece);

        if (end.checkmate()) 
            return 'checkmate';
        else if (end.stalemate() || end.draw())
            return 'draw';
        
        return null;
    }
}