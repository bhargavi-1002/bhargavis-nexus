class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'friend'; // 'friend' or 'ai'
        this.aiDifficulty = 'medium';
        this.scores = {
            X: 0,
            O: 0,
            draw: 0
        };
        this.winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadScores();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Cell click handlers
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e.target));
        });

        // Mode selector
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.target.dataset.mode));
        });

        // Restart buttons
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('mainRestartBtn').addEventListener('click', () => this.restart());

        // Difficulty selector
        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.aiDifficulty = e.target.value;
        });
    }

    switchMode(mode) {
        this.gameMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        const diffContainer = document.getElementById('difficultyContainer');
        if (mode === 'ai') {
            diffContainer.style.display = 'flex';
        } else {
            diffContainer.style.display = 'none';
        }

        this.restart();
    }

    handleCellClick(cell) {
        if (!this.gameActive) return;

        const index = parseInt(cell.dataset.index);
        if (this.board[index] !== '') return;

        // Player move
        this.makeMove(index, 'X');
        this.updateDisplay();

        if (!this.gameActive) return;

        // AI move (if applicable)
        if (this.gameMode === 'ai' && this.currentPlayer === 'O') {
            setTimeout(() => this.aiMove(), 500);
        }
    }

    makeMove(index, player) {
        this.board[index] = player;

        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add('taken', player.toLowerCase());

        const winner = this.checkWinner();
        if (winner) {
            this.endGame(`🎉 Player ${winner} Wins!`, `Congratulations!`);
            this.scores[winner]++;
        } else if (this.board.every(cell => cell !== '')) {
            this.endGame('🤝 It\'s a Draw!', 'Game ended in a draw');
            this.scores.draw++;
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }

        this.saveScores();
    }

    aiMove() {
        let availableMoves = this.board
            .map((cell, index) => (cell === '' ? index : null))
            .filter(index => index !== null);

        if (availableMoves.length === 0) return;

        let move;
        
        if (this.aiDifficulty === 'easy') {
            move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        } else if (this.aiDifficulty === 'medium') {
            move = this.getMediumAIMove(availableMoves);
        } else {
            move = this.getHardAIMove(availableMoves);
        }

        this.makeMove(move, 'O');
        this.updateDisplay();
    }

    getMediumAIMove(availableMoves) {
        // Try to win
        for (let move of availableMoves) {
            this.board[move] = 'O';
            if (this.checkWinner() === 'O') {
                this.board[move] = '';
                return move;
            }
            this.board[move] = '';
        }

        // Try to block player
        for (let move of availableMoves) {
            this.board[move] = 'X';
            if (this.checkWinner() === 'X') {
                this.board[move] = '';
                return move;
            }
            this.board[move] = '';
        }

        // Take center if available
        if (availableMoves.includes(4)) return 4;

        // Take corners
        const corners = [0, 2, 6, 8].filter(i => availableMoves.includes(i));
        if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

        // Take any available
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    getHardAIMove(availableMoves) {
        // Minimax algorithm for unbeatable AI
        let bestScore = -Infinity;
        let bestMove = availableMoves[0];

        for (let move of availableMoves) {
            this.board[move] = 'O';
            const score = this.minimax(this.board, 0, false);
            this.board[move] = '';

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        const winner = this.checkWinnerForBoard(board);
        
        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return depth - 10;
        if (board.every(cell => cell !== '')) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    const score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    const score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    checkWinner() {
        return this.checkWinnerForBoard(this.board);
    }

    checkWinnerForBoard(board) {
        for (let combo of this.winningCombinations) {
            const [a, b, c] = combo;
            if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
                // Highlight winning cells
                if (board === this.board) {
                    document.querySelectorAll(`[data-index="${a}"], [data-index="${b}"], [data-index="${c}"]`)
                        .forEach(cell => cell.classList.add('winner'));
                }
                return board[a];
            }
        }
        return null;
    }

    endGame(message, details) {
        this.gameActive = false;
        const gameOverDiv = document.getElementById('gameOver');
        document.getElementById('gameOverMessage').textContent = message;
        document.getElementById('gameOverDetails').textContent = details;
        gameOverDiv.style.display = 'flex';
    }

    restart() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;

        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('taken', 'x', 'o', 'winner');
        });

        document.getElementById('gameOver').style.display = 'none';
        this.updateDisplay();
    }

    updateDisplay() {
        document.getElementById('currentPlayer').textContent = this.currentPlayer;
        document.getElementById('scoreX').textContent = this.scores.X;
        document.getElementById('scoreO').textContent = this.scores.O;
        document.getElementById('scoreDraw').textContent = this.scores.draw;
    }

    saveScores() {
        localStorage.setItem('tictactoe_scores', JSON.stringify(this.scores));
    }

    loadScores() {
        const saved = localStorage.getItem('tictactoe_scores');
        if (saved) {
            this.scores = JSON.parse(saved);
        }
        this.updateDisplay();
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
