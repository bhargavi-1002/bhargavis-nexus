const supabase = require('../utils/supabaseClient');

// Game model operations using Supabase
const GameModel = {
  // Create a new game
  async create(gameData) {
    const { players, gameType, difficulty, timeControl, theme } = gameData;
    
    // Insert game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({
        game_type: gameType,
        difficulty: difficulty || null,
        time_control: timeControl || 600,
        theme: theme || 'classic',
        status: 'ongoing',
        moves: []
      })
      .select()
      .single();
    
    if (gameError) throw gameError;

    // Insert players
    const playerInserts = players.map(player => ({
      game_id: game.id,
      user_id: player.userId,
      color: player.color,
      rating_before: player.ratingBefore || null
    }));

    const { error: playersError } = await supabase
      .from('game_players')
      .insert(playerInserts);
    
    if (playersError) throw playersError;

    return game;
  },

  // Find game by ID
  async findById(id) {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        game_players (
          user_id,
          color,
          rating_before,
          rating_after,
          users (
            id,
            username,
            rating,
            avatar
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Update game with a new move
  async addMove(gameId, move) {
    const { data: game, error: fetchError } = await supabase
      .from('games')
      .select('moves')
      .eq('id', gameId)
      .single();
    
    if (fetchError) throw fetchError;

    const updatedMoves = [...game.moves, {
      ...move,
      timestamp: new Date().toISOString()
    }];

    const { data, error } = await supabase
      .from('games')
      .update({
        moves: updatedMoves,
        updated_at: new Date().toISOString()
      })
      .eq('id', gameId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update game status and result
  async updateStatus(gameId, status, result) {
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (result) {
      updateData.result = result;
    }

    const { data, error } = await supabase
      .from('games')
      .update(updateData)
      .eq('id', gameId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update player ratings after game
  async updatePlayerRatings(gameId, ratings) {
    // ratings is an array of { userId, color, ratingAfter }
    for (const rating of ratings) {
      const { error } = await supabase
        .from('game_players')
        .update({ rating_after: rating.ratingAfter })
        .eq('game_id', gameId)
        .eq('color', rating.color);
      
      if (error) throw error;

      // Also update user's rating
      const { error: userError } = await supabase
        .from('users')
        .update({ rating: rating.ratingAfter })
        .eq('id', rating.userId);
      
      if (userError) throw userError;
    }

    return { success: true };
  },

  // Get game history for a user
  async getUserHistory(userId, limit = 20) {
    const { data, error } = await supabase
      .from('game_players')
      .select(`
        games (
          id,
          game_type,
          difficulty,
          status,
          result,
          moves,
          created_at,
          game_players (
            color,
            users (
              username,
              rating
            )
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false, foreignTable: 'games' })
      .limit(limit);
    
    if (error) throw error;
    return data.map(gp => gp.games);
  },

  // Get user statistics
  async getUserStats(userId) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('wins, losses, draws, rating')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;

    // Get game count
    const { count, error: countError } = await supabase
      .from('game_players')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (countError) throw countError;

    return {
      totalGames: count || 0,
      wins: user.wins,
      losses: user.losses,
      draws: user.draws,
      rating: user.rating
    };
  },

  // Get ongoing games for a user
  async getOngoingGames(userId) {
    const { data, error } = await supabase
      .from('game_players')
      .select(`
        games (
          id,
          game_type,
          difficulty,
          status,
          created_at,
          game_players (
            color,
            users (
              username,
              rating
            )
          )
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'ongoing', { foreignTable: 'games' });
    
    if (error) throw error;
    return data.map(gp => gp.games);
  }
};

module.exports = GameModel;
