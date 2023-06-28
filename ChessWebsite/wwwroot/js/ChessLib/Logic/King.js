import { Fen } from './Fen.js';

export class King {
    constructor(oldMove, newMove, fen, piece) {
        this.fenFunctions = new Fen();
        this.oldMoveLetter = parseInt(oldMove.slice(1, 2));
        this.newMoveLetter = parseInt(newMove.slice(1, 2));
        this.oldMoveRank = parseInt(oldMove.slice(0, 1));
        this.newMoveRank = parseInt(newMove.slice(0, 1));
        this.fen = fen;
        this.fenLength = fen.indexOf(' ');
        this.playerColor = fen[this.fenLength + 1] === 'w';
        this.piece = piece;
    }

    getFen() {
        return this.fen;
    }

    kingRange() {
        const diffLetters = Math.abs(this.oldMoveLetter - this.newMoveLetter);
        const diffNumbers = Math.abs(this.oldMoveRank - this.newMoveRank);

        if (diffLetters > 1 || diffNumbers > 1)
            return false;

        return true;
    }

    disallowCastling(fen) {
        let fenInfo = fen.substring(this.fenLength + 3);
        const kingSymbol = this.playerColor ? ['K', 'Q'] : ['k', 'q'];

        for (let i = 0; i < kingSymbol.length; i++) 
            fenInfo = fenInfo.replace(new RegExp(kingSymbol[i], 'g'), '');    

        if (!/[qrbnp]/.test(fenInfo))
            fenInfo = '-' + fenInfo;

        return fen.substring(0, this.fenLength + 3) + fenInfo;
    }

    oppKing() {
        const dx = [1, 1, 1, 0, 0, -1, -1, -1];
        const dy = [-1, 0, 1, -1, 1, -1, 0, 1];
        const kingCords = this.kingCords('', 'k', 'K');

        for (let i = 0; i < dx.length; i++) {
            const newRow = kingCords[0] + dx[i];
            const newCol = kingCords[1] + dy[i];

            if (newRow === this.newMoveRank && newCol === this.newMoveLetter)
                return true;
        }

        return false;
    }

    castling() {
        let tempFen = this.fen;
        let fenInfo = this.fen.substring(this.fenLength + 3);
        const kingSymbol = this.playerColor ? 'K' : 'k';
        const queenSymbol = this.playerColor ? 'Q' : 'q';
        const rookSymbol = this.playerColor ? 'R' : 'r';
        const allowKs = this.newMoveLetter === 6 && fenInfo.includes(kingSymbol);
        const allowQs = this.newMoveLetter === 2 && fenInfo.includes(queenSymbol);

        if (!allowKs && !allowQs)
            return false;

        for (let i = 1; i < (allowKs ? 3 : 4); i++) {
            const newKingLetter = allowKs ? this.oldMoveLetter + i : this.oldMoveLetter - i;
            const currentSquare = this.fenLength - (8 - newKingLetter + this.oldMoveRank * 9);

            if (!parseInt(this.fen.substring(currentSquare, currentSquare + 1)))
                return false;

            if (this.inCheck(false))
                return false;

            const newFen = this.fenFunctions.update(this.fen, this.playerColor ? '04' : '74', (this.playerColor ? '0' : '7') + newKingLetter, this.playerColor ? 'K' : 'k', false);
            this.fen = newFen;
        }

        this.fen = tempFen;
        let kingPos;
        let rookPos;

        if (allowKs) {
            kingPos = this.playerColor ? ['04', '06'] : ['74', '76'];
            rookPos = this.playerColor ? ['07', '05'] : ['77', '75'];

        } else {
            kingPos = this.playerColor ? ['04', '02'] : ['74', '72'];
            rookPos = this.playerColor ? ['00', '03'] : ['70', '73'];
        }

        this.fen = this.fenFunctions.update(this.fen, kingPos[0], kingPos[1], kingSymbol, false);
        this.fen = this.fenFunctions.update(this.fen, rookPos[0], rookPos[1], rookSymbol, false);

        this.fen = this.disallowCastling(this.fen);
        return true;
    }

