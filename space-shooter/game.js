const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreValue = document.getElementById('scoreValue');
const waveValue = document.getElementById('waveValue');
const highScoreValue = document.getElementById('highScoreValue');
const startBtn = document.getElementById('startBtn');

let player, bullets, enemies, stars, score, highScore, wave, enemiesSpawnedInWave, gameActive, keys;
let audioCtx = null;

// FORCE UNLOCK AUDIO CONTEXT ACROSS BROWSER COMPLIANCE RULES
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playLaserSound() {
    initAudio();
    if (!audioCtx) return;
    let osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(850, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    osc.start(); osc.stop(audioCtx.currentTime + 0.12);
}

function playExplosionSound() {
    initAudio();
    if (!audioCtx) return;
    let osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(30, audioCtx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc.start(); osc.stop(audioCtx.currentTime + 0.25);
}

// CRUNCHY OBSTACLE IMPACT SOUND ENGINE
function playObstacleHitSound() {
    initAudio();
    if (!audioCtx) return;
    let osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(10, audioCtx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.start(); osc.stop(audioCtx.currentTime + 0.4);
}

function playWaveClearSound() {
    initAudio();
    if (!audioCtx) return;
    let notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
        setTimeout(() => {
            if (!gameActive) return;
            let osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'sine'; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
            osc.start(); osc.stop(audioCtx.currentTime + 0.15);
        }, idx * 100);
    });
}

// DRAMATIC RETRO DISAPPOINTMENT SOUND ENGINE
function playGameOverSound() {
    initAudio();
    if (!audioCtx) return;
    let periods = [220, 165, 130, 98]; 
    periods.forEach((freq, idx) => {
        setTimeout(() => {
            let osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(freq - 20, audioCtx.currentTime + 0.22);
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.22);
            osc.start(); osc.stop(audioCtx.currentTime + 0.22);
        }, idx * 220);
    });
}

highScore = localStorage.getItem('spaceShooterHighScore') || 0;
highScoreValue.textContent = highScore;

class Star {
    constructor() {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2; this.speed = Math.random() * 2 + 0.5;
    }
    draw() { ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.random() + ')'; ctx.fillRect(this.x, this.y, this.size, this.size); }
    update() { this.y += this.speed; if (this.y > canvas.height) { this.y = 0; this.x = Math.random() * canvas.width; } }
}

class Player {
    constructor() { this.width = 44; this.height = 32; this.x = canvas.width / 2 - this.width / 2; this.y = canvas.height - 60; this.speed = 6; }
    draw() {
        ctx.fillStyle = '#00e5ff'; ctx.shadowBlur = 10; ctx.shadowColor = '#00e5ff'; ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y); ctx.lineTo(this.x, this.y + this.height); ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
    }
    update() {
        if ((keys['ArrowLeft'] || keys['a'] || mobileLeft) && this.x > 0) this.x -= this.speed;
        if ((keys['ArrowRight'] || keys['d'] || mobileRight) && this.x < canvas.width - this.width) this.x += this.speed;
    }
}

class Bullet {
    constructor(x, y) { this.x = x; this.y = y; this.width = 4; this.height = 12; this.speed = 9; }
    draw() { ctx.fillStyle = '#ff0055'; ctx.shadowBlur = 8; ctx.shadowColor = '#ff0055'; ctx.fillRect(this.x, this.y, this.width, this.height); ctx.shadowBlur = 0; }
    update() { this.y -= this.speed; }
}

class Enemy {
    constructor(speedModifier) {
        this.width = 32; this.height = 26; this.x = Math.random() * (canvas.width - this.width); this.y = -this.height;
        this.speed = (1.5 + Math.random() * 2) * speedModifier; this.color = speedModifier > 1.2 ? '#ff00aa' : '#ffaa00';
    }
    draw() { ctx.fillStyle = this.color; ctx.fillRect(this.x, this.y, this.width, this.height); }
    update() { this.y += this.speed; }
}

stars = [];
for (let i = 0; i < 60; i++) { stars.push(new Star()); }

