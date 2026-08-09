const fs = require('fs');
const path = require('path');

const directories = [
    'chess-game-3d',
    'cyber-runner',
    'endless-runner',
    'memory-card-game',
    'number-guessing',
    'pong-game',
    'snake-game',
    'space-shooter',
    'tic-tac-toe'
];

const injectHTML = `
<style>
/* Injected by Fullscreen Mod */
html, body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    overflow: hidden !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    background-color: var(--bg-color, #0b0f19) !important;
}

body > .arcade-back-btn {
    z-index: 10000;
}

#gameCanvas, canvas {
    max-width: 100vw !important;
    max-height: 100vh !important;
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
}

.container, .game-container {
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100% !important;
    max-height: 100% !important;
    border-radius: 0 !important;
    box-sizing: border-box !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
    border: none !important;
}
</style>
<script>
// Auto-scale content for portrait and landscape
function adjustScale() {
    const containers = document.querySelectorAll('.container, .game-container, canvas');
    containers.forEach(el => {
        // Just let CSS handle the full width/height
    });
}
window.addEventListener('resize', adjustScale);
window.addEventListener('orientationchange', adjustScale);
adjustScale();
</script>
`;

directories.forEach(dir => {
    const indexPath = path.join(__dirname, dir, 'index.html');
    if (fs.existsSync(indexPath)) {
        let content = fs.readFileSync(indexPath, 'utf8');
        
        // Remove old injection if exists
        content = content.replace(/<!-- BEGIN FULLSCREEN MOD -->[\s\S]*?<!-- END FULLSCREEN MOD -->\n?/g, '');
        
        // Insert before </head>
        content = content.replace('</head>', `<!-- BEGIN FULLSCREEN MOD -->\n${injectHTML}\n<!-- END FULLSCREEN MOD -->\n</head>`);
        
        fs.writeFileSync(indexPath, content);
        console.log(`Updated ${dir}/index.html`);
    }
});
