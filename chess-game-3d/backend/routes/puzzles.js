const express = require('express');
const PuzzleModel = require('../models/puzzleModel');
const UserModel = require('../models/userModel');
const auth = require('../middleware/auth');
const ChessEngine = require('../utils/chessEngine');
const router = express.Router();

// Get daily puzzle
router.get('/daily', async (req, res) => {
  try {
    const puzzle = await PuzzleModel.getDaily();

    if (!puzzle) {
      return res.status(404).json({ message: 'No daily puzzle available today' });
    }

    // Return puzzle without solution
    const puzzleData = { ...puzzle };
    delete puzzleData.solution;

    res.json({
      puzzle: puzzleData,
      message: 'Daily puzzle loaded'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get puzzles by difficulty
router.get('/by-difficulty/:difficulty', async (req, res) => {
  try {
    const { difficulty } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    if (!['easy', 'medium', 'hard', 'expert'].includes(difficulty)) {
      return res.status(400).json({ message: 'Invalid difficulty level' });
    }

    const puzzles = await PuzzleModel.getByDifficulty(difficulty, limit);

    res.json({
      puzzles,
      difficulty,
      limit,
      total: puzzles.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get puzzles by theme
router.get('/by-theme/:theme', async (req, res) => {
  try {
    const { theme } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const puzzles = await PuzzleModel.getByTheme(theme, limit);

    res.json({
      puzzles,
      theme,
      count: puzzles.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get puzzles matched to user rating
router.get('/matched/byrating', auth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const limit = parseInt(req.query.limit) || 10;

    const puzzles = await PuzzleModel.getMatchedByRating(user.rating, limit);

    res.json({
      puzzles,
      userRating: user.rating,
      count: puzzles.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get specific puzzle
router.get('/:id', async (req, res) => {
  try {
    const puzzle = await PuzzleModel.findById(req.params.id);

    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    // Don't send solution
    const puzzleData = { ...puzzle };
    delete puzzleData.solution;

    res.json(puzzleData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get puzzle solution (after attempting)
router.get('/:id/solution', auth, async (req, res) => {
  try {
    const puzzle = await PuzzleModel.findById(req.params.id);

    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    res.json({
      solution: puzzle.solution,
      explanation: puzzle.explanation,
      successRate: puzzle.attempts > 0 ? (puzzle.successes / puzzle.attempts * 100).toFixed(2) + '%' : 'N/A'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit puzzle solution
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { moves } = req.body;
    const puzzle = await PuzzleModel.findById(req.params.id);
    const user = await UserModel.findById(req.user.id);

    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!moves || !Array.isArray(moves)) {
      return res.status(400).json({ message: 'Invalid moves format' });
    }

    // Use PuzzleModel to submit solution
    const result = await PuzzleModel.submitSolution(req.params.id, req.user.id, moves);

    // Update user rating if correct
    if (result.correct) {
      await UserModel.updateStats(user.id, { rating: user.rating + result.ratingChange });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Hint system - give next move
router.get('/:id/hint', auth, async (req, res) => {
  try {
    const hintData = await PuzzleModel.getHint(req.params.id);

    if (!hintData) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    res.json(hintData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get puzzle statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await PuzzleModel.getStatsOverview();

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search puzzles
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const limit = parseInt(req.query.limit) || 10;

    const puzzles = await PuzzleModel.getByTheme(query, limit);

    res.json({
      puzzles,
      query,
      count: puzzles.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
