// AI Engine with difficulty levels
class AIEngine {
    constructor() {
        this.difficulty = 2;
        this.evaluateCache = {};
    }

    setDifficulty(level) {
        this.difficulty = Math.max(1, Math.min(4, level));
    }

    getBestMove(engine) {
        const validMoves = this.getAllValidMoves(engine);
        if (validMoves.length === 0) return null;

        let bestMove = validMoves[0];
        let bestScore = -Infinity;

        const depth = this.difficulty;
        
        for (let move of validMoves) {
            const score = this.minimax(engine, move, depth - 1, -Infinity, Infinity, false);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    getAllValidMoves(engine) {
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = engine.board[r][c];
                if (piece !== '.' && !engine.isWhitePiece(piece)) {
                    const pieceMoves = engine.getValidMoves(r, c);
                    moves.push(...pieceMoves.map(m => ({ from: [r, c], to: m })));
                }
            }
        }
        return moves;
    }

    minimax(engine, move, depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            return this.evaluateBoard(engine);
        }

        const oldBoard = engine.board.map(row => [...row]);
        
        // Make move
        engine.board[move.to[0]][move.to[1]] = engine.board[move.from[0]][move.from[1]];
        engine.board[move.from[0]][move.from[1]] = '.';

        let value;
        if (isMaximizing) {
            value = -Infinity;
            const moves = this.getAllValidMoves(engine);
            for (let nextMove of moves) {
                const score = this.minimax(engine, nextMove, depth - 1, alpha, beta, false);
                value = Math.max(value, score);
                alpha = Math.max(alpha, value);
                if (beta <= alpha) break;
            }
        } else {
            value = Infinity;
            const moves = this.getAllValidMoves(engine);
            for (let nextMove of moves) {
                const score = this.minimax(engine, nextMove, depth - 1, alpha, beta, true);
                value = Math.min(value, score);
                beta = Math.min(beta, value);
                if (beta <= alpha) break;
            }
        }

        engine.board = oldBoard;
        return value;
    }

    evaluateBoard(engine) {
        let score = 0;

        // Piece values
        const pieceValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0 };

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = engine.board[r][c];
                if (piece !== '.') {
                    const value = pieceValues[piece.toLowerCase()] || 0;
                    const sign = engine.isWhitePiece(piece) ? 1 : -1;
                    score += value * sign;
                }
            }
        }

        // Check/checkmate bonuses
        if (engine.isCheckmate()) {
            score += engine.whiteTurn ? -10000 : 10000;
        } else if (engine.isInCheck(engine.whiteTurn)) {
            score += engine.whiteTurn ? -50 : 50;
        }

        // Center control bonus
        for (let r = 2; r < 6; r++) {
            for (let c = 2; c < 6; c++) {
                const piece = engine.board[r][c];
                if (piece !== '.') {
                    const centerValue = 0.1;
                    const sign = engine.isWhitePiece(piece) ? 1 : -1;
                    score += centerValue * sign;
                }
            }
        }

        return score;
    }

    getRandomMove(engine) {
        const moves = this.getAllValidMoves(engine);
        if (moves.length === 0) return null;
        return moves[Math.floor(Math.random() * moves.length)];
    }

    getEasyMove(engine) {
        // Easy: random move from good moves
        const moves = this.getAllValidMoves(engine);
        if (moves.length === 0) return null;
        
        const scoredMoves = moves.map(m => ({
            move: m,
            score: this.quickEvaluate(engine, m)
        })).sort((a, b) => b.score - a.score);

        return scoredMoves[Math.floor(Math.random() * Math.min(3, scoredMoves.length))].move;
    }

    quickEvaluate(engine, move) {
        let score = 0;
        const target = engine.board[move.to[0]][move.to[1]];
        if (target !== '.') {
            const pieceValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9 };
            score += pieceValues[target.toLowerCase()] || 0;
        }
        return score;
    }

    makeMove(engine) {
        let move;
        
        switch(this.difficulty) {
            case 1:
                move = this.getRandomMove(engine);
                break;
            case 2:
                move = this.getEasyMove(engine);
                break;
            case 3:
                move = this.getBestMove(engine);
                break;
            case 4:
                move = this.getBestMove(engine);
                break;
            default:
                move = this.getRandomMove(engine);
        }

        if (move) {
            engine.makeMove(move.from[0], move.from[1], move.to[0], move.to[1]);
            return move;
        }
        return null;
    }
}

