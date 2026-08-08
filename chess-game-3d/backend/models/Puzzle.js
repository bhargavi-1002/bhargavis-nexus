const mongoose = require('mongoose');

const puzzleSchema = new mongoose.Schema({
  fen: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: true
  },
  solution: [{
    from: String,
    to: String,
    promotion: String
  }],
  explanation: String,
  rating: {
    type: Number,
    default: 1500
  },
  attempts: {
    type: Number,
    default: 0
  },
  successes: {
    type: Number,
    default: 0
  },
  isDaily: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Puzzle', puzzleSchema);
