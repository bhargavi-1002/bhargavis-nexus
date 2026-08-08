// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 15;
const paddleHeight = 100;
const ballSize = 8;
const ballSpeed = 6;
const maxBallSpeed = 10;

// Paddles
const leftPaddle = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 8,
    color: '#00ff88'
};

const rightPaddle = {
    x: canvas.width - 20 - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6,
    color: '#ff006e'
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: ballSpeed,
    dy: ballSpeed,
    size: ballSize,
    color: '#ffffff'
};

// Game state
let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse control for left paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    leftPaddle.y = Math.max(0, Math.min(y - paddleHeight / 2, canvas.height - paddleHeight));
});

// Button controls
document.getElementById('startBtn').addEventListener('click', () => {
    gameRunning = !gameRunning;
    document.getElementById('startBtn').textContent = gameRunning ? 'Pause Game' : 'Resume Game';
});

document.getElementById('resetBtn').addEventListener('click', () => {
    playerScore = 0;
    computerScore = 0;
    gameRunning = false;
    updateScore();
    document.getElementById('startBtn').textContent = 'Start Game';
    resetBall();
});

// Update player paddle with arrow keys
function updatePlayerPaddle() {
    if (keys['ArrowUp']) {
        leftPaddle.y = Math.max(0, leftPaddle.y - leftPaddle.speed);
    }
    if (keys['ArrowDown']) {
        leftPaddle.y = Math.min(canvas.height - paddleHeight, leftPaddle.y + leftPaddle.speed);
    }
}

// Update computer paddle AI
function updateComputerPaddle() {
    const computerCenter = rightPaddle.y + paddleHeight / 2;
    
    // Simple AI: follow the ball with some lag
    if (computerCenter < ball.y - 35) {
        rightPaddle.y = Math.min(canvas.height - paddleHeight, rightPaddle.y + rightPaddle.speed);
    } else if (computerCenter > ball.y + 35) {
        rightPaddle.y = Math.max(0, rightPaddle.y - rightPaddle.speed);
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom collision
    if (ball.y - ball.size <= 0 || ball.y + ball.size >= canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.size <= 0 ? ball.size : canvas.height - ball.size;
    }

    // Left paddle collision
    if (
        ball.x - ball.size <= leftPaddle.x + leftPaddle.width &&
        ball.y >= leftPaddle.y &&
        ball.y <= leftPaddle.y + leftPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = leftPaddle.x + leftPaddle.width + ball.size;
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - leftPaddle.y) / paddleHeight - 0.5;
        ball.dy += hitPos * 4;
    }

    // Right paddle collision
    if (
        ball.x + ball.size >= rightPaddle.x &&
        ball.y >= rightPaddle.y &&
        ball.y <= rightPaddle.y + rightPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = rightPaddle.x - ball.size;
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - rightPaddle.y) / paddleHeight - 0.5;
        ball.dy += hitPos * 4;
    }

    // Limit ball speed
    const speed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
    if (speed > maxBallSpeed) {
        ball.dx = (ball.dx / speed) * maxBallSpeed;
        ball.dy = (ball.dy / speed) * maxBallSpeed;
    }

    // Scoring
    if (ball.x - ball.size < 0) {
        computerScore++;
        updateScore();
        resetBall();
    } else if (ball.x + ball.size > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
    ball.dy = (Math.random() - 0.5) * ballSpeed;
    gameRunning = false;
    document.getElementById('startBtn').textContent = 'Start Game';
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Glow effect
    ctx.shadowColor = paddle.color;
    ctx.shadowBlur = 15;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.fillStyle = ball.color;
    ctx.shadowColor = ball.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawCenterLine();
    drawPaddle(leftPaddle);
    drawPaddle(rightPaddle);
    drawBall();
}

// Game loop
function gameLoop() {
    if (gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize
updateScore();
resetBall();
gameLoop();