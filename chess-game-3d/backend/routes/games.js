const express = require('express');
const GameModel = require('../models/gameModel');
const UserModel = require('../models/userModel');
const auth = require('../middleware/auth');
const GameStateManager = require('../utils/gameStateManager');
const RatingCalculator = require('../utils/ratingCalculator');
const router = express.Router();

const ratingCalc = new RatingCalculator();

// Create new game
router.post('/create', auth, async (req, res) => {
  try {
    const { gameType, difficulty, timeControl, theme, opponentId } = req.body;

    // Validation
    if (!gameType || !['pvp', 'pvc'].includes(gameType)) {
      return res.status(400).json({ message: 'Invalid game type' });
    }

    if (gameType === 'pvc' && !['easy', 'medium', 'hard', 'expert'].includes(difficulty)) {
      return res.status(400).json({ message: 'Invalid difficulty level' });
    }

    const currentUser = await UserModel.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const players = [{
      userId: req.user.id,
      color: 'white',
      ratingBefore: currentUser.rating
    }];

    // Handle PvP games
    if (gameType === 'pvp' && opponentId) {
      const opponent = await UserModel.findById(opponentId);
      if (!opponent) {
        return res.status(404).json({ message: 'Opponent not found' });
      }

      players.push({
        userId: opponentId,
        color: 'black',
        ratingBefore: opponent.rating
      });
    }

    // Handle PvC games
    if (gameType === 'pvc') {
      // AI player
      players.push({
        userId: null, // Placeholder for AI
        color: 'black',
        ratingBefore: getAIDifficulty(difficulty)
      });
    }

    const game = await GameModel.create({
      players,
      gameType,
      difficulty,
      timeControl: timeControl || 600,
      theme: theme || 'classic'
    });

    res.status(201).json({
      message: 'Game created successfully',
      game
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get game details
router.get('/:id', async (req, res) => {
  try {
    const game = await GameModel.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Initialize game state manager to get legal moves and board state
    const gameState = new GameStateManager(game);

    res.json({
      game,
      board: gameState.getBoard(),
      legalMoves: gameState.getLegalMoves(),
      fen: gameState.getFen(),
      turn: gameState.getTurn(),
      gameStatus: gameState.getGameStatus()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Make a move
router.post('/:id/move', auth, async (req, res) => {
  try {
    const { from, to, promotion } = req.body;

    if (!from || !to) {
      return res.status(400).json({ message: 'Invalid move format' });
    }

    const game = await GameModel.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.status !== 'ongoing') {
      return res.status(400).json({ message: 'Game is not in progress' });
    }

    // Initialize game state manager
    const gameState = new GameStateManager(game);

    // Make the move
    const moveResult = gameState.makeMove(from, to, promotion, req.user.id);

    if (!moveResult.success) {
      return res.status(400).json({
        message: 'Invalid move',
        error: moveResult.error
      });
    }

    // Update game with new move
    await GameModel.addMove(req.params.id, { from, to, promotion });

    // Check if game ended
    if (moveResult.gameStatus.isOver) {
      await GameModel.updateStatus(req.params.id, 'completed', moveResult.gameStatus.result);

      // Update ratings for completed game
      if (game.game_type === 'pvp' && game.game_players.length === 2) {
        const ratingChanges = ratingCalc.calculateNewRatings(
          game.game_players[0].rating_before,
          game.game_players[1].rating_before,
          moveResult.gameStatus.result
        );

        const ratings = [
          { userId: game.game_players[0].user_id, color: 'white', ratingAfter: ratingChanges.whiteNewRating },
          { userId: game.game_players[1].user_id, color: 'black', ratingAfter: ratingChanges.blackNewRating }
        ];

        await GameModel.updatePlayerRatings(req.params.id, ratings);

        // Update user stats
        const whiteUser = await UserModel.findById(game.game_players[0].user_id);
        const blackUser = await UserModel.findById(game.game_players[1].user_id);

        if (moveResult.gameStatus.result === 'white-win') {
          await UserModel.updateStats(whiteUser.id, { wins: whiteUser.wins + 1 });
          await UserModel.updateStats(blackUser.id, { losses: blackUser.losses + 1 });
        } else if (moveResult.gameStatus.result === 'black-win') {
          await UserModel.updateStats(blackUser.id, { wins: blackUser.wins + 1 });
          await UserModel.updateStats(whiteUser.id, { losses: whiteUser.losses + 1 });
        } else {
          await UserModel.updateStats(whiteUser.id, { draws: whiteUser.draws + 1 });
          await UserModel.updateStats(blackUser.id, { draws: blackUser.draws + 1 });
        }
      }
    }

    // Get updated game
    const updatedGame = await GameModel.findById(req.params.id);

    // Get AI move if PvC game and it's AI's turn
    let aiMove = null;
    if (updatedGame.game_type === 'pvc' && !moveResult.gameStatus.isOver) {
      const freshGameState = new GameStateManager(updatedGame);
      const aiEngine = gameState.ai;
      aiMove = {
        from: aiEngine.getBestMove(freshGameState.engine).from,
        to: aiEngine.getBestMove(freshGameState.engine).to
      };
    }

    res.json({
      message: 'Move made successfully',
      moveResult,
      game: updatedGame,
      aiMove
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get legal moves for a square
router.get('/:id/legal-moves/:square', async (req, res) => {
  try {
    const game = await GameModel.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const gameState = new GameStateManager(game);
    const legalMoves = gameState.getMovesForSquare(req.params.square);

    res.json({
      square: req.params.square,
      legalMoves
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// End game manually
router.post('/:id/end', auth, async (req, res) => {
  try {
    const { result } = req.body;

    if (!result || !['white-win', 'black-win', 'draw'].includes(result)) {
      return res.status(400).json({ message: 'Invalid game result' });
    }

    const game = await GameModel.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.status !== 'ongoing') {
      return res.status(400).json({ message: 'Game is already completed' });
    }

    await GameModel.updateStatus(req.params.id, 'completed', result);

    // Calculate and update ratings
    if (game.game_type === 'pvp' && game.game_players.length === 2) {
      const ratingChanges = ratingCalc.calculateNewRatings(
        game.game_players[0].rating_before,
        game.game_players[1].rating_before,
        result
      );

      const ratings = [
        { userId: game.game_players[0].user_id, color: 'white', ratingAfter: ratingChanges.whiteNewRating },
        { userId: game.game_players[1].user_id, color: 'black', ratingAfter: ratingChanges.blackNewRating }
      ];

      await GameModel.updatePlayerRatings(req.params.id, ratings);

      // Update users
      const whiteUser = await UserModel.findById(game.game_players[0].user_id);
      const blackUser = await UserModel.findById(game.game_players[1].user_id);

      if (result === 'white-win') {
        await UserModel.updateStats(whiteUser.id, { wins: whiteUser.wins + 1 });
        await UserModel.updateStats(blackUser.id, { losses: blackUser.losses + 1 });
      } else if (result === 'black-win') {
        await UserModel.updateStats(blackUser.id, { wins: blackUser.wins + 1 });
        await UserModel.updateStats(whiteUser.id, { losses: whiteUser.losses + 1 });
      } else {
        await UserModel.updateStats(whiteUser.id, { draws: whiteUser.draws + 1 });
        await UserModel.updateStats(blackUser.id, { draws: blackUser.draws + 1 });
      }
    }

    const updatedGame = await GameModel.findById(req.params.id);

    res.json({
      message: 'Game ended successfully',
      game: updatedGame
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's game history
router.get('/history/:userId', async (req, res) => {
  try {
    const games = await GameModel.getUserHistory(req.params.userId);

    if (games.length === 0) {
      return res.json({ message: 'No games found', games: [] });
    }

    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get game statistics for user
router.get('/stats/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const stats = await UserModel.getUserStats(userId);
    const user = await UserModel.findById(userId);

    res.json({
      stats,
      currentRating: user.rating,
      ratingCategory: ratingCalc.getRatingCategory(user.rating)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get AI difficulty rating (estimated rating)
 * Based on difficulty level
 */
function getAIDifficulty(difficulty) {
  const difficultyRatings = {
    'easy': 1200,
    'medium': 1600,
    'hard': 2000,
    'expert': 2400
  };
  return difficultyRatings[difficulty] || 1200;
}

module.exports = router;
