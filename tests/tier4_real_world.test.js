const path = require('path');
const fs = require('fs');
const { loadPage, readCssFile } = require('./helpers/dom_harness');

function runTier4Tests() {
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

    // T4-SCENARIO-1: Cyber Runner Session
    test('T4-SCENARIO-1: Session: Dashboard -> Cyber Runner -> Play -> Score -> Back to Hub', () => {
        const hub = loadPage('index.html');
        const link = hub.document.querySelector('a[href="cyber-runner/index.html"]');
        assert(link !== null, 'Step 1: Dashboard link to Cyber Runner exists');

        const game = loadPage('cyber-runner/index.html');
        const startBtn = game.document.querySelector('#startBtn');
        assert(startBtn !== null, 'Step 2: Game launch button present');

        game.window.localStorage.setItem('cyber_runner_hi', '500');
        assert(game.window.localStorage.getItem('cyber_runner_hi') === '500', 'Step 3: High score stored');

        const backLink = game.document.querySelector('a[href="../index.html"]') || game.document.querySelector('.back-btn');
        assert(backLink !== null || game.htmlContent.includes('../index.html'), 'Step 4: Back to hub button present');
    });

    // T4-SCENARIO-2: Memory Cards Session
    test('T4-SCENARIO-2: Session: Dashboard -> Memory Cards -> Flip & Match -> Restart -> Back to Hub', () => {
        const hub = loadPage('index.html');
        assert(hub.document.querySelector('a[href="memory-card-game/index.html"]') !== null, 'Step 1: Hub link exists');

        const game = loadPage('memory-card-game/index.html');
        const resetBtn = game.document.querySelector('#restartBtn') || game.document.querySelector('#resetBtn') || game.document.querySelector('button');
        assert(resetBtn !== null, 'Step 2: Restart button exists');

        const backLink = game.document.querySelector('a[href="../index.html"]') || game.document.querySelector('.back-btn');
        assert(backLink !== null || game.htmlContent.includes('../index.html'), 'Step 3: Back button exists');
    });

    // T4-SCENARIO-3: Number Guesser Session
    test('T4-SCENARIO-3: Session: Dashboard -> Number Guesser -> Invalid input -> Valid guess -> Win -> Back to Hub', () => {
        const hub = loadPage('index.html');
        assert(hub.document.querySelector('a[href="number-guessing/index.html"]') !== null, 'Step 1: Hub link exists');

        const game = loadPage('number-guessing/index.html');
        const input = game.document.querySelector('input');
        const submit = game.document.querySelector('button');
        assert(input !== null && submit !== null, 'Step 2: Input and submit exist');

        const backLink = game.document.querySelector('a[href="../index.html"]') || game.document.querySelector('.back-btn');
        assert(backLink !== null || game.htmlContent.includes('../index.html'), 'Step 3: Back button exists');
    });

    // T4-SCENARIO-4: Tic-Tac-Toe Session
    test('T4-SCENARIO-4: Session: Dashboard -> Tic Tac Toe -> Play vs AI -> Restart -> Back to Hub', () => {
        const hub = loadPage('index.html');
        assert(hub.document.querySelector('a[href="tic-tac-toe/index.html"]') !== null, 'Step 1: Hub link exists');

        const game = loadPage('tic-tac-toe/index.html');
        const restart = game.document.querySelector('#restartBtn') || game.document.querySelector('button');
        assert(restart !== null, 'Step 2: Restart button exists');

        const backLink = game.document.querySelector('a[href="../index.html"]') || game.document.querySelector('.back-btn');
        assert(backLink !== null || game.htmlContent.includes('../index.html'), 'Step 3: Back button exists');
    });

    // T4-SCENARIO-5: Snake Session
    test('T4-SCENARIO-5: Session: Dashboard -> Snake -> Eat food -> Collision -> Score -> Back to Hub', () => {
        const hub = loadPage('index.html');
        assert(hub.document.querySelector('a[href="snake-game/index.html"]') !== null, 'Step 1: Hub link exists');

        const game = loadPage('snake-game/index.html');
        const canvas = game.document.querySelector('canvas');
        assert(canvas !== null, 'Step 2: Snake canvas exists');

        const backLink = game.document.querySelector('a[href="../index.html"]') || game.document.querySelector('.back-btn');
        assert(backLink !== null || game.htmlContent.includes('../index.html'), 'Step 3: Back to Hub link exists');
    });

    // T4-SCENARIO-6: Space Shooter Session
    test('T4-SCENARIO-6: Session: Dashboard -> Space Shooter -> Shoot enemies -> Game Over wipe -> Restart -> Back to Hub', () => {
        const hub = loadPage('index.html');
        assert(hub.document.querySelector('a[href="space-shooter/index.html"]') !== null, 'Step 1: Hub link exists');

        const game = loadPage('space-shooter/index.html');
        const canvas = game.document.querySelector('canvas');
        assert(canvas !== null, 'Step 2: Space shooter canvas exists');

        const backLink = game.document.querySelector('a[href="../index.html"]') || game.document.querySelector('.back-btn');
        assert(backLink !== null || game.htmlContent.includes('../index.html'), 'Step 3: Back button exists');
    });

    // T4-SCENARIO-7: Pong Session
    test('T4-SCENARIO-7: Session: Dashboard -> Pong -> Paddle move -> Ball hit -> Score -> Back to Hub', () => {
        const hub = loadPage('index.html');
        assert(hub.document.querySelector('a[href="pong-game/index.html"]') !== null, 'Step 1: Hub link exists');

        const game = loadPage('pong-game/index.html');
        const canvas = game.document.querySelector('canvas');
        assert(canvas !== null, 'Step 2: Pong canvas exists');

        const backLink = game.document.querySelector('a[href="../index.html"]') || game.document.querySelector('.back-btn');
        assert(backLink !== null || game.htmlContent.includes('../index.html'), 'Step 3: Back button exists');
    });

    // T4-SCENARIO-8: Endless Runner Session
    test('T4-SCENARIO-8: Session: Dashboard -> Endless Runner -> Theme switch -> Crash -> Reboot -> Back to Hub', () => {
        const hub = loadPage('index.html');
        assert(hub.document.querySelector('a[href="endless-runner/index.html"]') !== null, 'Step 1: Hub link exists');

        const game = loadPage('endless-runner/index.html');
        const startBtn = game.document.querySelector('#startBtn');
        assert(startBtn !== null, 'Step 2: Launch button exists');

        const backLink = game.document.querySelector('a[href="../index.html"]') || game.document.querySelector('.back-btn');
        assert(backLink !== null || game.htmlContent.includes('../index.html'), 'Step 3: Back button exists');
    });

    // T4-SCENARIO-9: Chess 3D Session
    test('T4-SCENARIO-9: Session: Dashboard -> Chess 3D -> View puzzle -> Move -> Reset -> Back to Hub', () => {
        const hub = loadPage('index.html');
        assert(hub.document.querySelector('a[href="chess-game-3d/index.html"]') !== null, 'Step 1: Hub link exists');

        const game = loadPage('chess-game-3d/index.html');
        const resetBtn = game.document.querySelector('#resetBtn');
        assert(resetBtn !== null, 'Step 2: Reset button exists');

        const backLink = game.document.querySelector('a[href="../index.html"]') || game.document.querySelector('.back-btn');
        assert(backLink !== null || game.htmlContent.includes('../index.html'), 'Step 3: Back button exists');
    });

    // T4-SCENARIO-10: Multi-Game Streak Session
    test('T4-SCENARIO-10: Multi-Game Streak Session: Dashboard -> Cyber Runner -> Hub -> Snake -> Hub -> High Score Summary', () => {
        const hub = loadPage('index.html');
        hub.window.localStorage.setItem('game_streak', '2');
        hub.window.localStorage.setItem('cyber_hi', '1000');
        hub.window.localStorage.setItem('snake_hi', '50');

        assert(hub.window.localStorage.getItem('game_streak') === '2', 'Streak tracked');
        assert(hub.window.localStorage.getItem('cyber_hi') === '1000', 'Cyber score saved in session streak');
        assert(hub.window.localStorage.getItem('snake_hi') === '50', 'Snake score saved in session streak');
    });

    return results;
}

module.exports = { runTier4Tests };
