import { Check } from './Check.js';
import { King } from './King.js';

export class Pieces {
    constructor(oldMove, newMove, fen, piece) {
        this.check = new Check(oldMove, newMove, fen);
        this.kingProperties = new King(oldMove, newMove, fen, piece);
        this.oldMoveLetter = parseInt(oldMove.slice(1, 2));
        this.newMoveLetter = parseInt(newMove.slice(1, 2));
        this.oldMoveRank = parseInt(oldMove.slice(0, 1));
        this.newMoveRank = parseInt(newMove.slice(0, 1));
        this.fen = fen;
        this.fenLength = fen.indexOf(' ');
        this.playerColor = fen[this.fenLength + 1] === 'w';
    }

    getFen() {
        return this.fen;
    }

    king() {
        if (this.kingProperties.castling()) {
            this.fen = this.kingProperties.getFen();
            return true;
        }

        if (!this.kingProperties.kingRange() || this.kingProperties.oppKing()) 
            return false;
        
        if (this.check.diagMoves() || this.check.horVerMoves()) {
            this.fen = this.kingProperties.disallowCastling(this.fen);
            return true;
        }

        return false;
    }

    queen() {
        if (this.check.diagMoves() || this.check.horVerMoves()) 
            return true;
        
        return false;
    }

    rook() {
        if (this.check.horVerMoves()) {
            let dLC = this.fen.substring(this.fenLength);
            const queenSymbol = this.playerColor ? 'Q' : 'q';
            const kingSymbol = this.playerColor ? 'K' : 'k';
            const whichRook = this.oldMoveLetter === 0 ? queenSymbol : kingSymbol;
            dLC = dLC.replace(whichRook, '');
            this.fen = `${this.fen.substring(0, this.fenLength)}${dLC}`;
            return true;
        }

        return false;
    }

    bishop() {
        if (this.check.diagMoves()) 
            return true;
        
        return false;
    }

    knight() {
        const rowDistance = Math.abs(this.newMoveRank - this.oldMoveRank);
        const colDistance = Math.abs(this.newMoveLetter - this.oldMoveLetter);

        if ((rowDistance === 2 && colDistance === 1) || (rowDistance === 1 && colDistance === 2)) 
            return true;
        
        return false;
    }
}