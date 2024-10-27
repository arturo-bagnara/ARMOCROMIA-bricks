const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions for mobile vertical layout
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;

let ballRadius = 8;
let x = canvas.width / 2;
let y = canvas.height - 40;
let dx = 2;
let dy = -2;

const paddleHeight = 10;
const paddleWidth = 70; // 70
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;

// Configurable settings
const chaosModeTime = 5000; // Time in milliseconds before CHAOS MODE starts (editable)
let chaosMode = false; // Flag for CHAOS MODE
let chaosIntensity = 0.00001; // Starting probability for bricks to start falling
let gameWon = false;
let gameLost = false;

// Load the background image
const backgroundImage = new Image();
backgroundImage.src = 'WALL/text1.png';

// Letter effects configuration
const letterDuration = 3000; // Duration each letter appears on screen (in ms)
const letterInterval = 100; // Interval between each letter appearance (in ms, adjustable)
const letters = [];
const chaosMessage = "Chaos Mode!!";

// Text messages for random effects
const randomMessages = [
    "stai andando benissimo ciccioooo",
    "porcoddue sei fortissimo",
    "yoooo mad skills bro",
    "pave x baggy lesgoooo",
    "A********A",
    "ma quando esce l'ep?",
    "ci saranno 5 tracce!",
    "ma come si chiama l'ep?",
    "nome progetto?",
    "wooooooooowwwwwwww",
    "ti piace il giochino? daaaaaai",
    "@skumbaggy",
    "@_p_a_v_e_",
    "ci segui su spoty fratm?"
];

// Sound effects
const hitPlayerSound = new Audio('sound_effects/hit_player.mp3');
const hitBrickSound = new Audio('sound_effects/hit_brick.mp3');
const chaosModeSound = new Audio('sound_effects/chaos_mode.mp3');
const gameOverSound = new Audio('sound_effects/game_over.mp3');
const winSound = new Audio('sound_effects/win.mp3');
const backgroundMusic = new Audio('sound_effects/soundtrack.mp3');

// Play background music in a loop
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;
backgroundMusic.play();

// Brick properties
const brickRowCount = 9;
const brickColumnCount = Math.floor(canvas.width / 30);
const brickWidth = (canvas.width - 20) / brickColumnCount;
const brickHeight = 15;
const brickPadding = 5;
const brickOffsetTop = 30;
const brickOffsetLeft = 10;

let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1, dy: 0, color: '#FFFFFF' };
    }
}

let score = 0;

