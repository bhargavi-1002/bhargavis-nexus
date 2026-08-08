const ChessEngine = require('./chessEngine');
const AIEngine = require('./aiEngine');
const RatingCalculator = require('./ratingCalculator');

/**
 * Game State Manager
 * Handles game logic, move validation, and state updates
 */

class GameStateManager {
  constructor(gameData = {}) {
    this.gameId = gameData._id || null;
    this.gameType = gameData.gameType || 'pvp';
    this.difficulty = gameData.difficulty || 'medium';
    this.players = gameData.players || [];
    this.moves = gameData.moves || [];
    this.status = gameData.status || 'ongoing';
    this.result = gameData.result || null;
    this.theme = gameData.theme || 'classic';
    this.timeControl = gameData.timeControl || 600; // in seconds

    // Initialize chess engine
    this.engine = new ChessEngine();

    // Initialize AI if PvC game
    if (this.gameType === 'pvc') {
      this.ai = new AIEngine(this.difficulty);
    }

    // Rating calculator
    this.ratingCalc = new RatingCalculator();

    // Replay moves to get current state
    this.replayMoves();
  }

  /**
   * Replay all moves to restore game state
   */
  replayMoves() {
    this.engine.reset();
    for (const move of this.moves) {
      this.engine.makeMove(move.from, move.to, move.promotion);
    }
  }

  /**
   * Make a move and validate it
   * @param {string} from - From square
   * @param {string} to - To square
   * @param {string} promotion - Promotion piece if applicable
   * @param {string} playerId - ID of player making the move
   * @returns {object} Move result
   */
  makeMove(from, to, promotion = null, playerId = null) {
    // Validate it's the player's turn
    if (this.gameType === 'pvp' && playerId) {
      const currentTurn = this.engine.getTurn();
      const expectedColor = this.players[0]._id === playerId ? 'w' : 'b';

      if (currentTurn !== expectedColor) {
        return {
          success: false,
          error: 'Not your turn',
          move: null
        };
      }
    }

    // Make the move
    const moveResult = this.engine.makeMove(from, to, promotion);

    if (!moveResult.success) {
      return moveResult;
    }

    // Add move to history
    this.moves.push({
      from,
      to,
      promotion: promotion || null,
      timestamp: new Date(),
      playerId
    });

    // Check game status
    const gameStatus = this.engine.getGameStatus();
    if (gameStatus.isOver) {
      this.status = 'completed';
      this.result = gameStatus.result;
    }

    return {
      success: true,
      move: moveResult.move,
      fen: this.engine.getFen(),
      gameStatus,
      moveCount: this.moves.length
    };
  }

  /**
   * Get AI's move (for PvC games)
   * @returns {object} AI move
   */
  getAIMove() {
    if (this.gameType !== 'pvc') {
      return {
        success: false,
        error: 'Not a PvC game'
      };
    }

    const move = this.ai.getBestMove(this.engine);

    if (!move) {
      return {
        success: false,
        error: 'No legal moves available'
      };
    }

    return {
      success: true,
      from: move.from,
      to: move.to,
      promotion: move.promotion || null
    };
  }

  /**
   * Get current board state
   * @returns {array} Board representation
   */
  getBoard() {
    return this.engine.getBoard();
  }

  /**
   * Get all legal moves
   * @returns {array} Legal moves
   */
  getLegalMoves() {
    return this.engine.getLegalMoves();
  }

  /**
   * Get legal moves for a square
   * @param {string} square - Square notation
   * @returns {array} Legal moves from that square
   */
  getMovesForSquare(square) {
    return this.engine.getMovesForSquare(square);
  }

  /**
   * Get current game FEN
   * @returns {string} FEN notation
   */
  getFen() {
    return this.engine.getFen();
  }

  /**
   * Get whose turn it is
   * @returns {string} 'w' or 'b'
   */
  getTurn() {
    return this.engine.getTurn();
  }

  /**
   * Get game status (check if game is over)
   * @returns {object} Game status
   */
  getGameStatus() {
    return this.engine.getGameStatus();
  }

  /**
   * End the game and calculate ratings
   * @param {string} result - 'white-win', 'black-win', or 'draw'
   * @returns {object} Updated player ratings
   */
  endGame(result = null) {
    if (!result) {
      const status = this.engine.getGameStatus();
      result = status.result || 'draw';
    }

    this.status = 'completed';
    this.result = result;

    // Calculate new ratings if PvP
    if (this.gameType === 'pvp' && this.players.length === 2) {
      const ratingChanges = this.ratingCalc.calculateNewRatings(
        this.players[0].ratingBefore,
        this.players[1].ratingBefore,
        result
      );

      this.players[0].ratingAfter = ratingChanges.whiteNewRating;
      this.players[1].ratingAfter = ratingChanges.blackNewRating;

      return ratingChanges;
    }

    return { success: true };
  }

  /**
   * Get move history
   * @returns {array} All moves
   */
  getMoveHistory() {
    return this.moves;
  }

  /**
   * Get game state as object
   * @returns {object} Complete game state
   */
  getState() {
    return {
      gameId: this.gameId,
      gameType: this.gameType,
      difficulty: this.difficulty,
      players: this.players,
      moves: this.moves,
      status: this.status,
      result: this.result,
      theme: this.theme,
      timeControl: this.timeControl,
      fen: this.getFen(),
      turn: this.getTurn(),
      legalMoves: this.getLegalMoves().length,
      gameStatus: this.getGameStatus()
    };
  }

  /**
   * Undo last move (useful for offline games)
   * @returns {object} The undone move
   */
  undoMove() {
    if (this.moves.length === 0) {
      return null;
    }

    const lastMove = this.moves.pop();
    this.engine.undoMove();
    this.status = 'ongoing'; // Reset status when undoing
    this.result = null;

    return lastMove;
  }

  /**
   * Load a game from FEN (useful for analysis)
   * @param {string} fen - FEN string
   * @returns {boolean} Success status
   */
  loadFen(fen) {
    return this.engine.loadFen(fen);
  }

  /**
   * Reset the game
   */
  reset() {
    this.engine.reset();
    this.moves = [];
    this.status = 'ongoing';
    this.result = null;
  }

  /**
   * Get game statistics
   * @returns {object} Game stats
   */
  getStatistics() {
    const stats = {
      totalMoves: this.moves.length,
      gameType: this.gameType,
      difficulty: this.difficulty,
      timeControl: this.timeControl,
      status: this.status,
      result: this.result
    };

    if (this.gameType === 'pvp' && this.players.length === 2) {
      stats.whitePlayer = {
        id: this.players[0].userId,
        color: 'white',
        ratingBefore: this.players[0].ratingBefore,
        ratingAfter: this.players[0].ratingAfter
      };

      stats.blackPlayer = {
        id: this.players[1].userId,
        color: 'black',
        ratingBefore: this.players[1].ratingBefore,
        ratingAfter: this.players[1].ratingAfter
      };
    }

    return stats;
  }
}

module.exports = GameStateManager;