    inCheck(update = true) {
        let tempFen = update ? this.fenFunctions.update(this.fen, `${this.oldMoveRank}${this.oldMoveLetter}`, `${this.newMoveRank}${this.newMoveLetter}`, this.piece, false) : this.fen;
        let kingCords = this.kingCords(tempFen);
        let kingPos = this.fenLength - (8 - kingCords[1] + kingCords[0] * 9);

        if (this.qrbCheck(kingPos, tempFen) || this.nCheck(kingPos, tempFen) || this.pCheck(kingPos, tempFen))
            return true;

        return false;
    }

    kingCords(tempFen = '', king = 'K', king2 = 'k') {
        let kN = 0;
        let kLN = 0;

        for (let i = 0; i < this.fenLength; i++) {
            const c = tempFen === '' ? this.fen.charAt(i) : tempFen.charAt(i);

            if (this.playerColor && c === king) {
                kLN = i % 9;
                kN = 7 - Math.floor(i / 9);
                break;
            } else if (!this.playerColor && c === king2) {
                kLN = i % 9;
                kN = (Math.floor(i / 9) - 7) * -1;
                break;
            }
        }

        return [kN, kLN];
    }

    qrbCheck(kP, tempFen) {
        const queenSymbol = this.playerColor ? 'q' : 'Q';
        const rookSymbol = this.playerColor ? 'r' : 'R';
        const bishopSymbol = this.playerColor ? 'b' : 'B';
        const horizontalOffsets = [-1, 1];
        const verticalOffsets = [-9, 9];
        const diagonalOffsets = [-10, -8, 8, 10];

        const isValidPosition = (pos) => pos >= 0 && pos < this.fenLength;
        const isNotEnemy = (pos) => !parseInt(tempFen.charAt(pos));

        for (const horOffset of horizontalOffsets) {
            let pos = kP + horOffset;

            while (isValidPosition(pos)) {
                if (tempFen.charAt(pos) === queenSymbol || tempFen.charAt(pos) === rookSymbol)
                    return true;

                if (isNotEnemy(pos))
                    break;

                pos += horOffset;
            }
        }

        for (const verOffset of verticalOffsets) {
            let pos = kP + verOffset;

            while (isValidPosition(pos)) {
                if (tempFen.charAt(pos) === queenSymbol || tempFen.charAt(pos) === rookSymbol)
                    return true;

                if (isNotEnemy(pos))
                    break;

                pos += verOffset;
            }
        }

        for (const diagOffset of diagonalOffsets) {
            let pos = kP + diagOffset;

            while (isValidPosition(pos)) {
                if (tempFen.charAt(pos) === queenSymbol || tempFen.charAt(pos) === bishopSymbol)
                    return true;

                if (isNotEnemy(pos))
                    break;

                pos += diagOffset;
            }
        }

        return false;
    }

    nCheck(kP, tempFen) {
        const knightSymbol = this.playerColor ? 'n' : 'N';
        const possMoves = [7, 11, -7, -11, 17, 19, -17, -19];
        const knightPositions = [];
        let index = tempFen.indexOf(knightSymbol);

        while (index !== -1) {
            knightPositions.push(index);
            index = tempFen.indexOf(knightSymbol, index + 1);
        }

        for (const item of knightPositions) {
            for (const possMove of possMoves) {
                if (item + possMove === kP)
                    return true;
            }
        }

        return false;
    }

    pCheck(kP, tempFen) {
        const pawnSymbol = this.playerColor ? 'p' : 'P';
        const rightPawn = this.playerColor ? kP - 8 : kP + 8;
        const leftPawn = this.playerColor ? kP - 10 : kP + 10;

        if (rightPawn > 0 && rightPawn <= this.fenLength) {
            if (tempFen.charAt(rightPawn) === pawnSymbol)
                return true;
        }

        if (leftPawn > 0 && leftPawn <= this.fenLength) {
            if (tempFen.charAt(leftPawn) === pawnSymbol)
                return true;
        }

        return false;
    }
}