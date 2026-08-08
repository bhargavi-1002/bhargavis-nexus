const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    color: {
      type: String,
      enum: ['white', 'black'],
      required: true
    },
    ratingBefore: Number,
    ratingAfter: Number
  }],
  gameType: {
    type: String,
    enum: ['pvp', 'pvc'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert']
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'abandoned'],
    default: 'ongoing'
  },
  result: {
    type: String,
    enum: ['white-win', 'black-win', 'draw']
  },
  moves: [{
    from: String,
    to: String,
    promotion: String,
    timestamp: Date
  }],
  timeControl: {
    type: Number,
    default: 600 // seconds
  },
  theme: {
    type: String,
    default: 'classic'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

module.exports = mongoose.model('Game', gameSchema);
