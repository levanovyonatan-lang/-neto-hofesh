// --- Dino School Runner Mini-Game ---
// A T-Rex styled endless runner with school obstacles.

(function() {
    const OBSTACLES = ['📓', '📚', '📝', '🏫', '📐', '✏️'];
    const GAME_SPEED_START = 4;
    const JUMP_FORCE = -10;
    const GRAVITY = 0.6;
    
    let isGameActive = false;
    let score = 0;
    let gameLoopId = null;
    let triggerBtn = null;
    let scoreDisplay = null;
    let gameContainer = null;
    let groundLine = null;
    let dino = null;
    
    // Physics & State
    let dinoY = 0;
    let dinoVelocity = 0;
    let isJumping = false;
    let obstaclesList = [];
    let gameSpeed = GAME_SPEED_START;
    let frameCount = 0;
    let isGameOver = false;

    // trigger button logic removed

    function startGame() {
        if (isGameActive) return;
        isGameActive = true;
        isGameOver = false;
        score = 0;
        gameSpeed = GAME_SPEED_START;
        obstaclesList = [];
        frameCount = 0;

        if (navigator.vibrate) navigator.vibrate([30]);

        const timerCard = document.getElementById('main-timer-bg');
        if (!timerCard) { isGameActive = false; return; }

        gameContainer = timerCard;
        
        const currentHeight = gameContainer.getBoundingClientRect().height;
        gameContainer.dataset.hwPrevHeight = gameContainer.style.height || '';
        gameContainer.style.height = '200px';

        gameContainer.style.position = 'relative';
        gameContainer.style.overflow = 'hidden';
        gameContainer.dataset.hwPrevZIndex = gameContainer.style.zIndex || '';
        gameContainer.style.zIndex = '1000';

        let overlay = document.getElementById('game-lock-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'game-lock-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.zIndex = '999';
            overlay.style.background = 'rgba(0,0,0,0.6)';
            overlay.style.backdropFilter = 'blur(3px)';
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            window.scrollTo({
                top: gameContainer.getBoundingClientRect().top + window.scrollY - 15,
                behavior: 'smooth'
            });
        }, 50);

        // Hide original elements
        const hiddenEls = gameContainer.querySelectorAll('.tip-box, .vacation-length-box, [id*="tip"], .ai-tools, .ai-btn, .ai-sponsor, .net-days, .absolute-timer, #excluding-label, #vacation-message, #main-target-title, .net-days-container, #total-days-label');
        hiddenEls.forEach(el => { 
            if(el.dataset.hwPrevDisplay === undefined) {
                el.dataset.hwPrevDisplay = el.style.display || getComputedStyle(el).display; 
            }
            el.style.display = 'none'; 
        });

        // Block pointer events on other original elements
        Array.from(gameContainer.children).forEach(el => {
            if (!el.classList.contains('dino-element')) {
                el.style.pointerEvents = 'none';
            }
        });

        document.body.style.touchAction = 'none'; // Prevent zoom/scroll on mobile

        // Score Display
        scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'dino-element';
        scoreDisplay.innerHTML = '💯 <span id="dino-score-val">0</span>';
        scoreDisplay.style.position = 'absolute';
        scoreDisplay.style.top = '15px';
        scoreDisplay.style.right = '20px';
        scoreDisplay.style.fontSize = '20px';
        scoreDisplay.style.fontWeight = 'bold';
        scoreDisplay.style.color = '#333';
        gameContainer.appendChild(scoreDisplay);

        const closeBtn = document.createElement('div');
        closeBtn.className = 'dino-element';
        closeBtn.innerHTML = '✖';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '15px';
        closeBtn.style.left = '20px';
        closeBtn.style.fontSize = '22px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.color = '#94a3b8';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.zIndex = '300';
        closeBtn.style.pointerEvents = 'auto';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            cleanupGame();
        };
        gameContainer.appendChild(closeBtn);

        // Ground Line
        groundLine = document.createElement('div');
        groundLine.className = 'dino-element';
        groundLine.style.position = 'absolute';
        groundLine.style.bottom = '30px';
        groundLine.style.left = '0';
        groundLine.style.width = '100%';
        groundLine.style.height = '2px';
        groundLine.style.background = '#666';
        gameContainer.appendChild(groundLine);

        // Dino
        dino = document.createElement('div');
        dino.className = 'dino-element';
        dino.textContent = '🦖';
        dino.style.position = 'absolute';
        dino.style.bottom = '30px';
        dino.style.left = '30px';
        dino.style.fontSize = '35px';
        dino.style.lineHeight = '1';
        dino.style.width = '35px';
        dino.style.height = '35px';
        dino.style.zIndex = '10';
        gameContainer.appendChild(dino);

        dinoY = 0;
        dinoVelocity = 0;
        isJumping = false;

        // Controls
        window.addEventListener('keydown', handleInput);
        window.addEventListener('touchstart', handleInput, {passive: false});
        gameContainer.addEventListener('mousedown', handleInput);

        // Start Loop
        gameLoopId = requestAnimationFrame(gameLoop);
    }

    function handleInput(e) {
        if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'ArrowUp') return;
        if (e.type === 'touchstart') e.preventDefault();
        
        if (isGameOver) return;

        if (!isJumping) {
            isJumping = true;
            dinoVelocity = JUMP_FORCE;
            if (navigator.vibrate) navigator.vibrate([15]);
        }
    }

    function spawnObstacle() {
        const obs = document.createElement('div');
        obs.className = 'dino-element';
        const emoji = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
        obs.textContent = emoji;
        obs.style.position = 'absolute';
        obs.style.bottom = '30px';
        obs.style.left = '100%';
        obs.style.fontSize = '28px';
        obs.style.lineHeight = '1';
        obs.style.zIndex = '5';
        gameContainer.appendChild(obs);

        obstaclesList.push({
            el: obs,
            x: gameContainer.clientWidth,
            passed: false
        });
    }

    function gameLoop() {
        if (!isGameActive) return;
        frameCount++;

        // Speed increases slowly
        gameSpeed += 0.001;

        // Physics
        dinoVelocity += GRAVITY;
        dinoY += dinoVelocity;

        if (dinoY >= 0) {
            dinoY = 0;
            isJumping = false;
            dinoVelocity = 0;
        }

        dino.style.transform = `translateY(${dinoY}px)`;

        // Spawn obstacles
        if (frameCount % Math.max(60, Math.floor(120 - gameSpeed * 10)) === 0) {
            spawnObstacle();
        }

        const dinoRect = dino.getBoundingClientRect();
        
        // Reduced hitbox for dino to make game fairer
        const dinoHitbox = {
            left: dinoRect.left + 10,
            right: dinoRect.right - 10,
            top: dinoRect.top + 10,
            bottom: dinoRect.bottom - 5
        };

        // Move obstacles
        for (let i = obstaclesList.length - 1; i >= 0; i--) {
            const obs = obstaclesList[i];
            obs.x -= gameSpeed;
            obs.el.style.left = obs.x + 'px';

            const obsRect = obs.el.getBoundingClientRect();
            const obsHitbox = {
                left: obsRect.left + 5,
                right: obsRect.right - 5,
                top: obsRect.top + 5,
                bottom: obsRect.bottom - 2
            };

            // Collision Check
            if (
                dinoHitbox.right > obsHitbox.left &&
                dinoHitbox.left < obsHitbox.right &&
                dinoHitbox.bottom > obsHitbox.top &&
                dinoHitbox.top < obsHitbox.bottom
            ) {
                gameOver();
                return;
            }

            // Score
            if (!obs.passed && obsHitbox.right < dinoHitbox.left) {
                obs.passed = true;
                score += 10;
                document.getElementById('dino-score-val').textContent = score;
            }

            // Remove off-screen
            if (obs.x < -50) {
                obs.el.remove();
                obstaclesList.splice(i, 1);
            }
        }

        if (!isGameOver) {
            gameLoopId = requestAnimationFrame(gameLoop);
        }
    }

    function gameOver() {
        isGameOver = true;
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);

        const title = document.createElement('div');
        title.className = 'dino-element';
        title.innerHTML = `נפסלת! 💥<br><span style="font-size:18px">צברת ${score} נקודות</span>`;
        title.style.position = 'absolute';
        title.style.top = '50%';
        title.style.left = '50%';
        title.style.transform = 'translate(-50%, -50%)';
        title.style.fontSize = '32px';
        title.style.fontWeight = '900';
        title.style.color = '#ef4444';
        title.style.textShadow = '0 2px 10px rgba(0,0,0,0.2)';
        title.style.textAlign = 'center';
        title.style.zIndex = '200';
        gameContainer.appendChild(title);

        dino.style.transform = `translateY(${dinoY}px) rotate(90deg)`;

        window.removeEventListener('keydown', handleInput);
        window.removeEventListener('touchstart', handleInput);
        gameContainer.removeEventListener('mousedown', handleInput);

        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.marginTop = '20px';
        btnContainer.style.justifyContent = 'center';
        
        const playAgainBtn = document.createElement('button');
        playAgainBtn.textContent = 'שחק שוב 🔄';
        playAgainBtn.style.padding = '8px 24px';
        playAgainBtn.style.background = 'var(--primary)';
        playAgainBtn.style.border = 'none';
        playAgainBtn.style.borderRadius = '12px';
        playAgainBtn.style.fontWeight = 'bold';
        playAgainBtn.style.cursor = 'pointer';
        playAgainBtn.style.fontSize = '18px';
        playAgainBtn.style.pointerEvents = 'auto';
        playAgainBtn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
        playAgainBtn.onclick = (e) => {
            e.stopPropagation();
            cleanupGame();
            setTimeout(startGame, 50);
        };

        btnContainer.appendChild(playAgainBtn);
        title.appendChild(btnContainer);
    }

    function cleanupGame() {
        isGameActive = false;
        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        
        // Remove dynamic game elements
        const els = gameContainer.querySelectorAll('.dino-element');
        els.forEach(el => el.remove());

        document.body.style.touchAction = ''; 
        document.body.style.overflow = '';
        gameContainer.style.overflow = '';
        if (gameContainer.dataset.hwPrevHeight !== undefined) {
            gameContainer.style.height = gameContainer.dataset.hwPrevHeight;
            delete gameContainer.dataset.hwPrevHeight;
        }
        if (gameContainer.dataset.hwPrevZIndex !== undefined) {
            gameContainer.style.zIndex = gameContainer.dataset.hwPrevZIndex;
            delete gameContainer.dataset.hwPrevZIndex;
        }

        const overlay = document.getElementById('game-lock-overlay');
        if (overlay) overlay.style.display = 'none';

        // Hide original elements
        const hiddenEls = gameContainer.querySelectorAll('[data-hw-prev-display]');
        hiddenEls.forEach(el => {
            el.style.display = el.dataset.hwPrevDisplay;
            delete el.dataset.hwPrevDisplay;
        });

        Array.from(gameContainer.children).forEach(el => {
            el.style.pointerEvents = '';
        });
    }

    window.startDinoGame = startGame;
})();
