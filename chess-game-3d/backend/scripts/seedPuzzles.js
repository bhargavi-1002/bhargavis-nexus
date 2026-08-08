/**
 * Puzzle Seeding Script
 * Seeds database with initial chess puzzles
 * Usage: node scripts/seedPuzzles.js
 */

const mongoose = require('mongoose');
const Puzzle = require('../models/Puzzle');

const puzzleData = [
  // Easy puzzles
  {
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    theme: 'Opening Trap',
    difficulty: 'easy',
    solution: [{ from: 'e7', to: 'e5' }],
    explanation: 'Basic opening response to 1.e4'
  },
  {
    fen: '8/8/8/3k4/8/3K4/8/R7 w - - 0 1',
    theme: 'Endgame - Rook',
    difficulty: 'easy',
    solution: [{ from: 'a1', to: 'a5' }],
    explanation: 'Rook endgame: Activate the rook by giving checks'
  },
  {
    fen: '7k/5Q2/6K1/8/8/8/8/8 w - - 0 1',
    theme: 'Back Rank Mate',
    difficulty: 'easy',
    solution: [{ from: 'f7', to: 'h8' }],
    explanation: 'Queen delivers back rank checkmate'
  },
  {
    fen: '6rk/5ppb/4p1np/3pP3/1p1P1PPq/1P2QN1P/5RK1/4B2R b - - 0 1',
    theme: 'Tactical Shot',
    difficulty: 'easy',
    solution: [{ from: 'h4', to: 'h3' }],
    explanation: 'Discovered attack and queen threat'
  },

  // Medium puzzles
  {
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    theme: 'Classic Opening Trap',
    difficulty: 'medium',
    solution: [{ from: 'b5', to: 'e5' }],
    explanation: 'Fried Liver Attack: sacrifice for strong initiative'
  },
  {
    fen: '6k1/5pp1/2b5/2p5/3P4/1P1K1P2/2r1P3/6R1 b - - 0 1',
    theme: 'Rook Endgame',
    difficulty: 'medium',
    solution: [{ from: 'c2', to: 'c1' }],
    explanation: 'Activate the rook for winning chances'
  },
  {
    fen: '3r2k1/5pp1/p1p5/1p2p1Pq/2P1P2P/3Q1NP1/5RK1/3R4 w - - 1 1',
    theme: 'Queen and Rook Attack',
    difficulty: 'medium',
    solution: [{ from: 'd3', to: 'd8' }],
    explanation: 'Rook sacrifice to open lines for queen'
  },

  // Hard puzzles
  {
    fen: '3r1rk1/pp1bppbp/2np1np1/q3P3/2BNP3/2N3P1/PPP1Q1BP/2KR3R w - - 1 1',
    theme: 'Sacrificial Attack',
    difficulty: 'hard',
    solution: [{ from: 'c4', to: 'f7' }],
    explanation: 'Bishop sacrifice breaks through black\'s kingside'
  },
  {
    fen: '3r2k1/pb1q1pp1/1p3n1p/2pP4/2P1P3/6PK/PPQ2RBP/3R4 w - - 1 1',
    theme: 'Quiet Move',
    difficulty: 'hard',
    solution: [{ from: 'f2', to: 'f8' }],
    explanation: 'Rook move creates unstoppable threat'
  },

  // Expert puzzles
  {
    fen: 'r1bqk2r/pp2bppp/2np1n2/3pp3/2BPP3/2N1BP2/PPP2PPP/R2QK1NR w KQkq - 0 1',
    theme: 'Gambit Acceptance',
    difficulty: 'expert',
    solution: [{ from: 'd4', to: 'e5' }, { from: 'c3', to: 'e4' }],
    explanation: 'Complex positional decision in gambit line'
  },
  {
    fen: '4r1k1/5pp1/3b1n1p/1p1Pp1P1/2P1P3/2N4P/5RPK/3R4 b - - 0 1',
    theme: 'Perpetual Check',
    difficulty: 'expert',
    solution: [{ from: 'e4', to: 'e3' }],
    explanation: 'Forcing sequence leads to perpetual check'
  }
];

async function seedPuzzles() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chess-game';
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing puzzles (optional)
    // await Puzzle.deleteMany({});

    // Insert puzzles
    const created = await Puzzle.insertMany(puzzleData.map(p => ({
      ...p,
      rating: p.difficulty === 'easy' ? 1000 : p.difficulty === 'medium' ? 1400 : p.difficulty === 'hard' ? 1800 : 2200,
      attempts: 0,
      successes: 0,
      isDaily: false
    })));

    console.log(`✅ Seeded ${created.length} puzzles`);
    
    // Set one as daily
    const dailyPuzzle = await Puzzle.findOneAndUpdate(
      {},
      { isDaily: true, date: new Date() },
      { sort: { _id: -1 } }
    );

    console.log(`✅ Set daily puzzle: ${dailyPuzzle._id}`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding puzzles:', error);
    process.exit(1);
  }
}

seedPuzzles();
