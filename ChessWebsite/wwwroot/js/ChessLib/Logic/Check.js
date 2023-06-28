export class Check {
    constructor(oldMove, newMove, fen) {
        this.oldMoveLetter = parseInt(oldMove.slice(1, 2));
        this.newMoveLetter = parseInt(newMove.slice(1, 2));
        this.oldMoveRank = parseInt(oldMove.slice(0, 1));
        this.newMoveRank = parseInt(newMove.slice(0, 1));
        this.fen = fen;
        this.fenLength = fen.indexOf(' ');
        this.playerColor = fen[this.fenLength + 1] === 'w';
    }

    diagMoves() {
        const diffLetterNumber = Math.abs(this.oldMoveLetter - this.newMoveLetter);
        const diffRankNumber = Math.abs(this.oldMoveRank - this.newMoveRank);

        return diffLetterNumber === diffRankNumber && !this.blockades();
    }

    horVerMoves() {
        return (
            this.oldMoveLetter === this.newMoveLetter ||
            this.oldMoveRank === this.newMoveRank
        ) && !this.blockades();
    }

    blockades() {
        const diffNumbers = Math.abs(this.oldMoveRank - this.newMoveRank);
        const diffLetters = Math.abs(this.oldMoveLetter - this.newMoveLetter);
        const isHor = this.oldMoveRank === this.newMoveRank;
        const isVer = this.oldMoveLetter === this.newMoveLetter;
        const isDiag = diffLetters === diffNumbers;
        const piecePos = this.fenLength - (8 - this.oldMoveLetter + this.oldMoveRank * 9);

        for (let i = 1; i < Math.max(diffNumbers, diffLetters); i++) {
            let hor = isHor ? i * Math.sign(this.newMoveLetter - this.oldMoveLetter) : 0;
            let ver = isVer ? i * Math.sign(this.newMoveRank - this.oldMoveRank) * -9 : 0;
            let diag = isDiag ? i * Math.sign(this.newMoveRank - this.oldMoveRank) * -9 + i * Math.sign(this.newMoveLetter - this.oldMoveLetter) : 0;
            let addDir = hor + ver + diag;

            if (isNaN(parseInt(this.fen[piecePos + addDir])))
                return true;
        }

        return false;
    }

    ownPieceCapture() {
        const targetPiecePos = this.fenLength - (8 - this.newMoveLetter + this.newMoveRank * 9);
        const c = this.fen[targetPiecePos];

        if (isNaN(parseInt(c))) {
            return this.playerColor === (c === c.toUpperCase());
        }

        return false;
    }
}