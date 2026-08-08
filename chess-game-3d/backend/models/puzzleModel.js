const supabase = require('../utils/supabaseClient');

// Puzzle model operations using Supabase
const PuzzleModel = {
  // Create a new puzzle
  async create(puzzleData) {
    const { fen, theme, difficulty, solution, explanation, isDaily } = puzzleData;
    
    const { data, error } = await supabase
      .from('puzzles')
      .insert({
        fen,
        theme,
        difficulty,
        solution,
        explanation,
        rating: 1500,
        attempts: 0,
        successes: 0,
        is_daily: isDaily || false,
        date: isDaily ? new Date().toISOString().split('T')[0] : null
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Find puzzle by ID
  async findById(id) {
    const { data, error } = await supabase
      .from('puzzles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get daily puzzle
  async getDaily() {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('puzzles')
      .select('*')
      .eq('is_daily', true)
      .eq('date', today)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get puzzles by difficulty
  async getByDifficulty(difficulty, limit = 10) {
    const { data, error } = await supabase
      .from('puzzles')
      .select('*')
      .eq('difficulty', difficulty)
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get puzzles by theme
  async getByTheme(theme, limit = 10) {
    const { data, error } = await supabase
      .from('puzzles')
      .select('*')
      .ilike('theme', `%${theme}%`)
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get puzzles matched by user rating
  async getMatchedByRating(userRating, limit = 5) {
    const minRating = userRating - 100;
    const maxRating = userRating + 100;
    
    const { data, error } = await supabase
      .from('puzzles')
      .select('*')
      .gte('rating', minRating)
      .lte('rating', maxRating)
      .eq('is_daily', false)
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Submit puzzle solution
  async submitSolution(puzzleId, userId, userMoves) {
    // Get puzzle
    const { data: puzzle, error: puzzleError } = await supabase
      .from('puzzles')
      .select('*')
      .eq('id', puzzleId)
      .single();
    
    if (puzzleError) throw puzzleError;

    // Check if solution matches
    const correct = JSON.stringify(userMoves) === JSON.stringify(puzzle.solution);
    
    // Calculate rating change
    let ratingChange = 0;
    if (correct) {
      ratingChange = Math.round(20 * (1 - (puzzle.successes / (puzzle.attempts || 1))));
      ratingChange = Math.max(5, Math.min(30, ratingChange));
    } else {
      ratingChange = -5;
    }

    // Record attempt
    const { error: attemptError } = await supabase
      .from('puzzle_attempts')
      .insert({
        user_id: userId,
        puzzle_id: puzzleId,
        correct,
        rating_change: ratingChange
      });
    
    if (attemptError) throw attemptError;

    // Update puzzle stats
    const { error: updateError } = await supabase
      .from('puzzles')
      .update({
        attempts: puzzle.attempts + 1,
        successes: correct ? puzzle.successes + 1 : puzzle.successes,
        rating: correct ? puzzle.rating + ratingChange : puzzle.rating - Math.abs(ratingChange)
      })
      .eq('id', puzzleId);
    
    if (updateError) throw updateError;

    return {
      correct,
      ratingChange,
      explanation: puzzle.explanation
    };
  },

  // Get puzzle hint
  async getHint(puzzleId) {
    const { data, error } = await supabase
      .from('puzzles')
      .select('solution, explanation')
      .eq('id', puzzleId)
      .single();
    
    if (error) throw error;

    // Return first move as hint
    const hint = data.solution[0];
    return {
      hint,
      explanation: data.explanation
    };
  },

  // Get puzzle statistics overview
  async getStatsOverview() {
    const { data, error } = await supabase
      .from('puzzles')
      .select('difficulty, attempts, successes');
    
    if (error) throw error;

    const stats = {
      total: data.length,
      byDifficulty: {
        easy: { total: 0, attempts: 0, successes: 0 },
        medium: { total: 0, attempts: 0, successes: 0 },
        hard: { total: 0, attempts: 0, successes: 0 },
        expert: { total: 0, attempts: 0, successes: 0 }
      }
    };

    data.forEach(puzzle => {
      const diff = puzzle.difficulty;
      if (stats.byDifficulty[diff]) {
        stats.byDifficulty[diff].total++;
        stats.byDifficulty[diff].attempts += puzzle.attempts || 0;
        stats.byDifficulty[diff].successes += puzzle.successes || 0;
      }
    });

    return stats;
  },

  // Get user puzzle attempts
  async getUserAttempts(userId, limit = 20) {
    const { data, error } = await supabase
      .from('puzzle_attempts')
      .select(`
        *,
        puzzles (
          id,
          fen,
          theme,
          difficulty
        )
      `)
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
};

module.exports = PuzzleModel;
