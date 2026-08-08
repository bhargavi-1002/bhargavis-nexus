const bcrypt = require('bcryptjs');
const supabase = require('../utils/supabaseClient');

// User model operations using Supabase
const UserModel = {
  // Create a new user
  async create(userData) {
    const { username, email, password } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password: hashedPassword,
        rating: 1200,
        wins: 0,
        losses: 0,
        draws: 0
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Find user by email
  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  },

  // Find user by username
  async findByUsername(username) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Find user by ID
  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Search users by username (partial match)
  async searchByUsername(query) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, rating, avatar')
      .ilike('username', `%${query}%`)
      .limit(20);
    
    if (error) throw error;
    return data;
  },

  // Get leaderboard (top users by rating)
  async getLeaderboard(limit = 50) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, rating, wins, losses, draws, avatar')
      .order('rating', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Update user profile
  async updateProfile(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update user rating and stats
  async updateStats(id, { rating, wins, losses, draws }) {
    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (wins !== undefined) updateData.wins = wins;
    if (losses !== undefined) updateData.losses = losses;
    if (draws !== undefined) updateData.draws = draws;
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update last login
  async updateLastLogin(id) {
    const { data, error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
    return data;
  },

  // Compare password
  async comparePassword(enteredPassword, hashedPassword) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  },

  // Get user's friends
  async getFriends(userId) {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        friend_id,
        users!friends_friend_id_fkey (
          id, username, rating, avatar
        )
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data.map(f => f.users);
  },

  // Get pending friend requests
  async getPendingFriendRequests(userId) {
    const { data, error } = await supabase
      .from('friend_requests')
      .select(`
        id,
        from_user_id,
        to_user_id,
        status,
        created_at,
        users:friend_requests_from_user_id_fkey (
          id, username, rating, avatar
        )
      `)
      .eq('to_user_id', userId)
      .eq('status', 'pending');
    
    if (error) throw error;
    return data;
  },

  // Send friend request
  async sendFriendRequest(fromUserId, toUserId) {
    const { data, error } = await supabase
      .from('friend_requests')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Accept friend request
  async acceptFriendRequest(requestId) {
    // Get the request first
    const { data: request, error: fetchError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    
    if (fetchError) throw fetchError;

    // Update request status
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);
    
    if (updateError) throw updateError;

    // Create friendship entries (both directions)
    const { error: friendError1 } = await supabase
      .from('friends')
      .insert({
        user_id: request.from_user_id,
        friend_id: request.to_user_id
      });
    
    if (friendError1) throw friendError1;

    const { error: friendError2 } = await supabase
      .from('friends')
      .insert({
        user_id: request.to_user_id,
        friend_id: request.from_user_id
      });
    
    if (friendError2) throw friendError2;

    return { success: true };
  },

  // Decline friend request
  async declineFriendRequest(requestId) {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);
    
    if (error) throw error;
    return { success: true };
  },

  // Remove friend
  async removeFriend(userId, friendId) {
    const { error } = await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);
    
    if (error) throw error;
    return { success: true };
  }
};

module.exports = UserModel;