function init() {
    initAudio(); player = new Player(); bullets = []; enemies = []; score = 0; wave = 1; enemiesSpawnedInWave = 0; keys = {}; gameActive = true;
    scoreValue.textContent = score; waveValue.textContent = wave; startBtn.style.display = 'none'; animate();
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
}

function handleWaves() {
    let maxEnemiesForWave = wave * 10; let speedModifier = 1 + (wave * 0.15);
    if (enemiesSpawnedInWave < maxEnemiesForWave && Math.random() < 0.02 + (wave * 0.005)) {
        enemies.push(new Enemy(speedModifier)); enemiesSpawnedInWave++;
    }
    if (enemiesSpawnedInWave >= maxEnemiesForWave && enemies.length === 0) {
        wave++; enemiesSpawnedInWave = 0; waveValue.textContent = wave; playWaveClearSound();
    }
}

function fireBullet() {
    if (!gameActive) return;
    bullets.push(new Bullet(player.x + player.width / 2 - 2, player.y));
    playLaserSound();
}

function gameOver() {
    gameActive = false; 
    playObstacleHitSound();
    setTimeout(() => { playGameOverSound(); }, 300); 
    if (score > highScore) { highScore = score; localStorage.setItem('spaceShooterHighScore', highScore); highScoreValue.textContent = highScore; }
    ctx.fillStyle = 'rgba(2, 2, 8, 0.85)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff0055'; ctx.font = 'bold 36px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('MISSION FAILED', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillStyle = '#fff'; ctx.font = '16px Segoe UI'; ctx.fillText('FINAL SCORE: ' + score, canvas.width / 2, canvas.height / 2 + 20);
    startBtn.textContent = 'TRY AGAIN'; startBtn.style.display = 'block';
}

function animate() {
    ctx.fillStyle = '#020208'; ctx.fillRect(0, 0, canvas.width, canvas.height); stars.forEach(star => { star.update(); star.draw(); });
    if (!gameActive) return;
    player.update(); player.draw(); handleWaves();
    bullets.forEach((bullet, bIndex) => { bullet.update(); bullet.draw(); if (bullet.y + bullet.height < 0) bullets.splice(bIndex, 1); });
    enemies.forEach((enemy, eIndex) => {
        enemy.update(); enemy.draw();
        if (checkCollision(player, enemy)) { gameOver(); }
        bullets.forEach((bullet, bIndex) => {
            if (checkCollision(bullet, enemy)) { playExplosionSound(); enemies.splice(eIndex, 1); bullets.splice(bIndex, 1); score += 10; scoreValue.textContent = score; }
        });
        if (enemy.y > canvas.height) enemies.splice(eIndex, 1);
    });
    requestAnimationFrame(animate);
}

// Input Event Triggers Configurations Hooks
window.addEventListener('keydown', e => { 
    initAudio();
    keys[e.key] = true; 
    if (e.key === ' ' || e.key === 'Spacebar') fireBullet(); 
});
window.addEventListener('keyup', e => keys[e.key] = false);

// Touch Mechanics Variables and Mapping Handlers Hooks
let mobileLeft = false, mobileRight = false;
const bindTouch = (el, pressCallback, releaseCallback) => {
    el.addEventListener('touchstart', (e) => { e.preventDefault(); initAudio(); pressCallback(); });
    el.addEventListener('touchend', (e) => { e.preventDefault(); releaseCallback(); });
    el.addEventListener('mousedown', (e) => { initAudio(); pressCallback(); });
    el.addEventListener('mouseup', releaseCallback); el.addEventListener('mouseleave', releaseCallback);
};

bindTouch(document.getElementById('btnLeft'), () => mobileLeft = true, () => mobileLeft = false);
bindTouch(document.getElementById('btnRight'), () => mobileRight = true, () => mobileRight = false);

const fireBtn = document.getElementById('btnFire');
fireBtn.addEventListener('touchstart', (e) => { e.preventDefault(); initAudio(); fireBullet(); });
fireBtn.addEventListener('mousedown', (e) => { initAudio(); fireBullet(); });

startBtn.addEventListener('click', () => {
    initAudio();
    init();
});