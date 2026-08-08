// Main Application
const pieces = {
    'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔',
    'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚'
};

class ChessApp {
    constructor() {
        this.currentSection = 'playSection';
        this.gameManager = new GameManager();
        this.puzzleEngine = new PuzzleEngine();
        this.selectedSquare = null;
        this.validMoves = [];
        
        this.initializeEventListeners();
        this.generateInitialPuzzles();
    }

    initializeEventListeners() {
        // Navigation
        document.getElementById('navPlay').addEventListener('click', () => this.switchSection('playSection'));
        document.getElementById('navPuzzles').addEventListener('click', () => this.switchSection('puzzlesSection'));
        document.getElementById('navLeaderboard').addEventListener('click', () => this.switchSection('statsSection'));

        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectMode(e.target.dataset.mode));
        });

        // Difficulty selection
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectDifficulty(e.target.dataset.level));
        });

        // Time selection
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectTimeControl(e.target.dataset.time));
        });

        // Game buttons
        document.getElementById('startAIGame').addEventListener('click', () => this.startAIGame());
        document.getElementById('startTimedGame').addEventListener('click', () => this.startTimedGame());
        document.getElementById('generatePuzzle').addEventListener('click', () => this.loadNewPuzzle());

        // Game controls
        document.getElementById('resignBtn').addEventListener('click', () => this.gameManager.resign());
        document.getElementById('drawBtn').addEventListener('click', () => this.gameManager.offerDraw());
        document.getElementById('closeGame').addEventListener('click', () => this.closeGameModal());
        document.getElementById('closePuzzle').addEventListener('click', () => this.closePuzzleModal());

        // Puzzle controls
        document.getElementById('puzzleResetBtn').addEventListener('click', () => this.resetPuzzle());
        document.getElementById('nextPuzzleBtn').addEventListener('click', () => this.loadNewPuzzle());

        // Puzzle filter
        document.getElementById('difficultyFilter').addEventListener('change', (e) => {
            this.filterPuzzles(e.target.value);
        });

        // Game callbacks
        this.gameManager.onMove(() => this.updateGameBoard());
        this.gameManager.onGameOver((result) => this.handleGameOver(result));
    }

    switchSection(sectionId) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
        
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');

        this.currentSection = sectionId;

        if (sectionId === 'statsSection') {
            this.updateStats();
        }
    }

    selectMode(mode) {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
    }

    selectDifficulty(level) {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        this.selectedDifficulty = parseInt(level);
    }

    selectTimeControl(time) {
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        this.selectedTimeControl = parseInt(time);
    }

    startAIGame() {
        const difficulty = this.selectedDifficulty || 2;
        this.gameManager.startAIGame(difficulty);
        this.openGameModal();
        this.renderGameBoard();
    }

    startTimedGame() {
        const time = this.selectedTimeControl || 600;
        this.gameManager.startTimedGame(time);
        this.openGameModal();
        this.renderGameBoard();
    }

    loadNewPuzzle() {
        const difficulty = document.getElementById('difficultyFilter').value;
        const puzzle = this.puzzleEngine.generateNewPuzzle(difficulty || null);
        this.renderPuzzleBoard();
        this.openPuzzleModal();
        this.updatePuzzleInfo(puzzle);
    }

    resetPuzzle() {
        if (this.puzzleEngine.currentPuzzle) {
            this.renderPuzzleBoard();
            document.getElementById('puzzleStatus').textContent = '';
            document.getElementById('puzzleStatus').className = 'puzzle-status';
        }
    }

    openGameModal() {
        document.getElementById('gameModal').classList.add('active');
    }

    closeGameModal() {
        document.getElementById('gameModal').classList.remove('active');
        this.gameManager.gameActive = false;
    }

    openPuzzleModal() {
        document.getElementById('puzzleModal').classList.add('active');
    }

    closePuzzleModal() {
        document.getElementById('puzzleModal').classList.remove('active');
    }

    renderGameBoard() {
        const board = this.gameManager.getGameStatus().board;
        this.renderBoard('chessboard', board, 'game');
    }

    renderPuzzleBoard() {
        const board = this.puzzleEngine.board;
        this.renderBoard('puzzleBoard', board, 'puzzle');
    }

    renderBoard(elementId, board, mode) {
        const boardElement = document.getElementById(elementId);
        boardElement.innerHTML = '';

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const square = document.createElement('div');
                const isLight = (r + c) % 2 === 0;
                square.className = `square ${isLight ? 'light' : 'dark'}`;
                square.dataset.row = r;
                square.dataset.col = c;

                const piece = board[r][c];
                if (piece !== '.') {
                    square.textContent = pieces[piece];
                    square.classList.add('piece');
                }

                if (this.selectedSquare && this.selectedSquare[0] === r && this.selectedSquare[1] === c) {
                    square.classList.add('selected');
                }

                if (this.validMoves.some(m => m[0] === r && m[1] === c)) {
                    square.classList.add('valid-move');
                }

                square.addEventListener('click', () => {
                    if (mode === 'game') {
                        this.handleGameSquareClick(r, c);
                    } else {
                        this.handlePuzzleSquareClick(r, c);
                    }
                });

                boardElement.appendChild(square);
            }
        }

        this.updateGameInfo();
    }

    handleGameSquareClick(row, col) {
        if (!this.gameManager.gameActive || !this.gameManager.engine.whiteTurn) return;

        if (this.selectedSquare === null) {
            const piece = this.gameManager.engine.board[row][col];
            if (piece !== '.' && this.gameManager.engine.isWhitePiece(piece)) {
                this.selectedSquare = [row, col];
                this.validMoves = this.gameManager.engine.getValidMoves(row, col);
                this.renderGameBoard();
            }
        } else {
            const [fromRow, fromCol] = this.selectedSquare;
            if (fromRow === row && fromCol === col) {
                this.selectedSquare = null;
                this.validMoves = [];
            } else {
                const moveSuccess = this.gameManager.playerMove(fromRow, fromCol, row, col);
                if (moveSuccess) {
                    this.selectedSquare = null;
                    this.validMoves = [];
                }
            }
            this.renderGameBoard();
        }
    }

    handlePuzzleSquareClick(row, col) {
        if (this.selectedSquare === null) {
            const piece = this.puzzleEngine.board[row][col];
            if (piece !== '.') {
                this.selectedSquare = [row, col];
                this.validMoves = this.gameManager.engine.getValidMoves(row, col) || [];
                this.renderPuzzleBoard();
            }
        } else {
            const [fromRow, fromCol] = this.selectedSquare;
            if (fromRow === row && fromCol === col) {
                this.selectedSquare = null;
                this.validMoves = [];
            } else {
                const isCorrect = this.puzzleEngine.validateSolution(fromRow, fromCol, row, col);
                const statusDiv = document.getElementById('puzzleStatus');
                
                if (isCorrect) {
                    statusDiv.textContent = '✅ Correct! Well done!';
                    statusDiv.classList.add('success');
                } else {
                    statusDiv.textContent = '❌ Try again!';
                    statusDiv.classList.add('error');
                }

                this.selectedSquare = null;
                this.validMoves = [];
            }
            this.renderPuzzleBoard();
        }
    }

    updateGameBoard() {
        this.renderGameBoard();
        this.updateMoveHistory();
    }

    updateGameInfo() {
        const status = this.gameManager.getGameStatus();
        
        if (this.gameManager.gameMode === 'ai') {
            document.getElementById('playerNameTop').textContent = 'AI';
        }

        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        };

        document.getElementById('timerTop').textContent = formatTime(status.blackTime);
        document.getElementById('timerBottom').textContent = formatTime(status.whiteTime);

        if (status.inCheck) {
            document.getElementById('gameStatus').textContent = '⚠️ Check!';
        }
    }

    updateMoveHistory() {
        const moveList = document.getElementById('moveList');
        moveList.innerHTML = '';

        const moves = this.gameManager.engine.moveHistory;
        for (let i = 0; i < moves.length; i += 2) {
            const move1 = moves[i];
            const move2 = moves[i + 1];
            
            const moveText = `${i / 2 + 1}. ${this.algebraicNotation(move1)}${move2 ? ' ' + this.algebraicNotation(move2) : ''}`;
            const moveDiv = document.createElement('div');
            moveDiv.className = 'move';
            moveDiv.textContent = moveText;
            moveList.appendChild(moveDiv);
        }
    }

    algebraicNotation(move) {
        const cols = 'abcdefgh';
        const from = `${cols[move.from[1]]}${8 - move.from[0]}`;
        const to = `${cols[move.to[1]]}${8 - move.to[0]}`;
        return `${from}-${to}`;
    }

    handleGameOver(result) {
        const statusDiv = document.getElementById('gameStatus');
        
        if (result === 'win') {
            statusDiv.textContent = '🎉 You Won!';
            statusDiv.classList.add('win');
        } else if (result === 'loss') {
            statusDiv.textContent = '💔 You Lost!';
            statusDiv.classList.add('loss');
        } else {
            statusDiv.textContent = '🤝 Draw!';
        }
    }

    updatePuzzleInfo(puzzle) {
        document.getElementById('puzzleTitle').textContent = puzzle.title;
        document.getElementById('puzzleDifficulty').textContent = puzzle.difficulty.toUpperCase();
        document.getElementById('puzzleRating').textContent = puzzle.rating;
        document.getElementById('puzzleTheme').textContent = puzzle.theme;
        document.getElementById('hintText').textContent = puzzle.hint;
    }

    updateStats() {
        const stats = this.puzzleEngine.getStats();
        const statsContainer = document.getElementById('statsContainer');
        
        statsContainer.innerHTML = `
            <div class="stat-card">
                <h3>Puzzles Solved</h3>
                <div class="stat-value">${stats.solved}</div>
            </div>
            <div class="stat-card">
                <h3>Success Rate</h3>
                <div class="stat-value">${stats.successRate}%</div>
            </div>
            <div class="stat-card">
                <h3>Puzzle Rating</h3>
                <div class="stat-value">${stats.rating}</div>
            </div>
            <div class="stat-card">
                <h3>Puzzles Attempted</h3>
                <div class="stat-value">${stats.attempted}</div>
            </div>
        `;
    }

    filterPuzzles(difficulty) {
        // Implementation for filtering
    }

    generateInitialPuzzles() {
        this.puzzleEngine.generateNewPuzzle();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ChessApp();
});