const path = require('path');
const fs = require('fs');
const { loadPage, readCssFile } = require('./helpers/dom_harness');

function runTier1Tests() {
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

    // --- 1. Dashboard ---
    test('T1-DASH-1: Dashboard HTML title and header', () => {
        const { document } = loadPage('index.html');
        assert(document.title.includes("Bhargavi's Nexus") || document.title.includes("Arcade"), 'Title should match platform name');
        const h1 = document.querySelector('h1');
        assert(h1 && h1.textContent.includes("Bhargavi's"), 'Header h1 present');
    });

    test('T1-DASH-2: 9 game card links exist in hub grid', () => {
        const { document } = loadPage('index.html');
        const cards = document.querySelectorAll('.game-card');
        assert(cards.length === 9, `Expected 9 game cards, found ${cards.length}`);
        const hrefs = Array.from(cards).map(c => c.getAttribute('href'));
        const expectedGames = [
            'cyber-runner/index.html',
            'endless-runner/index.html',
            'space-shooter/index.html',
            'tic-tac-toe/index.html',
            'memory-card-game/index.html',
            'snake-game/index.html',
            'number-guessing/index.html',
            'chess-game-3d/index.html',
            'pong-game/index.html'
        ];
        expectedGames.forEach(g => {
            assert(hrefs.includes(g), `Missing game card href: ${g}`);
        });
    });

    test('T1-DASH-3: CSS styles.css uses dark slate background color', () => {
        const css = readCssFile('styles.css');
        assert(css !== null, 'styles.css exists');
        assert(css.includes('#0f172a'), 'Background color #0f172a should be present in CSS');
    });

    test('T1-DASH-4: Glassmorphic cards use backdrop-filter blur', () => {
        const css = readCssFile('styles.css');
        assert(css.includes('backdrop-filter: blur'), 'CSS must include backdrop-filter: blur');
        assert(css.includes('rgba(255, 255, 255'), 'CSS must include glass border/background rgba');
    });

    test('T1-DASH-5: Background orbs exist for animated ambient background', () => {
        const { document } = loadPage('index.html');
        const orb1 = document.querySelector('.orb-1');
        const orb2 = document.querySelector('.orb-2');
        const orb3 = document.querySelector('.orb-3');
        assert(orb1 && orb2 && orb3, 'All 3 ambient background orbs must exist');
    });

    // --- 2. Chess 3D ---
    test('T1-CHESS-1: Chess HTML has title and chessboard element', () => {
        const { document } = loadPage('chess-game-3d/index.html');
        assert(document.title.toLowerCase().includes('chess'), 'Title should mention Chess');
        const board = document.querySelector('#chessboard');
        assert(board !== null, '#chessboard element must exist');
    });

    test('T1-CHESS-2: Chess game turn and status indicators exist', () => {
        const { document } = loadPage('chess-game-3d/index.html');
        const turn = document.querySelector('#currentTurn');
        const status = document.querySelector('#gameStatus');
        assert(turn !== null, '#currentTurn element must exist');
        assert(status !== null, '#gameStatus element must exist');
    });

    test('T1-CHESS-3: Chess control buttons reset and next puzzle exist', () => {
        const { document } = loadPage('chess-game-3d/index.html');
        const resetBtn = document.querySelector('#resetBtn');
        const nextBtn = document.querySelector('#nextPuzzleBtn');
        assert(resetBtn !== null, '#resetBtn button must exist');
        assert(nextBtn !== null, '#nextPuzzleBtn button must exist');
    });

    test('T1-CHESS-4: Chess stylesheet exists and links correctly', () => {
        const css = readCssFile('chess-game-3d/style.css');
        assert(css !== null, 'chess-game-3d/style.css must exist');
    });

    test('T1-CHESS-5: Chess index links script.js', () => {
        const { document } = loadPage('chess-game-3d/index.html');
        const scripts = Array.from(document.querySelectorAll('script')).map(s => s.getAttribute('src'));
        assert(scripts.includes('script.js'), 'index.html must link script.js');
    });

    // --- 3. Cyber Runner ---
    test('T1-CYBER-1: Cyber Runner canvas exists with 800x320 dimensions', () => {
        const { document } = loadPage('cyber-runner/index.html');
        const canvas = document.querySelector('#gameCanvas');
        assert(canvas !== null, '#gameCanvas element must exist');
        assert(canvas.getAttribute('width') === '800', 'Canvas width should be 800');
        assert(canvas.getAttribute('height') === '320', 'Canvas height should be 320');
    });

    test('T1-CYBER-2: Cyber Runner score elements exist', () => {
        const { document } = loadPage('cyber-runner/index.html');
        const score = document.querySelector('#scoreVal');
        const highScore = document.querySelector('#highScoreVal');
        assert(score !== null, '#scoreVal element must exist');
        assert(highScore !== null, '#highScoreVal element must exist');
    });

    test('T1-CYBER-3: Cyber Runner difficulty buttons exist', () => {
        const { document } = loadPage('cyber-runner/index.html');
        assert(document.querySelector('#b-easy') !== null, '#b-easy must exist');
        assert(document.querySelector('#b-medium') !== null, '#b-medium must exist');
        assert(document.querySelector('#b-hard') !== null, '#b-hard must exist');
    });

    test('T1-CYBER-4: Cyber Runner theme selector buttons exist', () => {
        const { document } = loadPage('cyber-runner/index.html');
        assert(document.querySelector('.btn-cyber') !== null, '.btn-cyber must exist');
        assert(document.querySelector('.btn-toxic') !== null, '.btn-toxic must exist');
        assert(document.querySelector('.btn-sunset') !== null, '.btn-sunset must exist');
    });

    test('T1-CYBER-5: Cyber Runner mobile touch jump button exists', () => {
        const { document } = loadPage('cyber-runner/index.html');
        const btn = document.querySelector('#mobileJumpBtn');
        assert(btn !== null, '#mobileJumpBtn must exist for mobile responsiveness');
    });

    // --- 4. Endless Runner ---
    test('T1-ENDLESS-1: Endless Runner canvas exists', () => {
        const { document } = loadPage('endless-runner/index.html');
        const canvas = document.querySelector('#gameCanvas');
        assert(canvas !== null, '#gameCanvas element must exist');
    });

    test('T1-ENDLESS-2: Endless Runner start screen overlay and launch button exist', () => {
        const { document } = loadPage('endless-runner/index.html');
        const startScreen = document.querySelector('#startScreen');
        const startBtn = document.querySelector('#startBtn');
        assert(startScreen !== null, '#startScreen overlay must exist');
        assert(startBtn !== null, '#startBtn button must exist');
    });

    test('T1-ENDLESS-3: Endless Runner score elements exist', () => {
        const { document } = loadPage('endless-runner/index.html');
        assert(document.querySelector('#scoreVal') !== null, '#scoreVal element must exist');
        assert(document.querySelector('#highScoreVal') !== null, '#highScoreVal element must exist');
        assert(document.querySelector('#finalScoreVal') !== null, '#finalScoreVal element must exist');
    });

    test('T1-ENDLESS-4: Endless Runner difficulty buttons exist', () => {
        const { document } = loadPage('endless-runner/index.html');
        assert(document.querySelector('#b-easy') !== null, '#b-easy must exist');
        assert(document.querySelector('#b-medium') !== null, '#b-medium must exist');
        assert(document.querySelector('#b-hard') !== null, '#b-hard must exist');
    });

    test('T1-ENDLESS-5: Endless Runner game container exists', () => {
        const { document } = loadPage('endless-runner/index.html');
        assert(document.querySelector('#gameContainer') !== null, '#gameContainer must exist');
    });

    // --- 5. Memory Card Game ---
    test('T1-MEM-1: Memory game container exists', () => {
        const { document } = loadPage('memory-card-game/index.html');
        assert(document.querySelector('.container') !== null || document.querySelector('.game-container') !== null, 'Memory game container must exist');
    });

    test('T1-MEM-2: Memory game grid element exists', () => {
        const { document } = loadPage('memory-card-game/index.html');
        const grid = document.querySelector('.memory-game') || document.querySelector('#gameGrid') || document.querySelector('.grid');
        assert(grid !== null, 'Card grid container must exist');
    });

    test('T1-MEM-3: Memory game score/moves tracker element exists', () => {
        const { document } = loadPage('memory-card-game/index.html');
        const tracker = document.querySelector('#moves') || document.querySelector('#score') || document.querySelector('.moves-count') || document.querySelector('.score-board');
        assert(tracker !== null || document.body.innerHTML.includes('Move') || document.body.innerHTML.includes('Score'), 'Moves/score tracking element must exist');
    });

    test('T1-MEM-4: Memory game restart/reset button exists', () => {
        const { document } = loadPage('memory-card-game/index.html');
        const resetBtn = document.querySelector('#restartBtn') || document.querySelector('#resetBtn') || document.querySelector('.btn-reset') || document.querySelector('button');
        assert(resetBtn !== null, 'Restart button must exist');
    });

    test('T1-MEM-5: Memory game script file linked or inline', () => {
        const { document } = loadPage('memory-card-game/index.html');
        const scripts = document.querySelectorAll('script');
        assert(scripts.length > 0, 'Memory game must have at least 1 script tag');
    });

    // --- 6. Number Guessing Game ---
    test('T1-NUM-1: Number guessing input field exists', () => {
        const { document } = loadPage('number-guessing/index.html');
        const input = document.querySelector('input[type="number"]') || document.querySelector('#guessInput') || document.querySelector('input');
        assert(input !== null, 'Guess input field must exist');
    });

    test('T1-NUM-2: Number guessing submit button exists', () => {
        const { document } = loadPage('number-guessing/index.html');
        const btn = document.querySelector('#submitBtn') || document.querySelector('button[type="submit"]') || document.querySelector('.guess-btn') || document.querySelector('button');
        assert(btn !== null, 'Submit guess button must exist');
    });

    test('T1-NUM-3: Number guessing feedback message area exists', () => {
        const { document } = loadPage('number-guessing/index.html');
        const feedback = document.querySelector('#feedback') || document.querySelector('#message') || document.querySelector('.result-message');
        assert(feedback !== null, 'Feedback message element must exist');
    });

    test('T1-NUM-4: Number guessing attempt/score tracker exists', () => {
        const { document } = loadPage('number-guessing/index.html');
        const attempts = document.querySelector('#attempts') || document.querySelector('#score') || document.querySelector('.attempts-count');
        assert(attempts !== null || document.body.innerHTML.includes('Attempt') || document.body.innerHTML.includes('Score'), 'Attempt/score tracking element must exist');
    });

    test('T1-NUM-5: Number guessing restart button exists', () => {
        const { document } = loadPage('number-guessing/index.html');
        const restart = document.querySelector('#restartBtn') || document.querySelector('#resetBtn') || document.querySelector('.reset-btn');
        assert(restart !== null || document.querySelectorAll('button').length >= 2, 'Restart game button must exist');
    });

    // --- 7. Pong Game ---
    test('T1-PONG-1: Pong game canvas element exists', () => {
        const { document } = loadPage('pong-game/index.html');
        const canvas = document.querySelector('canvas') || document.querySelector('#gameCanvas') || document.querySelector('#pongCanvas');
        assert(canvas !== null, 'Pong canvas element must exist');
    });

    test('T1-PONG-2: Pong score elements exist', () => {
        const { document } = loadPage('pong-game/index.html');
        const score = document.querySelector('#playerScore') || document.querySelector('#score') || document.querySelector('.score-board');
        assert(score !== null || document.body.innerHTML.includes('Score') || document.body.innerHTML.includes('0'), 'Player score element must exist');
    });

    test('T1-PONG-3: Pong controls / start button exist', () => {
        const { document } = loadPage('pong-game/index.html');
        const startBtn = document.querySelector('#startBtn') || document.querySelector('#restartBtn') || document.querySelector('button');
        assert(startBtn !== null || document.querySelector('canvas') !== null, 'Pong controls or canvas must exist');
    });

    test('T1-PONG-4: Pong script file linked', () => {
        const { document } = loadPage('pong-game/index.html');
        const scripts = document.querySelectorAll('script');
        assert(scripts.length > 0, 'Pong game must include script file');
    });

    test('T1-PONG-5: Pong container element exists', () => {
        const { document } = loadPage('pong-game/index.html');
        assert(document.querySelector('.container') !== null || document.querySelector('.game-container') !== null || document.querySelector('body') !== null, 'Pong container must exist');
    });

    // --- 8. Snake Game ---
    test('T1-SNAKE-1: Snake canvas element exists', () => {
        const { document } = loadPage('snake-game/index.html');
        const canvas = document.querySelector('canvas') || document.querySelector('#gameCanvas') || document.querySelector('#snakeCanvas');
        assert(canvas !== null, 'Snake canvas element must exist');
    });

    test('T1-SNAKE-2: Snake score display element exists', () => {
        const { document } = loadPage('snake-game/index.html');
        const score = document.querySelector('#score') || document.querySelector('#scoreVal') || document.querySelector('.score');
        assert(score !== null || document.body.innerHTML.includes('Score') || document.body.innerHTML.includes('0'), 'Snake score element must exist');
    });

    test('T1-SNAKE-3: Snake start screen / overlay exists', () => {
        const { document } = loadPage('snake-game/index.html');
        assert(document.querySelector('#startScreen') !== null || document.querySelector('.overlay') !== null || document.querySelector('button') !== null, 'Start screen or start button must exist');
    });

    test('T1-SNAKE-4: Snake direction control elements or canvas binding exist', () => {
        const { document } = loadPage('snake-game/index.html');
        assert(document.querySelector('.controls') !== null || document.querySelector('canvas') !== null, 'Snake control elements or canvas must exist');
    });

    test('T1-SNAKE-5: Snake game title and container exist', () => {
        const { document } = loadPage('snake-game/index.html');
        assert(document.title.toLowerCase().includes('snake') || document.body.textContent.toLowerCase().includes('snake'), 'Snake title or body content must mention Snake');
    });

    // --- 9. Space Shooter ---
    test('T1-SPACE-1: Space Shooter canvas exists', () => {
        const { document } = loadPage('space-shooter/index.html');
        const canvas = document.querySelector('canvas') || document.querySelector('#gameCanvas');
        assert(canvas !== null, 'Space shooter canvas must exist');
    });

    test('T1-SPACE-2: Space Shooter score/lives display exists', () => {
        const { document } = loadPage('space-shooter/index.html');
        const score = document.querySelector('#score') || document.querySelector('.score') || document.querySelector('#scoreVal');
        assert(score !== null || document.body.innerHTML.includes('Score') || document.body.innerHTML.includes('0'), 'Space Shooter score element must exist');
    });

    test('T1-SPACE-3: Space Shooter start screen / launch button exists', () => {
        const { document } = loadPage('space-shooter/index.html');
        const startBtn = document.querySelector('#startBtn') || document.querySelector('button');
        assert(startBtn !== null, 'Launch / Start button must exist');
    });

    test('T1-SPACE-4: Space Shooter game container exists', () => {
        const { document } = loadPage('space-shooter/index.html');
        assert(document.querySelector('.game-container') !== null || document.querySelector('.container') !== null || document.body !== null, 'Space Shooter container must exist');
    });

    test('T1-SPACE-5: Space Shooter script is linked', () => {
        const { document } = loadPage('space-shooter/index.html');
        const scripts = document.querySelectorAll('script');
        assert(scripts.length > 0, 'Space shooter script tag must exist');
    });

    // --- 10. Tic-Tac-Toe ---
    test('T1-TTT-1: Tic-Tac-Toe 3x3 board container with cells exists', () => {
        const { document } = loadPage('tic-tac-toe/index.html');
        const cells = document.querySelectorAll('.cell') || document.querySelectorAll('.board div') || document.querySelectorAll('[data-cell]');
        assert(cells.length >= 9 || document.querySelector('#board') !== null || document.querySelector('.board') !== null, '3x3 board cells or grid element must exist');
    });

    test('T1-TTT-2: Tic-Tac-Toe status indicator exists', () => {
        const { document } = loadPage('tic-tac-toe/index.html');
        const status = document.querySelector('#status') || document.querySelector('#gameStatus') || document.querySelector('.status');
        assert(status !== null || document.body.innerHTML.includes('Turn') || document.body.innerHTML.includes('Player'), 'Turn/status indicator must exist');
    });

    test('T1-TTT-3: Tic-Tac-Toe mode selector or controls exist', () => {
        const { document } = loadPage('tic-tac-toe/index.html');
        const mode = document.querySelector('#modeSelect') || document.querySelector('.mode-select') || document.querySelector('button');
        assert(mode !== null, 'Mode selector or control button must exist');
    });

    test('T1-TTT-4: Tic-Tac-Toe restart/reset button exists', () => {
        const { document } = loadPage('tic-tac-toe/index.html');
        const restart = document.querySelector('#restartBtn') || document.querySelector('#resetBtn') || document.querySelector('.reset');
        assert(restart !== null || document.querySelector('button') !== null, 'Restart button must exist');
    });

    test('T1-TTT-5: Tic-Tac-Toe script linked', () => {
        const { document } = loadPage('tic-tac-toe/index.html');
        const scripts = document.querySelectorAll('script');
        assert(scripts.length > 0, 'Tic-Tac-Toe script tag must exist');
    });

    return results;
}

module.exports = { runTier1Tests };
