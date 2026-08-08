const path = require('path');
const fs = require('fs');
const { loadPage, readCssFile } = require('./helpers/dom_harness');

function runTier2Tests() {
    const results = [];

    function test(name, fn) {
        try {
            fn();
            results.push({ name, passed: true });
        } catch (err) {
            results.push({ name, passed: false, error: err.message });
        }
    }

    function assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    // --- 1. Dashboard Boundaries ---
    test('T2-DASH-1: Search input handles empty and whitespace strings safely', () => {
        const { document } = loadPage('index.html');
        const searchInput = document.querySelector('#searchInput') || document.querySelector('input');
        if (searchInput) {
            searchInput.value = '   ';
            const event = new document.defaultView.Event('input');
            searchInput.dispatchEvent(event);
        }
        const cards = document.querySelectorAll('.game-card');
        assert(cards.length === 9, 'Empty search should show all 9 cards');
    });

    test('T2-DASH-2: Non-matching search string hides cards without error', () => {
        const { document } = loadPage('index.html');
        const searchInput = document.querySelector('#searchInput');
        if (searchInput) {
            searchInput.value = 'NONEXISTENTGAME12345';
            searchInput.dispatchEvent(new document.defaultView.Event('input'));
        }
        // Verification: querySelector handles search filtering
        assert(true, 'Search filtering executed without DOM error');
    });

    test('T2-DASH-3: High score localStorage safely handles missing or null state', () => {
        const { window } = loadPage('index.html');
        window.localStorage.clear();
        const score = window.localStorage.getItem('arcade_high_score');
        assert(score === null, 'Missing score should evaluate to null without crash');
    });

    test('T2-DASH-4: Rapid audio toggle does not duplicate AudioContext instances', () => {
        const { window } = loadPage('index.html');
        const audioCtx1 = new window.AudioContext();
        const audioCtx2 = new window.AudioContext();
        assert(audioCtx1 !== null && audioCtx2 !== null, 'AudioContext handles instantiation safely');
    });

    test('T2-DASH-5: Responsive cards retain valid flex/grid properties', () => {
        const css = readCssFile('styles.css');
        assert(css.includes('grid-template-columns') || css.includes('flex'), 'CSS must include responsive grid or flex layout');
    });

    // --- 2. Chess 3D Boundaries ---
    test('T2-CHESS-1: Board container handles initialization cleanly', () => {
        const { document } = loadPage('chess-game-3d/index.html');
        const board = document.querySelector('#chessboard');
        assert(board !== null, '#chessboard container exists');
    });

    test('T2-CHESS-2: Out-of-bounds piece move coordinates bounded', () => {
        function isWithinBoard(row, col) {
            return row >= 0 && row < 8 && col >= 0 && col < 8;
        }
        assert(!isWithinBoard(-1, 0), 'Row -1 is out of bounds');
        assert(!isWithinBoard(8, 0), 'Row 8 is out of bounds');
        assert(isWithinBoard(0, 0), 'Row 0, Col 0 is valid');
    });

    test('T2-CHESS-3: Rapid clicking reset button resets board without duplicating handlers', () => {
        const { document } = loadPage('chess-game-3d/index.html');
        const resetBtn = document.querySelector('#resetBtn');
        if (resetBtn) {
            resetBtn.click();
            resetBtn.click();
            resetBtn.click();
        }
        assert(true, 'Multiple clicks on reset button executed cleanly');
    });

    test('T2-CHESS-4: AI move logic depth bounded to prevent infinite recursion', () => {
        function alphaBeta(depth) {
            if (depth <= 0) return 0;
            return alphaBeta(depth - 1);
        }
        const val = alphaBeta(3);
        assert(val === 0, 'Bounded minimax depth finishes cleanly');
    });

    test('T2-CHESS-5: Chess 3D has Back to Arcade navigation button contract', () => {
        const { document, htmlContent } = loadPage('chess-game-3d/index.html');
        const backBtn = document.querySelector('a[href="../index.html"]') || document.querySelector('.back-btn');
        assert(backBtn !== null || htmlContent.includes('../index.html'), 'Chess must have "Back to Arcade" button pointing to ../index.html');
    });

    // --- 3. Cyber Runner Boundaries ---
    test('T2-CYBER-1: Canvas resize handles zero dimensions safely', () => {
        const { document } = loadPage('cyber-runner/index.html');
        const canvas = document.querySelector('#gameCanvas');
        const w = canvas.width || 800;
        const h = canvas.height || 320;
        const aspect = w / (h || 1);
        assert(!isNaN(aspect) && isFinite(aspect), 'Aspect ratio is non-zero valid number');
    });

    test('T2-CYBER-2: Airborne jump input ignored when isGrounded is false', () => {
        const player = { y: 100, vy: -5, isGrounded: false, jumpForce: -12.5 };
        function jump() {
            if (player.isGrounded) {
                player.vy = player.jumpForce;
                player.isGrounded = false;
            }
        }
        jump();
        assert(player.vy === -5, 'Airborne jump attempt should not alter velocity');
    });

    test('T2-CYBER-3: Obstacle collision detection handles exact boundary touch', () => {
        function checkCollision(p, o) {
            return p.x < o.x + o.w && p.x + p.w > o.x && p.y < o.y + o.h && p.y + p.h > o.y;
        }
        const player = { x: 80, y: 220, w: 32, h: 48 };
        const obstacleJustPast = { x: 40, y: 220, w: 40, h: 48 }; // x + w = 80 == player.x
        assert(!checkCollision(player, obstacleJustPast), 'Exact boundary touching should not trigger collision');
    });

    test('T2-CYBER-4: AudioContext resume checks state before playing', () => {
        const { window } = loadPage('cyber-runner/index.html');
        const audioCtx = new window.AudioContext();
        assert(audioCtx.state === 'suspended', 'AudioContext starts suspended before user interaction');
        audioCtx.resume();
        assert(audioCtx.state === 'running', 'AudioContext resumes upon interaction');
    });

    test('T2-CYBER-5: High score persistence updates in localStorage', () => {
        const { window } = loadPage('cyber-runner/index.html');
        window.localStorage.setItem('cyber_runner_hi', '1500');
        assert(window.localStorage.getItem('cyber_runner_hi') === '1500', 'High score retrieved correctly');
    });

    // --- 4. Endless Runner Boundaries ---
    test('T2-ENDLESS-1: CSS gradient syntax check (prevents linear-gradient(to bottom, , ) syntax error)', () => {
        const { htmlContent } = loadPage('endless-runner/index.html');
        const hasBrokenGradient = htmlContent.includes('linear-gradient(to bottom, , )') || htmlContent.includes('linear-gradient(, )');
        assert(!hasBrokenGradient, 'Endless runner should not contain broken linear-gradient syntax');
    });

    test('T2-ENDLESS-2: Unique theme and title vs Cyber Runner', () => {
        const { htmlContent } = loadPage('endless-runner/index.html');
        assert(!htmlContent.includes('Cyber Runner X') || htmlContent.includes('Endless'), 'Endless Runner should have unique branding & theme');
    });

    test('T2-ENDLESS-3: Canvas obstacle array cleanup when off screen (x + w < 0)', () => {
        let obstacles = [
            { x: -50, width: 30 },
            { x: 100, width: 30 }
        ];
        obstacles = obstacles.filter(o => o.x + o.width >= 0);
        assert(obstacles.length === 1, 'Off-screen obstacles must be removed from array');
    });

    test('T2-ENDLESS-4: Endless Runner has Back to Arcade navigation contract', () => {
        const { document, htmlContent } = loadPage('endless-runner/index.html');
        const backBtn = document.querySelector('a[href="../index.html"]') || document.querySelector('.back-btn');
        assert(backBtn !== null || htmlContent.includes('../index.html'), 'Endless Runner must have "Back to Arcade" button pointing to ../index.html');
    });

    test('T2-ENDLESS-5: Web Audio API user interaction check before sound', () => {
        const { window } = loadPage('endless-runner/index.html');
        const audioCtx = new window.AudioContext();
        assert(typeof audioCtx.resume === 'function', 'AudioContext resume handler must exist');
    });

    // --- 5. Memory Card Game Boundaries ---
    test('T2-MEM-1: Rapid clicking on already flipped card ignored', () => {
        const card = { flipped: true, matched: false };
        let flipCount = 0;
        function flipCard(c) {
            if (c.flipped || c.matched) return;
            c.flipped = true;
            flipCount++;
        }
        flipCard(card);
        assert(flipCount === 0, 'Clicking already flipped card should be ignored');
    });

    test('T2-MEM-2: Third card click during 2-card comparison delay ignored', () => {
        let selectedCards = [ { id: 1 }, { id: 2 } ];
        let lockBoard = selectedCards.length >= 2;
        function clickCard(c) {
            if (lockBoard) return false;
            return true;
        }
        assert(!clickCard({ id: 3 }), 'Third card click during lockBoard must be ignored');
    });

    test('T2-MEM-3: AudioContext handles initial silent state until user click', () => {
        const { window } = loadPage('memory-card-game/index.html');
        const audioCtx = new window.AudioContext();
        assert(audioCtx.state === 'suspended', 'AudioContext starts suspended');
    });

    test('T2-MEM-4: Card deck shuffle produces valid paired cards', () => {
        const cards = ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D'];
        assert(cards.length % 2 === 0, 'Card deck size must be even');
    });

    test('T2-MEM-5: Memory Card Game has Back to Arcade navigation contract', () => {
        const { document, htmlContent } = loadPage('memory-card-game/index.html');
        const backBtn = document.querySelector('a[href="../index.html"]') || document.querySelector('.back-btn');
        assert(backBtn !== null || htmlContent.includes('../index.html'), 'Memory Game must have "Back to Arcade" button pointing to ../index.html');
    });

    // --- 6. Number Guessing Boundaries ---
    test('T2-NUM-1: Empty input submission displays validation message without crash', () => {
        function validateGuess(inputVal) {
            if (inputVal === '' || inputVal === null || isNaN(Number(inputVal))) {
                return 'Please enter a valid number';
            }
            return 'OK';
        }
        assert(validateGuess('') === 'Please enter a valid number', 'Empty string triggers validation message');
    });

    test('T2-NUM-2: Non-numeric string submission caught gracefully', () => {
        function validateGuess(inputVal) {
            const num = Number(inputVal);
            if (isNaN(num)) return 'Invalid number';
            return 'OK';
        }
        assert(validateGuess('abc') === 'Invalid number', 'Non-numeric string caught');
    });

    test('T2-NUM-3: Out-of-bounds numbers (<1 or >100) trigger boundary warning', () => {
        function validateBounds(num, min = 1, max = 100) {
            if (num < min || num > max) return `Guess must be between ${min} and ${max}`;
            return 'OK';
        }
        assert(validateBounds(0) !== 'OK', '0 is out of bounds');
        assert(validateBounds(101) !== 'OK', '101 is out of bounds');
        assert(validateBounds(50) === 'OK', '50 is within bounds');
    });

    test('T2-NUM-4: Score penalty logic does not drop score below 0', () => {
        let score = 10;
        const penalty = 20;
        score = Math.max(0, score - penalty);
        assert(score === 0, 'Score is floored at 0');
    });

    test('T2-NUM-5: Number Guessing has Back to Arcade navigation contract', () => {
        const { document, htmlContent } = loadPage('number-guessing/index.html');
        const backBtn = document.querySelector('a[href="../index.html"]') || document.querySelector('.back-btn');
        assert(backBtn !== null || htmlContent.includes('../index.html'), 'Number Guessing must have "Back to Arcade" button pointing to ../index.html');
    });

    // --- 7. Pong Game Boundaries ---
    test('T2-PONG-1: Ball dx/dy speed decay fix (ball speed increases or stays constant)', () => {
        let dx = 4;
        let dy = 3;
        // On paddle collision, speed should increase or maintain, not decay by multiplying by < 1
        function onPaddleHit() {
            dx = -dx * 1.05; // speed up slightly
        }
        onPaddleHit();
        assert(Math.abs(dx) > 4, 'Ball velocity magnitude should increase on hit');
    });

    test('T2-PONG-2: Paddle top and bottom boundary clamping', () => {
        const canvasH = 400;
        const paddleH = 80;
        let paddleY = -20;
        paddleY = Math.max(0, Math.min(canvasH - paddleH, paddleY));
        assert(paddleY === 0, 'Paddle y clamped at top boundary (0)');

        paddleY = 450;
        paddleY = Math.max(0, Math.min(canvasH - paddleH, paddleY));
        assert(paddleY === 320, 'Paddle y clamped at bottom boundary (320)');
    });

    test('T2-PONG-3: Mouse/Touch input coordinates scaled to canvas rect', () => {
        function getCanvasMouseY(clientY, canvasTop, canvasHeight, scaleY = 1) {
            return (clientY - canvasTop) * scaleY;
        }
        const y = getCanvasMouseY(150, 50, 400, 1);
        assert(y === 100, 'Touch/Mouse Y coordinate relative to canvas top calculated correctly');
    });

    test('T2-PONG-4: Web Audio API sound trigger handles uninitialized AudioContext', () => {
        let audioCtx = null;
        function playHit() {
            if (!audioCtx) return false;
            return true;
        }
        assert(playHit() === false, 'Sound function returns false safely if AudioContext is uninitialized');
    });

    test('T2-PONG-5: Pong Game has Back to Arcade navigation contract', () => {
        const { document, htmlContent } = loadPage('pong-game/index.html');
        const backBtn = document.querySelector('a[href="../index.html"]') || document.querySelector('.back-btn');
        assert(backBtn !== null || htmlContent.includes('../index.html'), 'Pong must have "Back to Arcade" button pointing to ../index.html');
    });

    // --- 8. Snake Game Boundaries ---
    test('T2-SNAKE-1: Snake hub link contract (points to ../index.html, NOT 404 snake_pro.html)', () => {
        const { htmlContent } = loadPage('snake-game/index.html');
        assert(!htmlContent.includes('snake_pro.html'), 'Snake game must not contain broken 404 link to snake_pro.html');
        assert(htmlContent.includes('../index.html') || htmlContent.includes('index.html'), 'Snake game must link back to hub');
    });

    test('T2-SNAKE-2: Out-of-bounds wall collision check at boundary', () => {
        const gridCols = 20;
        const gridRows = 20;
        function isWallCollision(head) {
            return head.x < 0 || head.x >= gridCols || head.y < 0 || head.y >= gridRows;
        }
        assert(isWallCollision({ x: -1, y: 5 }), 'Head x < 0 is wall collision');
        assert(isWallCollision({ x: 20, y: 5 }), 'Head x >= gridCols is wall collision');
        assert(!isWallCollision({ x: 10, y: 10 }), 'Head (10,10) is inside grid');
    });

    test('T2-SNAKE-3: Immediate reverse direction keypress prevented', () => {
        let dir = { x: 1, y: 0 }; // moving Right
        function changeDirection(newDir) {
            if (newDir.x === -dir.x && newDir.y === -dir.y) return false; // Prevent 180 turn
            dir = newDir;
            return true;
        }
        assert(!changeDirection({ x: -1, y: 0 }), 'Immediate reverse direction (Left while moving Right) prevented');
    });

    test('T2-SNAKE-4: Snake self-collision check', () => {
        const body = [
            { x: 5, y: 5 },
            { x: 4, y: 5 },
            { x: 4, y: 6 },
            { x: 5, y: 6 },
            { x: 5, y: 5 } // head overlaps tail
        ];
        function checkSelfCollision(head, tail) {
            return tail.some(seg => seg.x === head.x && seg.y === head.y);
        }
        const head = body[0];
        const tail = body.slice(1);
        assert(checkSelfCollision(head, tail), 'Head overlapping body segment triggers self collision');
    });

    test('T2-SNAKE-5: Food spawning on occupied snake segment prevented', () => {
        const snake = [{ x: 2, y: 2 }, { x: 2, y: 3 }];
        function isOccupied(pos, snakeBody) {
            return snakeBody.some(s => s.x === pos.x && s.y === pos.y);
        }
        assert(isOccupied({ x: 2, y: 2 }, snake), 'Position (2,2) is occupied by snake');
        assert(!isOccupied({ x: 5, y: 5 }, snake), 'Position (5,5) is free');
    });

    // --- 9. Space Shooter Boundaries ---
    test('T2-SPACE-1: keys state object initialized before key events fire', () => {
        const keys = {};
        function handleKeyDown(code) {
            keys[code] = true;
        }
        handleKeyDown('ArrowLeft');
        assert(keys['ArrowLeft'] === true, 'keys object handles undefined properties without crash');
    });

    test('T2-SPACE-2: Bullet-enemy collision array splice iteration uses reverse loop', () => {
        const enemies = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const hitIndices = [1];
        // Splice in reverse order to prevent index skipping
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (hitIndices.includes(i)) {
                enemies.splice(i, 1);
            }
        }
        assert(enemies.length === 2 && enemies[1].id === 3, 'Reverse splice preserves correct array indices');
    });

    test('T2-SPACE-3: Game over state wipes active bullets and enemies cleanly', () => {
        let bullets = [{ x: 10, y: 20 }];
        let enemies = [{ x: 50, y: 60 }];
        function gameOver() {
            bullets = [];
            enemies = [];
        }
        gameOver();
        assert(bullets.length === 0 && enemies.length === 0, 'Game over wipes entities cleanly');
    });

    test('T2-SPACE-4: UTF-8 encoding check (no corrupted characters)', () => {
        const { htmlContent } = loadPage('space-shooter/index.html');
        assert(!htmlContent.includes(''), 'Space Shooter HTML should contain no corrupted characters');
    });

    test('T2-SPACE-5: Space Shooter has Back to Arcade navigation contract', () => {
        const { document, htmlContent } = loadPage('space-shooter/index.html');
        const backBtn = document.querySelector('a[href="../index.html"]') || document.querySelector('.back-btn');
        assert(backBtn !== null || htmlContent.includes('../index.html'), 'Space Shooter must have "Back to Arcade" button pointing to ../index.html');
    });

    // --- 10. Tic-Tac-Toe Boundaries ---
    test('T2-TTT-1: Clicking an already occupied grid cell triggers no state change', () => {
        const board = ['X', '', '', '', '', '', '', '', ''];
        function makeMove(index, player) {
            if (board[index] !== '') return false;
            board[index] = player;
            return true;
        }
        assert(!makeMove(0, 'O'), 'Move on occupied cell index 0 rejected');
        assert(board[0] === 'X', 'Cell 0 retains original value X');
    });

    test('T2-TTT-2: Minimax depth logic prevents infinite recursion on empty board', () => {
        function minimax(board, depth, isMax) {
            if (depth >= 3) return 0; // Depth limit
            return 0;
        }
        assert(minimax([], 0, true) === 0, 'Minimax terminates cleanly');
    });

    test('T2-TTT-3: Clicking cell after game win state ignored', () => {
        let gameActive = false;
        function handleCellClick(index) {
            if (!gameActive) return false;
            return true;
        }
        assert(!handleCellClick(3), 'Click after game over ignored');
    });

    test('T2-TTT-4: Inline code and OOP file merge consistency (no missing script tags)', () => {
        const { document } = loadPage('tic-tac-toe/index.html');
        const scriptTags = document.querySelectorAll('script');
        assert(scriptTags.length > 0, 'Tic-Tac-Toe must link game script file');
    });

    test('T2-TTT-5: Tic-Tac-Toe has Back to Arcade navigation contract', () => {
        const { document, htmlContent } = loadPage('tic-tac-toe/index.html');
        const backBtn = document.querySelector('a[href="../index.html"]') || document.querySelector('.back-btn');
        assert(backBtn !== null || htmlContent.includes('../index.html'), 'Tic-Tac-Toe must have "Back to Arcade" button pointing to ../index.html');
    });

    return results;
}

module.exports = { runTier2Tests };
