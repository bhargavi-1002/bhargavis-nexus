const ChessEngine = require('./chessEngine');

/**
 * AI/Computer Opponent Engine
 * Implements difficulty levels: easy, medium, hard, expert
 */

class AIEngine {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.maxDepth = this.getMaxDepth();
  }

  /**
   * Get search depth based on difficulty
   * @returns {number} Search depth
   */
  getMaxDepth() {
    const depthMap = {
      'easy': 1,
      'medium': 2,
      'hard': 3,
      'expert': 4
    };
    return depthMap[this.difficulty] || 2;
  }

  /**
   * Get best move for current position
   * @param {ChessEngine} engine - Chess engine instance
   * @returns {object} Best move with from and to squares
   */
  getBestMove(engine) {
    const moves = engine.getLegalMoves();

    if (moves.length === 0) {
      return null;
    }

    // Easy: Random move
    if (this.difficulty === 'easy') {
      return this.getRandomMove(moves);
    }

    // Medium/Hard/Expert: Minimax with alpha-beta pruning
    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
      const testEngine = new ChessEngine(engine.getFen());
      testEngine.makeMove(move.from, move.to, move.promotion);

      const score = this.minimax(testEngine, this.maxDepth - 1, -Infinity, Infinity, false);

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  /**
   * Minimax algorithm with alpha-beta pruning
   * @param {ChessEngine} engine - Chess engine
   * @param {number} depth - Search depth
   * @param {number} alpha - Alpha value
   * @param {number} beta - Beta value
   * @param {boolean} isMaximizing - Is maximizing player turn
   * @returns {number} Board evaluation score
   */
  minimax(engine, depth, alpha, beta, isMaximizing) {
    if (depth === 0 || engine.game.game_over()) {
      return this.evaluatePosition(engine);
    }

    const moves = engine.getLegalMoves();

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of moves) {
        const testEngine = new ChessEngine(engine.getFen());
        testEngine.makeMove(move.from, move.to, move.promotion);
        const score = this.minimax(testEngine, depth - 1, alpha, beta, false);
        maxScore = Math.max(score, maxScore);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        const testEngine = new ChessEngine(engine.getFen());
        testEngine.makeMove(move.from, move.to, move.promotion);
        const score = this.minimax(testEngine, depth - 1, alpha, beta, true);
        minScore = Math.min(score, minScore);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return minScore;
    }
  }

  /**
   * Evaluate position from AI's perspective (white is positive)
   * @param {ChessEngine} engine - Chess engine
   * @returns {number} Position score
   */
  evaluatePosition(engine) {
    // Check game end conditions
    const status = engine.getGameStatus();
    if (status.isOver) {
      if (status.result === 'white-win') return 10000;
      if (status.result === 'black-win') return -10000;
      return 0; // Draw
    }

    // Piece values
    const pieceValues = {
      'p': 1,    // Pawn
      'n': 3,    // Knight
      'b': 3,    // Bishop
      'r': 5,    // Rook
      'q': 9,    // Queen
      'k': 0     // King (handled separately)
    };

    let score = 0;
    const board = engine.getBoard();

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const value = pieceValues[piece.type] || 0;
          const pieceScore = piece.color === 'w' ? value : -value;

          // Add position bonuses
          score += pieceScore + this.getPositionBonus(piece, i, j);
        }
      }
    }

    // Add bonus for better move options
    const legalMoves = engine.getLegalMoves();
    score += legalMoves.length * 0.1;

    return score;
  }

  /**
   * Get position bonus for a piece (encourages center control, etc.)
   * @param {object} piece - Piece object
   * @param {number} row - Board row
   * @param {number} col - Board column
   * @returns {number} Position bonus
   */
  getPositionBonus(piece, row, col) {
    // Center control bonus (stronger in middle)
    const centerBonus = [
      [0.1, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.1],
      [0.2, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.2],
      [0.2, 0.3, 0.4, 0.4, 0.4, 0.4, 0.3, 0.2],
      [0.2, 0.3, 0.4, 0.5, 0.5, 0.4, 0.3, 0.2],
      [0.2, 0.3, 0.4, 0.5, 0.5, 0.4, 0.3, 0.2],
      [0.2, 0.3, 0.4, 0.4, 0.4, 0.4, 0.3, 0.2],
      [0.2, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.2],
      [0.1, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.1]
    ];

    const bonus = centerBonus[row][col];
    return piece.color === 'w' ? bonus : -bonus;
  }

  /**
   * Get a random move from available moves
   * @param {array} moves - Array of moves
   * @returns {object} Random move
   */
  getRandomMove(moves) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  /**
   * Set difficulty level
   * @param {string} difficulty - 'easy', 'medium', 'hard', or 'expert'
   */
  setDifficulty(difficulty) {
    if (['easy', 'medium', 'hard', 'expert'].includes(difficulty)) {
      this.difficulty = difficulty;
      this.maxDepth = this.getMaxDepth();
    }
  }
}

module.exports = AIEngine;
