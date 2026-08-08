const express = require('express');
const UserModel = require('../models/userModel');
const GameModel = require('../models/gameModel');
const auth = require('../middleware/auth');
const RatingCalculator = require('../utils/ratingCalculator');
const router = express.Router();

const ratingCalc = new RatingCalculator();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const stats = {
      wins: user.wins,
      losses: user.losses,
      draws: user.draws,
      totalGames: user.wins + user.losses + user.draws
    };

    const response = { ...user };
    delete response.password;
    response.stats = stats;
    response.ratingCategory = ratingCalc.getRatingCategory(user.rating);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user profile (self)
router.get('/profile/me', auth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const response = { ...user };
    delete response.password;
    response.ratingCategory = ratingCalc.getRatingCategory(user.rating);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;

    if (query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await UserModel.searchByUsername(query);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const users = await UserModel.getLeaderboard(limit);

    // Add rank and rating category
    const usersWithRank = users.map((user, index) => ({
      ...user,
      rank: index + 1,
      ratingCategory: ratingCalc.getRatingCategory(user.rating)
    }));

    res.json({
      users: usersWithRank,
      total: users.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile/update', auth, async (req, res) => {
  try {
    const { avatar, bio } = req.body;

    const user = await UserModel.updateProfile(req.user.id, { avatar, bio });
    delete user.password;

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get friend requests
router.get('/friend-requests/pending', auth, async (req, res) => {
  try {
    const pendingRequests = await UserModel.getPendingFriendRequests(req.user.id);

    res.json({
      friendRequests: pendingRequests,
      count: pendingRequests.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send friend request
router.post('/friend-request/send', auth, async (req, res) => {
  try {
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    const targetUser = await UserModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await UserModel.sendFriendRequest(req.user.id, targetUserId);

    res.json({
      message: 'Friend request sent successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept friend request
router.post('/friend-request/accept', auth, async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: 'Request ID is required' });
    }

    await UserModel.acceptFriendRequest(requestId);

    res.json({
      message: 'Friend request accepted'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Decline friend request
router.post('/friend-request/decline', auth, async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: 'Request ID is required' });
    }

    await UserModel.declineFriendRequest(requestId);

    res.json({ message: 'Friend request declined' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove friend
router.post('/friend/remove', auth, async (req, res) => {
  try {
    const { friendUserId } = req.body;

    if (!friendUserId) {
      return res.status(400).json({ message: 'Friend user ID is required' });
    }

    await UserModel.removeFriend(req.user.id, friendUserId);

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get friends list
router.get('/friends/list', auth, async (req, res) => {
  try {
    const friends = await UserModel.getFriends(req.user.id);

    const friendsWithStatus = friends.map(friend => ({
      ...friend,
      ratingCategory: ratingCalc.getRatingCategory(friend.rating)
    }));

    res.json({
      friends: friendsWithStatus,
      count: friendsWithStatus.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const stats = await GameModel.getUserStats(req.params.userId);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        rating: user.rating,
        ratingCategory: ratingCalc.getRatingCategory(user.rating),
        avatar: user.avatar,
        bio: user.bio
      },
      stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