// Game Manager
class GameManager {
    constructor() {
        this.engine = new ChessEngine();
        this.aiEngine = new AIEngine();
        this.gameMode = 'ai'; // 'ai' or 'timed'
        this.whiteTimeRemaining = 0;
        this.blackTimeRemaining = 0;
        this.gameActive = false;
        this.moveCallbacks = [];
        this.gameOverCallbacks = [];
    }

    startAIGame(difficulty = 2) {
        this.engine = new ChessEngine();
        this.aiEngine.setDifficulty(difficulty);
        this.gameMode = 'ai';
        this.gameActive = true;
        return this.engine.board;
    }

    startTimedGame(timeSeconds = 600) {
        this.engine = new ChessEngine();
        this.gameMode = 'timed';
        this.whiteTimeRemaining = timeSeconds;
        this.blackTimeRemaining = timeSeconds;
        this.gameActive = true;
        
        this.startTimers();
        return this.engine.board;
    }

    startTimers() {
        const timerInterval = setInterval(() => {
            if (!this.gameActive) {
                clearInterval(timerInterval);
                return;
            }

            if (this.engine.whiteTurn) {
                this.whiteTimeRemaining--;
                if (this.whiteTimeRemaining <= 0) {
                    this.endGame('loss');
                    clearInterval(timerInterval);
                }
            } else {
                this.blackTimeRemaining--;
                if (this.blackTimeRemaining <= 0) {
                    this.endGame('win');
                    clearInterval(timerInterval);
                }
            }

            this.triggerTimerUpdate();
        }, 1000);
    }

    playerMove(fromRow, fromCol, toRow, toCol) {
        if (!this.gameActive || !this.engine.whiteTurn) return false;

        const validMoves = this.engine.getValidMoves(fromRow, fromCol);
        const isValid = validMoves.some(m => m[0] === toRow && m[1] === toCol);

        if (!isValid) return false;

        this.engine.makeMove(fromRow, fromCol, toRow, toCol);
        this.triggerMoveCallback();

        if (this.engine.isCheckmate()) {
            this.endGame('win');
            return true;
        }

        if (this.engine.isStalemate()) {
            this.endGame('draw');
            return true;
        }

        // AI move
        if (this.gameMode === 'ai') {
            setTimeout(() => this.makeAIMove(), 500);
        }

        return true;
    }

    makeAIMove() {
        if (!this.gameActive || this.engine.whiteTurn) return;

        const move = this.aiEngine.makeMove(this.engine);
        
        if (!move) {
            this.endGame(this.engine.isCheckmate() ? 'win' : 'draw');
            return;
        }

        this.triggerMoveCallback();

        if (this.engine.isCheckmate()) {
            this.endGame('loss');
        } else if (this.engine.isStalemate()) {
            this.endGame('draw');
        }
    }

    endGame(result) {
        this.gameActive = false;
        this.triggerGameOverCallback(result);
    }

    triggerMoveCallback() {
        this.moveCallbacks.forEach(cb => cb(this.engine.board, this.engine.moveHistory));
    }

    triggerGameOverCallback(result) {
        this.gameOverCallbacks.forEach(cb => cb(result));
    }

    triggerTimerUpdate() {
        this.moveCallbacks.forEach(cb => cb(this.engine.board, this.engine.moveHistory));
    }

    onMove(callback) {
        this.moveCallbacks.push(callback);
    }

    onGameOver(callback) {
        this.gameOverCallbacks.push(callback);
    }

    resign() {
        this.endGame('loss');
    }

    offerDraw() {
        // Implement draw offer logic
    }

    getGameStatus() {
        return {
            board: this.engine.board,
            whiteTurn: this.engine.whiteTurn,
            whiteTime: this.whiteTimeRemaining,
            blackTime: this.blackTimeRemaining,
            moves: this.engine.moveHistory,
            inCheck: this.engine.isInCheck(this.engine.whiteTurn),
            checkmate: this.engine.isCheckmate(),
            stalemate: this.engine.isStalemate()
        };
    }
}
