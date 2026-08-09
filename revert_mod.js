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

directories.forEach(dir => {
    const indexPath = path.join(__dirname, dir, 'index.html');
    if (fs.existsSync(indexPath)) {
        let content = fs.readFileSync(indexPath, 'utf8');
        // Remove injection
        content = content.replace(/<!-- BEGIN FULLSCREEN MOD -->[\s\S]*?<!-- END FULLSCREEN MOD -->\n?/g, '');
        fs.writeFileSync(indexPath, content);
        console.log(`Reverted ${dir}/index.html`);
    }
});