// Start the timer for CHAOS MODE
setTimeout(() => {
    chaosMode = true;
    chaosModeSound.play();
    increaseChaosIntensity();
    triggerRandomMessage("chaos mode!");
    startRandomMessages();
}, chaosModeTime);

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(event) {
    if (event.key === 'Right' || event.key === 'ArrowRight') {
        rightPressed = true;
    } else if (event.key === 'Left' || event.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(event) {
    if (event.key === 'Right' || event.key === 'ArrowRight') {
        rightPressed = false;
    } else if (event.key === 'Left' || event.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function collisionDetection() {
    let bricksRemaining = 0;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            // Only count bricks that are visible on the canvas and have not fallen below
            if (b.status === 1 && b.y < canvas.height) {
                bricksRemaining++;
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0; // Mark the brick as destroyed
                    score++;
                    hitBrickSound.play();
                }
            }
        }
    }
    if (bricksRemaining === 0 && !gameLost) winGame();
}

function winGame() {
    gameWon = true;
    winSound.play();
    backgroundMusic.pause();
    dx = 0; dy = 0; // Stop the ball
}

function gameOver() {
    gameLost = true;
    gameOverSound.play();
    backgroundMusic.pause();

    // Create a GAME OVER overlay with RETRY button
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = 'white';
    overlay.style.fontFamily = 'VT323';
    overlay.style.zIndex = '10';

    // GAME OVER Text
    const gameOverText = document.createElement('h1');
    gameOverText.textContent = 'GAME OVER ):';
    gameOverText.style.fontSize = '48px';
    gameOverText.style.margin = '20px';
    overlay.appendChild(gameOverText);

    // RETRY Button
    const retryButton = document.createElement('button');
    retryButton.textContent = 'Provaci ancora ciccio';
    retryButton.style.padding = '10px 20px';
    retryButton.style.fontSize = '24px';
    retryButton.style.fontFamily = 'VT323';
    retryButton.style.backgroundColor = '#ffffff';
    retryButton.style.color = '#000000';
    retryButton.style.border = '2px solid #ffffff';
    retryButton.style.cursor = 'pointer';

    retryButton.onclick = () => {
        location.reload();
    };

    overlay.appendChild(retryButton);
    document.body.appendChild(overlay);
}

function drawBall() {
    if (!gameWon && !gameLost) {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.closePath();
    }
}

function drawPaddle() {
    if (!gameWon && !gameLost) {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.closePath();
    }
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                // Check for CHAOS MODE and randomize brick drop
                if (chaosMode && Math.random() < chaosIntensity) {
                    b.dy = 1; // Start falling
                }
                // Update the brick’s Y position if it's falling
                if (b.dy > 0) {
                    b.y += b.dy;
                    b.color = getRandomColor(); // Change color as it falls
                }

                // Calculate brick position with offset for alternating rows
                const offset = (r % 2 === 0) ? brickWidth / 2 : 0;
                b.x = c * (brickWidth + brickPadding) + brickOffsetLeft + offset;
                b.y = b.y || r * (brickHeight + brickPadding) + brickOffsetTop;

                // Draw the brick with updated color
                ctx.beginPath();
                ctx.rect(b.x, b.y, brickWidth, brickHeight);
                ctx.fillStyle = b.color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function increaseChaosIntensity() {
    if (chaosIntensity < 0.05) {
        chaosIntensity *= 1.3;
        setTimeout(increaseChaosIntensity, 2000);
    }
}

function getRandomColor() {
    const colors = [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
        '#FFA500', '#FFC0CB', '#800080', '#FFFFFF', '#FFD700'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}


// Trigger a modular message effect at ball position
function triggerRandomMessage(text) {
    text.split('').forEach((char, i) => {
        setTimeout(() => {
            letters.push({
                text: char,
                x: x, // Position at current ball location
                y: y,
                opacity: 1.0,
                startTime: Date.now()
            });
        }, i * letterInterval); // Display each letter with interval delay
    });
}

// Periodically display random messages
function startRandomMessages() {
    function scheduleNextMessage() {
        const delay = Math.random() * (10000 - 5000) + 5000; // 5-10 seconds
        setTimeout(() => {
            const randomText = randomMessages[Math.floor(Math.random() * randomMessages.length)];
            triggerRandomMessage(randomText); // Display a random message
            scheduleNextMessage(); // Schedule the next message
        }, delay);
    }
    scheduleNextMessage();
}

function drawLetters() {
    ctx.font = '21px VT323'; // Font size and VT323 font
    ctx.textAlign = 'center';
    letters.forEach((letter, index) => {
        const elapsed = Date.now() - letter.startTime;
        if (elapsed < letterDuration) {
            ctx.globalAlpha = 1 - (elapsed / letterDuration); // Fade effect
            ctx.fillStyle = 'white';
            ctx.fillText(letter.text, letter.x, letter.y);
        } else {
            letters.splice(index, 1); // Remove letter after duration
        }
    });
    ctx.globalAlpha = 1.0; // Reset opacity
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Score: ' + score, 8, 20);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameLost) return; // Stop drawing if the game is lost

    // Draw game elements
    ctx.drawImage(backgroundImage, 65, -35, canvas.width * 0.85, canvas.height * 0.85);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLetters();
    collisionDetection();

    // Ball movement and collision logic
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
    if (y + dy < ballRadius) dy = -dy;
    else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
            hitPlayerSound.play();
        } else gameOver();
    }

    // Paddle movement logic
    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 5;
    else if (leftPressed && paddleX > 0) paddleX -= 5;

    x += dx;
    y += dy;

    // Check for game win condition
    if (gameWon) {
        // Draw "YOU WIN!" text directly over the game background
        ctx.font = '48px VT323';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Grande, hai spaccato! ;)', canvas.width / 2, canvas.height / 1.5);

        return; // Stop further drawing in this frame
    }

    requestAnimationFrame(draw); // Continue drawing loop
}


// Wait for the background image to load before starting the game
backgroundImage.onload = draw;
