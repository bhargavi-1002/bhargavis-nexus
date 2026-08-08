const { Chess } = require('chess.js');

/**
 * Chess Engine Utility
 * Handles move validation, game state, and AI logic
 */

class ChessEngine {
  constructor(fen = null) {
    this.game = new Chess(fen);
  }

  /**
   * Validate and make a move
   * @param {string} from - From square (e.g., 'e2')
   * @param {string} to - To square (e.g., 'e4')
   * @param {string} promotion - Promotion piece if pawn promotion
   * @returns {object} Move result with validation status
   */
  makeMove(from, to, promotion = null) {
    try {
      const moveObj = {
        from,
        to
      };

      if (promotion) {
        moveObj.promotion = promotion;
      }

      const move = this.game.move(moveObj, { sloppy: true });

      if (!move) {
        return {
          success: false,
          error: 'Invalid move',
          move: null
        };
      }

      return {
        success: true,
        move,
        fen: this.game.fen(),
        inCheck: this.game.in_check(),
        inCheckmate: this.game.in_checkmate(),
        inStalemate: this.game.in_stalemate()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        move: null
      };
    }
  }

  /**
   * Get all legal moves for current position
   * @returns {array} Array of legal moves
   */
  getLegalMoves() {
    return this.game.moves({ verbose: true });
  }

  /**
   * Get legal moves for a specific square
   * @param {string} square - Square to get moves for
   * @returns {array} Array of legal moves from that square
   */
  getMovesForSquare(square) {
    const moves = this.game.moves({ square, verbose: true });
    return moves;
  }

  /**
   * Check if game is over and get result
   * @returns {object} Game status
   */
  getGameStatus() {
    if (this.game.game_over()) {
      let result = 'draw';
      if (this.game.in_checkmate()) {
        result = this.game.turn() === 'w' ? 'black-win' : 'white-win';
      }
      return {
        isOver: true,
        result,
        reason: this.getGameEndReason()
      };
    }

    return {
      isOver: false,
      result: null,
      reason: null
    };
  }

  /**
   * Get reason for game end
   * @returns {string} Reason string
   */
  getGameEndReason() {
    if (this.game.in_checkmate()) return 'checkmate';
    if (this.game.in_stalemate()) return 'stalemate';
    if (this.game.in_draw()) return 'draw';
    if (this.game.in_threefold_repetition()) return 'threefold repetition';
    if (this.game.insufficient_material()) return 'insufficient material';
    return 'game over';
  }

  /**
   * Get current board state
   * @returns {array} 2D array representing the board
   */
  getBoard() {
    return this.game.board();
  }

  /**
   * Get game FEN
   * @returns {string} Current FEN string
   */
  getFen() {
    return this.game.fen();
  }

  /**
   * Get whose turn it is
   * @returns {string} 'w' for white, 'b' for black
   */
  getTurn() {
    return this.game.turn();
  }

  /**
   * Load a FEN position
   * @param {string} fen - FEN string
   * @returns {boolean} Success status
   */
  loadFen(fen) {
    try {
      this.game.load(fen);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Reset the game
   */
  reset() {
    this.game.reset();
  }

  /**
   * Get move history
   * @returns {array} Array of all moves made
   */
  getMoveHistory() {
    return this.game.moves({ verbose: true });
  }

  /**
   * Undo last move
   * @returns {object} The undone move or null
   */
  undoMove() {
    return this.game.undo();
  }
}

module.exports = ChessEngine;
