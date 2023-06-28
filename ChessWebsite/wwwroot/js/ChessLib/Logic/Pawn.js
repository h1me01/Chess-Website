import { Check } from './Check.js';

export class Pawn {
    constructor(oldMove, newMove, fen) {
        this.check = new Check(oldMove, newMove, fen);
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

    move() {
        const dir = this.playerColor ? 1 : -1;
        const start = this.playerColor ? 1 : 6;
        const end = this.playerColor ? 3 : 4;
        const ep = this.playerColor ? 'Z' : 'z';

        if (this.oldMoveRank + dir === this.newMoveRank) {
            if (this.oldMoveLetter === this.newMoveLetter && !this.capture()) {
                this.promotion();
                return true;
            }
             
            if (Math.abs(this.oldMoveLetter - this.newMoveLetter) === 1 && this.capture()) {    
                this.promotion();
                return true;
            }

            if (Math.abs(this.oldMoveLetter - this.newMoveLetter) === 1 && this.enPassant()) 
                return true;         
        } else if (
            this.oldMoveRank === start &&
            this.newMoveRank === end &&
            this.oldMoveLetter === this.newMoveLetter &&
            this.check.horVerMoves() &&
            !this.capture()
        ) {
            this.fen = this.delEnPassant(this.playerColor, this.fen);
            const fenInfo = this.fen.substring(this.fen.length - 1).replace('-', ep + this.newMoveLetter);
            this.fen = this.fen.substring(0, this.fen.length - 1) + fenInfo;
            return true;
        }

        return false;
    }

    delEnPassant(playerColor, fen) {
        const ep = playerColor ? 'z' : 'Z';
        const epIndex = fen.indexOf(ep);

        if (epIndex === -1) 
            return fen;
        
        return fen.replace(fen.substring(epIndex, epIndex + 2), '-');
    }

    promotion() {
        if ((this.playerColor && this.newMoveRank === 7) || (!this.playerColor && this.newMoveRank === 0)) {
            const newQueenPos = this.fenLength - (8 - this.newMoveLetter + this.newMoveRank * 9);
            this.fen = `${this.fen.substring(0, newQueenPos)}${this.playerColor ? 'Q' : 'q'}${this.fen.substring(newQueenPos + 1)}`;
            return true;
        }

        return false;
    }

    enPassant() {
        const ep = this.playerColor ? 'z' : 'Z';
        const epPos = this.playerColor ? 4 : 3;
        const epIndex = this.fen.indexOf(ep);

        if (epIndex === -1 || epPos !== this.oldMoveRank) 
            return false;
        
        const enPassant = this.fen.substring(epIndex, epIndex + 2);

        if (enPassant === `${ep}${this.newMoveLetter}`) {
            const pawnPos = this.fenLength - (8 - this.newMoveLetter + this.oldMoveRank * 9);
            this.fen = `${this.fen.substring(0, pawnPos)}1${this.fen.substring(pawnPos + 1)}`;
            return true;
        }

        return false;
    }

    capture() {
        const targetPiecePos = this.fenLength - (8 - this.newMoveLetter + this.newMoveRank * 9);
        return isNaN(parseInt(this.fen[targetPiecePos]));
    }
}