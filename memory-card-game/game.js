const gridContainer = document.getElementById('gridContainer');
const movesValue = document.getElementById('movesValue');
const timerValue = document.getElementById('timerValue');
const restartBtn = document.getElementById('restartBtn');
const winModal = document.getElementById('winModal');
const finalMoves = document.getElementById('finalMoves');
const finalTime = document.getElementById('finalTime');
const modalBtn = document.getElementById('modalBtn');

const items = ['🛸', '🚀', '👾', '🌀', '🛰️', '☄️', '💎', '🛡️'];
let cardsArray = [...items, ...items];
let hasFlippedCard = false, lockBoard = false, firstCard, secondCard;
let moves = 0, seconds = 0, timerInterval = null, gameStarted = false, matchedPairs = 0;

let audioCtx = null;

function initAudioEngine() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playFlipSound() {
    if (!audioCtx) return;
    let osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

function playMatchSound() {
    if (!audioCtx) return;
    let now = audioCtx.currentTime;
    
    let osc1 = audioCtx.createOscillator(), gain1 = audioCtx.createGain();
    osc1.connect(gain1); gain1.connect(audioCtx.destination);
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.1, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.start(now); osc1.stop(now + 0.15);

    let osc2 = audioCtx.createOscillator(), gain2 = audioCtx.createGain();
    osc2.connect(gain2); gain2.connect(audioCtx.destination);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(659.25, now + 0.08);
    gain2.gain.setValueAtTime(0.1, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.start(now + 0.08); osc2.stop(now + 0.25);
}

function playWinFanfare() {
    if (!audioCtx) return;
    let now = audioCtx.currentTime;
    let notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
    
    notes.forEach((freq, index) => {
        let osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + (index * 0.08));
        gain.gain.setValueAtTime(0.08, now + (index * 0.08));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (index * 0.08) + 0.3);
        osc.start(now + (index * 0.08)); osc.stop(now + (index * 0.08) + 0.3);
    });
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createBoard() {
    gridContainer.innerHTML = '';
    const shuffled = shuffle([...cardsArray]);
    shuffled.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card'); card.dataset.name = item;
        card.innerHTML = `<div class="card-face card-back"></div><div class="card-face card-front">${item}</div>`;
        card.addEventListener('click', flipCard);
        gridContainer.appendChild(card);
    });
}

function flipCard() {
    initAudioEngine();
    if (!gameStarted) { 
        clearInterval(timerInterval); 
        timerInterval = setInterval(() => { 
            seconds++; 
            timerValue.textContent = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`; 
        }, 1000); 
        gameStarted = true; 
        restartBtn.textContent = "RESET MATRIX"; 
    }
    if (lockBoard || this === firstCard || this.classList.contains('flipped')) return;
    
    this.classList.add('flipped'); 
    playFlipSound();
    
    if (!hasFlippedCard) { hasFlippedCard = true; firstCard = this; return; }
    secondCard = this; moves++; movesValue.textContent = moves;
    
    if (firstCard.dataset.name === secondCard.dataset.name) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.classList.add('matched'); secondCard.classList.add('matched');
    firstCard.removeEventListener('click', flipCard); secondCard.removeEventListener('click', flipCard);
    matchedPairs++; 
    
    playMatchSound();

    if (matchedPairs === items.length) { 
        clearInterval(timerInterval); 
        setTimeout(() => { playWinFanfare(); }, 200);
        setTimeout(() => { 
            finalMoves.textContent = moves; 
            finalTime.textContent = timerValue.textContent; 
            winModal.style.display = 'flex'; 
        }, 1000); 
    }
    resetTurn();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => { 
        firstCard.classList.remove('flipped'); 
        secondCard.classList.remove('flipped'); 
        resetTurn();
    }, 1000);
}

function resetTurn() {
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
}

function resetGame() { 
    initAudioEngine();
    clearInterval(timerInterval); 
    gameStarted = false; 
    matchedPairs = 0; 
    moves = 0; 
    seconds = 0; 
    movesValue.textContent = '0'; 
    timerValue.textContent = '00:00'; 
    restartBtn.textContent = "START GAME"; 
    winModal.style.display = 'none'; 
    resetTurn(); 
    createBoard(); 
}

restartBtn.addEventListener('click', resetGame); 
modalBtn.addEventListener('click', resetGame);
createBoard();
