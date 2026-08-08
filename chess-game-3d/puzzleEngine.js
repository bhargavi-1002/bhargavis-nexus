// Infinite Puzzle Generator
class PuzzleGenerator {
    constructor() {
        this.puzzleCache = [];
        this.currentPuzzleIndex = 0;
        this.themes = ['checkmate', 'fork', 'pin', 'skewer', 'zwischenzug', 'sacrifice', 'promotion', 'stalemate'];
        this.difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
    }

    generateInfinitePuzzles(count = 100) {
        const puzzles = [];
        for (let i = 0; i < count; i++) {
            puzzles.push(this.generateRandomPuzzle());
        }
        this.puzzleCache = puzzles;
        return puzzles;
    }

    generateRandomPuzzle() {
        const difficulty = this.getRandomDifficulty();
        const theme = this.getRandomTheme();
        const rating = this.getRatingByDifficulty(difficulty);
        
        return {
            id: Math.random().toString(36).substr(2, 9),
            title: `${theme.charAt(0).toUpperCase() + theme.slice(1)} Puzzle`,
            difficulty,
            theme,
            rating,
            board: this.generateRandomBoard(difficulty),
            solution: this.generateSolution(),
            hint: this.generateHint(theme),
            moveCount: Math.floor(Math.random() * 3) + 1,
            timeLimit: this.getTimeByDifficulty(difficulty)
        };
    }

    generateRandomBoard(difficulty) {
        // Generate position based on difficulty
        const baseBoard = this.createEmptyBoard();
        const pieceCount = {
            'beginner': 6,
            'intermediate': 10,
            'advanced': 14,
            'expert': 16
        }[difficulty];

        const pieces = ['K', 'Q', 'R', 'B', 'N', 'P'];
        for (let i = 0; i < pieceCount; i++) {
            const piece = pieces[Math.floor(Math.random() * pieces.length)];
            const row = Math.floor(Math.random() * 8);
            const col = Math.floor(Math.random() * 8);
            if (baseBoard[row][col] === '.') {
                baseBoard[row][col] = Math.random() > 0.5 ? piece : piece.toLowerCase();
            }
        }
        return baseBoard;
    }

    createEmptyBoard() {
        return Array(8).fill(null).map(() => Array(8).fill('.'));
    }

    generateSolution() {
        return { from: [Math.floor(Math.random() * 8), Math.floor(Math.random() * 8)], 
                 to: [Math.floor(Math.random() * 8), Math.floor(Math.random() * 8)] };
    }

    generateHint(theme) {
        const hints = {
            'checkmate': `Look for a way to deliver checkmate by exploiting the king's position`,
            'fork': `Find a move that attacks two pieces at once`,
            'pin': `Look for a piece that is pinned to a more valuable piece`,
            'skewer': `Look for a move that forces a more valuable piece to move, exposing a less valuable one`,
            'zwischenzug': `Interpose a strong counter-threat instead of capturing immediately`,
            'sacrifice': `Sometimes sacrificing material leads to a winning position`,
            'promotion': `Your pawn is close to promotion - consider how to use this`,
            'stalemate': `Be careful not to give stalemate when you're winning`
        };
        return hints[theme] || 'Find the best move';
    }

    getRandomTheme() {
        return this.themes[Math.floor(Math.random() * this.themes.length)];
    }

    getRandomDifficulty() {
        const rand = Math.random();
        if (rand < 0.4) return 'beginner';
        if (rand < 0.7) return 'intermediate';
        if (rand < 0.9) return 'advanced';
        return 'expert';
    }

    getRatingByDifficulty(difficulty) {
        const ratings = {
            'beginner': Math.floor(Math.random() * 400) + 800,
            'intermediate': Math.floor(Math.random() * 400) + 1200,
            'advanced': Math.floor(Math.random() * 400) + 1600,
            'expert': Math.floor(Math.random() * 400) + 2000
        };
        return ratings[difficulty];
    }

    getTimeByDifficulty(difficulty) {
        const times = {
            'beginner': 300,
            'intermediate': 600,
            'advanced': 900,
            'expert': 1800
        };
        return times[difficulty];
    }

    getNextPuzzle() {
        if (this.currentPuzzleIndex >= this.puzzleCache.length - 10) {
            this.generateInfinitePuzzles(100);
            this.currentPuzzleIndex = 0;
        }
        return this.puzzleCache[this.currentPuzzleIndex++];
    }

    filterByDifficulty(difficulty) {
        if (!difficulty) return this.puzzleCache;
        return this.puzzleCache.filter(p => p.difficulty === difficulty);
    }
}

// Puzzle Engine
class PuzzleEngine {
    constructor() {
        this.currentPuzzle = null;
        this.board = null;
        this.engine = new ChessEngine();
        this.generator = new PuzzleGenerator();
        this.stats = {
            solved: 0,
            attempted: 0,
            rating: 1600
        };
    }

    loadPuzzle(puzzle) {
        this.currentPuzzle = puzzle;
        this.board = puzzle.board.map(row => [...row]);
        this.engine.board = puzzle.board.map(row => [...row]);
        this.stats.attempted++;
        return puzzle;
    }

    generateNewPuzzle(difficulty = null) {
        const puzzles = this.generator.generateInfinitePuzzles(1);
        let puzzle = puzzles[0];
        
        if (difficulty) {
            puzzle = this.generator.generateRandomPuzzle();
            while (puzzle.difficulty !== difficulty) {
                puzzle = this.generator.generateRandomPuzzle();
            }
        }
        
        return this.loadPuzzle(puzzle);
    }

    getRandomPuzzle() {
        return this.loadPuzzle(this.generator.getNextPuzzle());
    }

    validateSolution(fromRow, fromCol, toRow, toCol) {
        const isCorrect = this.currentPuzzle.solution.from[0] === fromRow &&
                         this.currentPuzzle.solution.from[1] === fromCol &&
                         this.currentPuzzle.solution.to[0] === toRow &&
                         this.currentPuzzle.solution.to[1] === toCol;
        
        if (isCorrect) {
            this.stats.solved++;
            this.updateRating(true);
        } else {
            this.updateRating(false);
        }
        
        return isCorrect;
    }

    updateRating(solved) {
        const change = solved ? 8 : -4;
        this.stats.rating += change;
        this.stats.rating = Math.max(800, this.stats.rating);
    }

    getStats() {
        return {
            ...this.stats,
            successRate: ((this.stats.solved / Math.max(1, this.stats.attempted)) * 100).toFixed(1)
        };
    }
}
