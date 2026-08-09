// Main Application - Chess 3D / Chess Puzzle
const pieces = {
    'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔',
    'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚'
};

class ChessApp {
    constructor() {
        this.currentSection = 'playSection';
        this.gameManager = typeof GameManager !== 'undefined' ? new GameManager() : null;
        this.puzzleEngine = typeof PuzzleEngine !== 'undefined' ? new PuzzleEngine() : null;
        this.selectedSquare = null;
        this.validMoves = [];
        
        this.initializeEventListeners();
        if (this.puzzleEngine) {
            this.generateInitialPuzzles();
        }
    }

    initializeEventListeners() {
        // Navigation
        document.getElementById('navPlay')?.addEventListener('click', (e) => this.switchSection('playSection', e));
        document.getElementById('navPuzzles')?.addEventListener('click', (e) => this.switchSection('puzzlesSection', e));
        document.getElementById('navLeaderboard')?.addEventListener('click', (e) => this.switchSection('statsSection', e));

        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectMode(e.target.dataset.mode, e));
        });

        // Difficulty selection
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectDifficulty(e.target.dataset.level, e));
        });

        // Time selection
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectTimeControl(e.target.dataset.time, e));
        });

        // Game buttons
        document.getElementById('startAIGame')?.addEventListener('click', () => this.startAIGame());
        document.getElementById('startTimedGame')?.addEventListener('click', () => this.startTimedGame());
        document.getElementById('generatePuzzle')?.addEventListener('click', () => this.loadNewPuzzle());

        // Game controls
        document.getElementById('resignBtn')?.addEventListener('click', () => this.gameManager?.resign());
        document.getElementById('drawBtn')?.addEventListener('click', () => this.gameManager?.offerDraw());
        document.getElementById('closeGame')?.addEventListener('click', () => this.closeGameModal());
        document.getElementById('closePuzzle')?.addEventListener('click', () => this.closePuzzleModal());

        // Reset and Next controls
        const resetBtn = document.getElementById('resetBtn') || document.getElementById('puzzleResetBtn');
        resetBtn?.addEventListener('click', () => this.resetPuzzle());

        document.getElementById('nextPuzzleBtn')?.addEventListener('click', () => this.loadNewPuzzle());

        // Puzzle filter
        document.getElementById('difficultyFilter')?.addEventListener('change', (e) => {
            this.filterPuzzles(e.target.value);
        });

        // Game callbacks
        if (this.gameManager) {
            this.gameManager.onMove(() => this.updateGameBoard());
            this.gameManager.onGameOver((result) => this.handleGameOver(result));
        }
    }

    switchSection(sectionId, e) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        const sec = document.getElementById(sectionId);
        if (sec) sec.classList.add('active');
        
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        if (e && e.target) e.target.classList.add('active');

        this.currentSection = sectionId;

        if (sectionId === 'statsSection') {
            this.updateStats();
        }
    }

    selectMode(mode, e) {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        if (e && e.target) e.target.classList.add('active');
    }

    selectDifficulty(level, e) {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        if (e && e.target) e.target.classList.add('active');
        this.selectedDifficulty = parseInt(level, 10);
    }

    selectTimeControl(time, e) {
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
        if (e && e.target) e.target.classList.add('active');
        this.selectedTimeControl = parseInt(time, 10);
    }

    startAIGame() {
        if (!this.gameManager) return;
        const difficulty = this.selectedDifficulty || 2;
        this.gameManager.startAIGame(difficulty);
        this.openGameModal();
        this.renderGameBoard();
    }

    startTimedGame() {
        if (!this.gameManager) return;
        const time = this.selectedTimeControl || 600;
        this.gameManager.startTimedGame(time);
        this.openGameModal();
        this.renderGameBoard();
    }

    loadNewPuzzle() {
        if (!this.puzzleEngine) return;
        const diffEl = document.getElementById('difficultyFilter');
        const difficulty = diffEl ? diffEl.value : null;
        const puzzle = this.puzzleEngine.generateNewPuzzle(difficulty || null);
        this.renderPuzzleBoard();
        this.openPuzzleModal();
        this.updatePuzzleInfo(puzzle);
    }

    resetPuzzle() {
        if (this.puzzleEngine && this.puzzleEngine.currentPuzzle) {
            this.renderPuzzleBoard();
            const statusDiv = document.getElementById('gameStatus') || document.getElementById('puzzleStatus');
            if (statusDiv) {
                statusDiv.textContent = '';
                statusDiv.className = 'status';
            }
        }
    }

    openGameModal() {
        const modal = document.getElementById('gameModal');
        if (modal) modal.classList.add('active');
    }

    closeGameModal() {
        const modal = document.getElementById('gameModal');
        if (modal) modal.classList.remove('active');
        if (this.gameManager) this.gameManager.gameActive = false;
    }

    openPuzzleModal() {
        const modal = document.getElementById('puzzleModal');
        if (modal) modal.classList.add('active');
    }

    closePuzzleModal() {
        const modal = document.getElementById('puzzleModal');
        if (modal) modal.classList.remove('active');
    }

    renderGameBoard() {
        if (!this.gameManager) return;
        const board = this.gameManager.getGameStatus().board;
        this.renderBoard('chessboard', board, 'game');
    }

    renderPuzzleBoard() {
        if (!this.puzzleEngine) return;
        const board = this.puzzleEngine.board;
        const targetId = document.getElementById('puzzleBoard') ? 'puzzleBoard' : 'chessboard';
        this.renderBoard(targetId, board, 'puzzle');
    }

    renderBoard(elementId, board, mode) {
        const boardElement = document.getElementById(elementId);
        if (!boardElement) return;
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
                    square.textContent = pieces[piece] || piece;
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
        if (!this.gameManager || !this.gameManager.gameActive || !this.gameManager.engine.whiteTurn) return;

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
        if (!this.puzzleEngine) return;
        if (this.selectedSquare === null) {
            const piece = this.puzzleEngine.board[row][col];
            if (piece !== '.') {
                this.selectedSquare = [row, col];
                this.validMoves = (this.gameManager && this.gameManager.engine) ? this.gameManager.engine.getValidMoves(row, col) : [];
                this.renderPuzzleBoard();
            }
        } else {
            const [fromRow, fromCol] = this.selectedSquare;
            if (fromRow === row && fromCol === col) {
                this.selectedSquare = null;
                this.validMoves = [];
            } else {
                const isCorrect = this.puzzleEngine.validateSolution(fromRow, fromCol, row, col);
                const statusDiv = document.getElementById('gameStatus') || document.getElementById('puzzleStatus');
                
                if (isCorrect) {
                    if (statusDiv) {
                        statusDiv.textContent = '✅ Correct! Well done!';
                        statusDiv.className = 'status win';
                    }
                    if (typeof ArcadeSDK !== 'undefined' && ArcadeSDK.saveHighScore) {
                        ArcadeSDK.saveHighScore('chess-game-3d', 100);
                    }
                } else {
                    if (statusDiv) {
                        statusDiv.textContent = '❌ Try again!';
                        statusDiv.className = 'status loss';
                    }
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
        if (!this.gameManager) return;
        const status = this.gameManager.getGameStatus();
        
        const playerTop = document.getElementById('playerNameTop');
        if (playerTop && this.gameManager.gameMode === 'ai') {
            playerTop.textContent = 'AI';
        }

        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        };

        const timerTop = document.getElementById('timerTop');
        if (timerTop) timerTop.textContent = formatTime(status.blackTime);

        const timerBottom = document.getElementById('timerBottom');
        if (timerBottom) timerBottom.textContent = formatTime(status.whiteTime);

        const gameStatus = document.getElementById('gameStatus');
        if (gameStatus && status.inCheck) {
            gameStatus.textContent = '⚠️ Check!';
        }
    }

    updateMoveHistory() {
        const moveList = document.getElementById('moveList');
        if (!moveList || !this.gameManager) return;
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
        if (!move) return '';
        const cols = 'abcdefgh';
        const from = `${cols[move.from[1]]}${8 - move.from[0]}`;
        const to = `${cols[move.to[1]]}${8 - move.to[0]}`;
        return `${from}-${to}`;
    }

    handleGameOver(result) {
        const statusDiv = document.getElementById('gameStatus') || document.getElementById('puzzleStatus');
        
        let score = (result === 'win') ? 500 : (result === 'draw' ? 100 : 0);
        if (typeof ArcadeSDK !== 'undefined' && ArcadeSDK.saveHighScore) {
            ArcadeSDK.saveHighScore('chess-game-3d', score);
        }

        if (statusDiv) {
            if (result === 'win') {
                statusDiv.textContent = '🎉 You Won!';
                statusDiv.className = 'status win';
            } else if (result === 'loss') {
                statusDiv.textContent = '💔 You Lost!';
                statusDiv.className = 'status loss';
            } else {
                statusDiv.textContent = '🤝 Draw!';
                statusDiv.className = 'status';
            }
        }
    }

    updatePuzzleInfo(puzzle) {
        if (!puzzle) return;
        const setTxt = (id, txt) => {
            const el = document.getElementById(id);
            if (el) el.textContent = txt;
        };
        setTxt('puzzleTitle', puzzle.title);
        setTxt('puzzleDifficulty', (puzzle.difficulty || '').toUpperCase());
        setTxt('puzzleRating', puzzle.rating);
        setTxt('puzzleTheme', puzzle.theme);
        setTxt('hintText', puzzle.hint);
    }

    updateStats() {
        if (!this.puzzleEngine) return;
        const stats = this.puzzleEngine.getStats();
        const statsContainer = document.getElementById('statsContainer');
        if (!statsContainer) return;
        
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
        // Filter implementation
    }

    generateInitialPuzzles() {
        if (this.puzzleEngine) {
            this.puzzleEngine.generateNewPuzzle();
            this.renderPuzzleBoard();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ChessApp();
});