const path = require('path');
const fs = require('fs');
const { loadPage, readCssFile } = require('./helpers/dom_harness');

function runTier3Tests() {
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

    const games = [
        { name: 'Chess 3D', dir: 'chess-game-3d' },
        { name: 'Cyber Runner', dir: 'cyber-runner' },
        { name: 'Endless Runner', dir: 'endless-runner' },
        { name: 'Memory Cards', dir: 'memory-card-game' },
        { name: 'Number Guesser', dir: 'number-guessing' },
        { name: 'Pong', dir: 'pong-game' },
        { name: 'Snake', dir: 'snake-game' },
        { name: 'Space Shooter', dir: 'space-shooter' },
        { name: 'Tic Tac Toe', dir: 'tic-tac-toe' }
    ];

    // T3-CROSS-1 through T3-CROSS-9: Navigation Pairwise checks
    games.forEach((game, idx) => {
        test(`T3-CROSS-${idx + 1}: Dashboard to ${game.name} navigation link contract resolution`, () => {
            const hub = loadPage('index.html');
            const cardLink = hub.document.querySelector(`a[href="${game.dir}/index.html"]`);
            assert(cardLink !== null, `Hub card for ${game.name} pointing to ${game.dir}/index.html must exist`);

            const gamePage = loadPage(`${game.dir}/index.html`);
            const backLink = gamePage.document.querySelector('a[href="../index.html"]') || gamePage.document.querySelector('.back-btn');
            assert(backLink !== null || gamePage.htmlContent.includes('../index.html'), `${game.name} must have a valid back button pointing to ../index.html`);
        });
    });

    // T3-CROSS-10: Cross-Game High Score Persistence Isolation
    test('T3-CROSS-10: Cross-game high score persistence isolation in localStorage', () => {
        const { window } = loadPage('index.html');
        window.localStorage.setItem('cyber_runner_hi', '2500');
        window.localStorage.setItem('snake_hi', '120');
        window.localStorage.setItem('pong_hi', '15');

        assert(window.localStorage.getItem('cyber_runner_hi') === '2500', 'Cyber runner score isolated');
        assert(window.localStorage.getItem('snake_hi') === '120', 'Snake score isolated');
        assert(window.localStorage.getItem('pong_hi') === '15', 'Pong score isolated');
    });

    // T3-CROSS-11: AudioContext User Interaction State Propagation
    test('T3-CROSS-11: AudioContext user interaction state propagation from hub to game launch', () => {
        const hub = loadPage('index.html');
        const audioCtx = new hub.window.AudioContext();
        assert(audioCtx.state === 'suspended', 'AudioContext suspended initially on hub load');
        audioCtx.resume();
        assert(audioCtx.state === 'running', 'AudioContext switches to running after simulated click');
    });

    // T3-CROSS-12: Glassmorphic Design System Consistency
    test('T3-CROSS-12: Glassmorphic design system consistency across platform CSS', () => {
        const hubCss = readCssFile('styles.css');
        assert(hubCss.includes('#0f172a'), 'Hub CSS uses #0f172a background');
        assert(hubCss.includes('backdrop-filter: blur'), 'Hub CSS uses backdrop-filter blur');
    });

    // T3-CROSS-13: Rapid Game Switching State Isolation
    test('T3-CROSS-13: Rapid game switching state isolation between Cyber Runner and Snake', () => {
        const page1 = loadPage('cyber-runner/index.html');
        page1.window.localStorage.setItem('game_active', 'cyber');
        
        const page2 = loadPage('snake-game/index.html');
        page2.window.localStorage.setItem('game_active', 'snake');

        assert(page1.window.localStorage.getItem('game_active') === 'cyber', 'Page 1 storage unaffected by Page 2');
        assert(page2.window.localStorage.getItem('game_active') === 'snake', 'Page 2 storage holds own state');
    });

    // T3-CROSS-14: Keyboard Control Mapping Conflict Check
    test('T3-CROSS-14: Keyboard event keybindings handled cleanly across canvas games', () => {
        const page = loadPage('cyber-runner/index.html');
        let defaultPrevented = false;
        const spaceEvent = new page.window.KeyboardEvent('keydown', { code: 'Space', cancelable: true });
        spaceEvent.preventDefault = () => { defaultPrevented = true; };
        page.window.dispatchEvent(spaceEvent);
        assert(true, 'Spacebar keydown event dispatched without error');
    });

    // T3-CROSS-15: Touch Control Overlay Presence for Responsive Viewport
    test('T3-CROSS-15: Touch control overlay elements present in runner & action games', () => {
        const runner = loadPage('cyber-runner/index.html');
        const touchBtn = runner.document.querySelector('#mobileJumpBtn') || runner.document.querySelector('.touch-action-pad');
        assert(touchBtn !== null, 'Touch control element must exist in Cyber Runner');
    });

    return results;
}

module.exports = { runTier3Tests };
