const fs = require('fs');
const path = require('path');

const directories = [
    'cyber-runner',
    'endless-runner',
    'space-shooter',
    'pong-game',
    'snake-game',
    'chess-game-3d',
    'memory-card-game',
    'tic-tac-toe',
    'number-guessing'
];

const injectHTML = `
<style>
/* Safe Fullscreen Scaling Mod V2 */
html {
    margin: 0 !important;
    padding: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    overflow: hidden !important;
}

body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    overflow: hidden !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
}

body > .arcade-back-btn {
    position: absolute !important;
    top: 10px !important;
    left: 10px !important;
    z-index: 10000 !important;
}

.game-container, .container {
    transform-origin: center;
    margin: 0 !important;
}
</style>
<script>
function safeScale() {
    const container = document.querySelector('.game-container, .container');
    if (!container) return;
    
    container.style.transform = 'none';
    const rect = container.getBoundingClientRect();
    const cw = rect.width || 800;
    const ch = rect.height || 600;
    
    let padding = 10;
    const scaleX = window.innerWidth / (cw + padding);
    const scaleY = window.innerHeight / (ch + padding);
    
    const scale = Math.min(scaleX, scaleY);
    container.style.transform = \`scale(\${scale})\`;
}
window.addEventListener('resize', safeScale);
window.addEventListener('orientationchange', safeScale);
window.addEventListener('DOMContentLoaded', safeScale);
window.addEventListener('load', safeScale);
setTimeout(safeScale, 500);
</script>
`;

directories.forEach(dir => {
    const indexPath = path.join(__dirname, dir, 'index.html');
    if (fs.existsSync(indexPath)) {
        let content = fs.readFileSync(indexPath, 'utf8');
        content = content.replace(/<!-- BEGIN FULLSCREEN SCALING -->[\s\S]*?<!-- END FULLSCREEN SCALING -->\n?/g, '');
        content = content.replace('</head>', `<!-- BEGIN FULLSCREEN SCALING -->\n${injectHTML}\n<!-- END FULLSCREEN SCALING -->\n</head>`);
        fs.writeFileSync(indexPath, content);
        console.log(`Updated ${dir}/index.html`);
    }
});
