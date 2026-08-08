// Chess Engine - Complete move validation and game logic
class ChessEngine {
    constructor() {
        this.board = this.initBoard();
        this.whiteTurn = true;
        this.moveHistory = [];
        this.castlingRights = { white: { kingside: true, queenside: true }, black: { kingside: true, queenside: true } };
        this.enPassantTarget = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
    }

    initBoard() {
        return [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
        ];
    }

    isWhitePiece(piece) {
        return piece === piece.toUpperCase() && piece !== '.';
    }

    isValidSquare(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (piece === '.') return [];

        const isWhite = this.isWhitePiece(piece);
        if (isWhite !== this.whiteTurn) return [];

        const moves = [];
        const type = piece.toLowerCase();

        switch (type) {
            case 'p':
                moves.push(...this.getPawnMoves(row, col, isWhite));
                break;
            case 'n':
                moves.push(...this.getKnightMoves(row, col, isWhite));
                break;
            case 'b':
                moves.push(...this.getBishopMoves(row, col, isWhite));
                break;
            case 'r':
                moves.push(...this.getRookMoves(row, col, isWhite));
                break;
            case 'q':
                moves.push(...this.getQueenMoves(row, col, isWhite));
                break;
            case 'k':
                moves.push(...this.getKingMoves(row, col, isWhite));
                break;
        }

        return moves.filter(move => !this.leavesKingInCheck(row, col, move[0], move[1], isWhite));
    }

    getPawnMoves(row, col, isWhite) {
        const moves = [];
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;

        // Forward move
        const nextRow = row + direction;
        if (this.isValidSquare(nextRow, col) && this.board[nextRow][col] === '.') {
            moves.push([nextRow, col]);

            // Double move from start
            if (row === startRow) {
                const doubleRow = row + 2 * direction;
                if (this.board[doubleRow][col] === '.') {
                    moves.push([doubleRow, col]);
                }
            }
        }

        // Captures
        for (let colOffset of [-1, 1]) {
            const captureCol = col + colOffset;
            if (this.isValidSquare(nextRow, captureCol)) {
                const target = this.board[nextRow][captureCol];
                if (target !== '.' && this.isWhitePiece(target) !== isWhite) {
                    moves.push([nextRow, captureCol]);
                }
            }
        }

        // En passant
        if (this.enPassantTarget && nextRow === this.enPassantTarget[0] && col + [-1, 1].includes(this.enPassantTarget[1] - col)) {
            moves.push(this.enPassantTarget);
        }

        return moves;
    }

    getKnightMoves(row, col, isWhite) {
        const moves = [];
        const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

        for (let [dr, dc] of offsets) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (target === '.' || this.isWhitePiece(target) !== isWhite) {
                    moves.push([newRow, newCol]);
                }
            }
        }
        return moves;
    }

    getBishopMoves(row, col, isWhite) {
        return this.getSlidingMoves(row, col, isWhite, [[-1,-1],[-1,1],[1,-1],[1,1]]);
    }

    getRookMoves(row, col, isWhite) {
        return this.getSlidingMoves(row, col, isWhite, [[-1,0],[1,0],[0,-1],[0,1]]);
    }

    getQueenMoves(row, col, isWhite) {
        return this.getSlidingMoves(row, col, isWhite, [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]);
    }

    getSlidingMoves(row, col, isWhite, directions) {
        const moves = [];
        for (let [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * dr;
                const newCol = col + i * dc;
                if (!this.isValidSquare(newRow, newCol)) break;

                const target = this.board[newRow][newCol];
                if (target === '.') {
                    moves.push([newRow, newCol]);
                } else {
                    if (this.isWhitePiece(target) !== isWhite) {
                        moves.push([newRow, newCol]);
                    }
                    break;
                }
            }
        }
        return moves;
    }

    getKingMoves(row, col, isWhite) {
        const moves = [];
        const offsets = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

        for (let [dr, dc] of offsets) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (target === '.' || this.isWhitePiece(target) !== isWhite) {
                    moves.push([newRow, newCol]);
                }
            }
        }
        return moves;
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const captured = this.board[toRow][toCol];

        // Make move
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = '.';

        // Update history
        this.moveHistory.push({ from: [fromRow, fromCol], to: [toRow, toCol], piece, captured });

        // Pawn promotion
        if (piece.toLowerCase() === 'p' && (toRow === 0 || toRow === 7)) {
            this.board[toRow][toCol] = this.isWhitePiece(piece) ? 'Q' : 'q';
        }

        // Update game state
        this.whiteTurn = !this.whiteTurn;
        this.halfMoveClock = captured === '.' && piece.toLowerCase() !== 'p' ? this.halfMoveClock + 1 : 0;
        if (!this.isWhitePiece(piece)) this.fullMoveNumber++;
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;
        const move = this.moveHistory.pop();
        this.board[move.from[0]][move.from[1]] = move.piece;
        this.board[move.to[0]][move.to[1]] = move.captured;
        this.whiteTurn = !this.whiteTurn;
    }

    isInCheck(isWhite) {
        const king = isWhite ? 'K' : 'k';
        let kingPos = null;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c] === king) {
                    kingPos = [r, c];
                    break;
                }
            }
        }
        if (!kingPos) return false;
        return this.isAttacked(kingPos[0], kingPos[1], !isWhite);
    }

    isAttacked(row, col, byWhite) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece === '.' || this.isWhitePiece(piece) !== byWhite) continue;

                const moves = [];
                const type = piece.toLowerCase();
                const isWhite = this.isWhitePiece(piece);

                // Simplified attack checking
                if (this.canAttack(r, c, row, col)) return true;
            }
        }
        return false;
    }

    canAttack(fromRow, fromCol, toRow, toCol) {
        const moves = this.getValidMoves(fromRow, fromCol);
        return moves.some(m => m[0] === toRow && m[1] === toCol);
    }

    leavesKingInCheck(fromRow, fromCol, toRow, toCol, isWhite) {
        const oldBoard = this.board.map(row => [...row]);
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = '.';

        const inCheck = this.isInCheck(isWhite);

        this.board = oldBoard;
        return inCheck;
    }

    isCheckmate() {
        if (!this.isInCheck(this.whiteTurn)) return false;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.getValidMoves(r, c).length > 0) return false;
            }
        }
        return true;
    }

    isStalemate() {
        if (this.isInCheck(this.whiteTurn)) return false;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.getValidMoves(r, c).length > 0) return false;
            }
        }
        return true;
    }
}
