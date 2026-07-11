// --- Dino School Runner Mini-Game ---
// A T-Rex styled endless runner with school obstacles.

(function() {
    const OBSTACLES = ['👩‍🏫', '👨‍🏫', '🎒', '🚌', '⏰', '📚', '📝', '🍎', '🥪', '🧻', '🧪', '📋', '📐'];
    const FLYING = ['✈️', '🦅'];
    const BONUSES = ['🍉', '🍦', '🏖️', '🕶️', '🥥', '🍹'];
    const CLOUDS = ['☁️'];
    
    const EVENTS = {
        'morning': { title: 'שעת אפס... למי יש כוח 🥱', bg: 'linear-gradient(to bottom, #bae6fd, #f0f9ff)', gravity: 0.6, jumpForce: -10, flyChance: 0.02, bonusChance: 0, obsSet: OBSTACLES },
        'storm': { title: 'מי שם מזגן על 16 מעלות?! 🥶🌪️', bg: 'linear-gradient(to bottom, #1e293b, #334155)', gravity: 0.7, jumpForce: -11, flyChance: 0.1, bonusChance: 0, obsSet: ['☔', '💧', '🌬️', '🌨️', '🌂'] },
        'gym': { title: 'שיעור ספורט! (רגע, למה מרחפים?) 🏀🚀', bg: 'linear-gradient(to bottom, #86efac, #dcfce7)', gravity: 0.25, jumpForce: -6, flyChance: 0, bonusChance: 0, obsSet: ['⚽', '🏀', '🎾', '🏐', '🥎'] },
        'recess': { title: 'הפסקת 10! לאסוף אוכל לקפיטריה! (+20 נק) 🍕🏃‍♂️', bg: 'linear-gradient(to bottom, #fbcfe8, #fdf2f8)', gravity: 0.6, jumpForce: -10, flyChance: 0, bonusChance: 0.7, obsSet: OBSTACLES },
        'popquiz': { title: 'בוחן פתע!! להוציא דפים! 😱📝', bg: 'linear-gradient(to bottom, #fca5a5, #fee2e2)', gravity: 0.6, jumpForce: -10, flyChance: 0.35, bonusChance: 0, obsSet: ['📝', '📋', '📚', '💯'] },
        'night': { title: 'ננעלת בבית הספר בטעות! 🌙👻', bg: 'linear-gradient(to bottom, #1e1b4b, #4c1d95)', gravity: 0.6, jumpForce: -10, flyChance: 0.2, bonusChance: 0, obsSet: OBSTACLES }
    };
    const EVENT_KEYS = Object.keys(EVENTS);
    
    const GAME_SPEED_START = 4;
    
    let isGameActive = false;
    let score = 0;
    let currentEvent = 'morning';
    let lastEventScore = 0;
    let nextEventThreshold = 150;
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
    let spawnTimer = 0;
    let frameCount = 0;
    let isGameOver = false;

    // trigger button logic removed

    function startGame() {
        if (isGameActive) return;
        isGameActive = true;
        isGameOver = false;
        score = 0;
        currentEvent = 'morning';
        lastEventScore = 0;
        nextEventThreshold = 150;
        gameSpeed = GAME_SPEED_START;
        obstaclesList = [];
        frameCount = 0;
        spawnTimer = 60; // Initial delay

        if (navigator.vibrate) navigator.vibrate([30]);

        const timerCard = document.getElementById('main-timer-bg');
        if (!timerCard) { isGameActive = false; return; }

        gameContainer = timerCard;
        
        const currentHeight = gameContainer.getBoundingClientRect().height;
        gameContainer.dataset.hwPrevHeight = gameContainer.style.height || '';
        
        gameContainer.style.height = currentHeight + 'px';
        gameContainer.offsetHeight; // force reflow
        gameContainer.style.transition = 'height 0.4s ease, box-shadow 0.4s ease';
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
            overlay.style.background = 'transparent';
            overlay.style.transition = 'background 0.4s ease';
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            window.scrollTo({
                top: gameContainer.getBoundingClientRect().top + window.scrollY - 15,
                behavior: 'smooth'
            });
        }, 400);

        // Hide original elements
        const hiddenEls = gameContainer.querySelectorAll('.tip-box, .vacation-length-box, [id*="tip"], .ai-tools, .ai-btn, .ai-sponsor, .net-days, .absolute-timer, #excluding-label, #vacation-message, #main-target-title, .net-days-container, #total-days-label');
        hiddenEls.forEach(el => { 
            if(el.dataset.hwPrevDisplay === undefined) {
                el.dataset.hwPrevDisplay = el.style.display || getComputedStyle(el).display; 
            }
            el.style.transition = 'opacity 0.2s ease';
            el.style.opacity = '0'; 
        });

        setTimeout(() => {
            hiddenEls.forEach(el => { 
                el.style.display = 'none'; 
                el.style.opacity = '';
                el.style.transition = '';
            });
        }, 200);

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
        scoreDisplay.innerHTML = '<span id="dino-score-val">0</span>';
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
        dino.style.right = '30px';
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
            const ev = EVENTS[currentEvent];
            dinoVelocity = ev.jumpForce;
            if (navigator.vibrate) navigator.vibrate([15]);
            
            // Dust effect
            const dust = document.createElement('div');
            dust.className = 'dino-element';
            dust.textContent = '💨';
            dust.style.position = 'absolute';
            dust.style.bottom = '30px';
            dust.style.right = '40px';
            dust.style.fontSize = '20px';
            dust.style.opacity = '0.7';
            dust.style.transition = 'all 0.5s ease-out';
            dust.style.zIndex = '2';
            dust.style.pointerEvents = 'none';
            gameContainer.appendChild(dust);
            
            requestAnimationFrame(() => {
                dust.style.right = '60px';
                dust.style.bottom = '40px';
                dust.style.opacity = '0';
                dust.style.transform = 'scale(1.5)';
            });
            setTimeout(() => { if(dust.parentNode) dust.remove(); }, 500);
        }
    }

    function spawnObstacle() {
        const ev = EVENTS[currentEvent];
        let type = 'obstacle';
        const rand = Math.random();
        
        if (rand < ev.flyChance) {
            type = 'flying';
        } else if (rand >= ev.flyChance && rand < ev.flyChance + ev.bonusChance) {
            type = 'bonus';
        }
        
        spawnEntity(type);
    }

    function spawnEntity(type) {
        const ev = EVENTS[currentEvent];
        const el = document.createElement('div');
        el.className = 'dino-element';
        
        let emoji = '';
        let bottom = '30px';
        let speedMult = 1;
        let size = '28px';
        let isCloud = (type === 'cloud');

        if (type === 'obstacle') {
            emoji = ev.obsSet[Math.floor(Math.random() * ev.obsSet.length)];
        } else if (type === 'flying') {
            emoji = FLYING[Math.floor(Math.random() * FLYING.length)];
            bottom = '70px'; // Head height, requires no jump
        } else if (type === 'bonus') {
            emoji = BONUSES[Math.floor(Math.random() * BONUSES.length)];
            bottom = '95px'; // High up, requires jump
        } else if (isCloud) {
            emoji = CLOUDS[Math.floor(Math.random() * CLOUDS.length)];
            bottom = Math.floor(Math.random() * 60 + 100) + 'px'; // Random sky height
            speedMult = 0.2 + Math.random() * 0.3; // Parallax slow
            size = Math.floor(Math.random() * 20 + 30) + 'px';
            el.style.opacity = '0.6';
            el.style.zIndex = '1';
        }

        el.textContent = emoji;
        el.style.position = 'absolute';
        el.style.bottom = bottom;
        el.style.right = '100%';
        el.style.fontSize = size;
        el.style.lineHeight = '1';
        if (!el.style.zIndex) el.style.zIndex = '5';
        
        gameContainer.appendChild(el);

        obstaclesList.push({
            el: el,
            x: gameContainer.clientWidth,
            type: type,
            speedMult: speedMult,
            passed: false
        });
    }

    function gameLoop() {
        if (!isGameActive) return;
        frameCount++;

        // Speed increases VERY slowly but steadily
        gameSpeed += 0.0003;

        // Physics
        const ev = EVENTS[currentEvent];
        dinoVelocity += ev.gravity;
        dinoY += dinoVelocity;

        if (dinoY >= 0) {
            dinoY = 0;
            isJumping = false;
            dinoVelocity = 0;
        }

        dino.style.transform = `translateY(${dinoY}px)`;

        // Event transition based on dynamic threshold
        if (score - lastEventScore >= nextEventThreshold) {
            lastEventScore = score;
            nextEventThreshold += 50; // Every event takes 50 points longer to reach!
            
            // Pick random event that is not current (and avoid night/storm too early)
            let possibleEvents = EVENT_KEYS.filter(e => e !== currentEvent && e !== 'morning');
            if (score < 300) possibleEvents = possibleEvents.filter(e => e !== 'night' && e !== 'storm');
            
            if (possibleEvents.length > 0) {
                currentEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            }
            
            const newEv = EVENTS[currentEvent];
            gameContainer.style.background = newEv.bg;
            gameContainer.style.transition = 'background 2s ease, height 0.4s ease';
            
            // Announce Event
            const stageTxt = document.createElement('div');
            stageTxt.className = 'dino-element';
            stageTxt.textContent = newEv.title;
            stageTxt.style.position = 'absolute';
            stageTxt.style.top = '40px';
            stageTxt.style.left = '50%';
            stageTxt.style.transform = 'translateX(-50%)';
            stageTxt.style.fontSize = '24px';
            stageTxt.style.fontWeight = 'bold';
            stageTxt.style.color = (currentEvent === 'night' || currentEvent === 'storm') ? '#fff' : '#ef4444';
            stageTxt.style.zIndex = '10';
            stageTxt.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
            stageTxt.style.opacity = '1';
            stageTxt.style.transition = 'opacity 1s ease';
            gameContainer.appendChild(stageTxt);
            
            setTimeout(() => {
                if (stageTxt.parentNode) stageTxt.style.opacity = '0';
                setTimeout(() => { if (stageTxt.parentNode) stageTxt.remove(); }, 1000);
            }, 2500);
        }

        // Spawn entities
        spawnTimer--;
        if (spawnTimer <= 0) {
            spawnObstacle();
            
            // Calculate next spawn gap based on difficulty (total score)
            const diffLevel = Math.min(5, Math.floor(score / 250));
            
            // minGap shrinks as you progress (down to 35 frames - very tight!)
            let minGap = Math.max(35, 90 - Math.floor(gameSpeed * 2) - (diffLevel * 10));
            
            // maxGap shrinks heavily so obstacles spawn much more frequently
            let maxGap = minGap + Math.max(20, 60 - diffLevel * 20) + Math.floor(Math.random() * 30);
            
            // Adjust gap based on event
            if (currentEvent === 'recess') { minGap += 30; maxGap += 40; } // fewer obstacles
            if (currentEvent === 'popquiz') { minGap -= 10; maxGap -= 10; } // very dense
            if (currentEvent === 'gym') { minGap += 20; maxGap += 30; } // slower jumps, need bigger gap
            
            minGap = Math.max(35, minGap);
            spawnTimer = Math.floor(Math.random() * (maxGap - minGap + 1)) + minGap;
        }
        
        // Randomly spawn clouds
        if (currentEvent !== 'storm' && currentEvent !== 'night' && Math.random() < 0.015) {
            spawnEntity('cloud');
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
            obs.x -= gameSpeed * obs.speedMult;
            obs.el.style.right = obs.x + 'px';

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
                if (obs.type === 'bonus') {
                    score += 20;
                    document.getElementById('dino-score-val').textContent = score;
                    if (navigator.vibrate) navigator.vibrate([20, 20]);
                    
                    const floatText = document.createElement('div');
                    floatText.className = 'dino-element';
                    floatText.textContent = '+20';
                    floatText.style.position = 'absolute';
                    floatText.style.right = obs.x + 'px';
                    floatText.style.bottom = '110px';
                    floatText.style.color = '#10b981';
                    floatText.style.fontWeight = 'bold';
                    floatText.style.fontSize = '24px';
                    floatText.style.zIndex = '10';
                    floatText.style.transition = 'all 0.5s ease-out';
                    gameContainer.appendChild(floatText);
                    
                    requestAnimationFrame(() => {
                        floatText.style.bottom = '150px';
                        floatText.style.opacity = '0';
                    });
                    setTimeout(() => { if (floatText.parentNode) floatText.remove(); }, 500);

                    obs.el.remove();
                    obstaclesList.splice(i, 1);
                    continue;
                } else if (obs.type === 'obstacle' || obs.type === 'flying') {
                    gameOver();
                    return;
                }
            }

            // Score passing logic
            if (!obs.passed && obs.type !== 'cloud' && obs.type !== 'bonus' && obsHitbox.left > dinoHitbox.right) {
                obs.passed = true;
                score += 10;
                document.getElementById('dino-score-val').textContent = score;
            }

            // Remove off-screen
            if (obs.x < -100) { // Increased to -100 to allow clouds to fully clear
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
        title.id = 'dino-game-over';
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

        dino.style.transform = `translateY(${dinoY}px) rotate(-90deg)`;

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
            restartGame();
        };

        btnContainer.appendChild(playAgainBtn);
        title.appendChild(btnContainer);
    }

    function restartGame() {
        const title = document.getElementById('dino-game-over');
        if (title) title.remove();

        obstaclesList.forEach(obs => {
            if (obs.el && obs.el.parentNode) obs.el.remove();
        });
        obstaclesList = [];

        score = 0;
        currentEvent = 'morning';
        lastEventScore = 0;
        nextEventThreshold = 150;
        gameContainer.style.background = '';
        document.getElementById('dino-score-val').textContent = '0';
        isGameOver = false;
        gameSpeed = GAME_SPEED_START;
        spawnTimer = 60;
        frameCount = 0;
        dinoY = 0;
        dinoVelocity = 0;
        isJumping = false;
        dino.style.transform = `translateY(0px)`;
        
        window.addEventListener('keydown', handleInput);
        window.addEventListener('touchstart', handleInput, {passive: false});
        gameContainer.addEventListener('mousedown', handleInput);

        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        gameLoopId = requestAnimationFrame(gameLoop);
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

        if (gameContainer.dataset.hwPrevZIndex !== undefined) {
            gameContainer.style.zIndex = gameContainer.dataset.hwPrevZIndex;
            delete gameContainer.dataset.hwPrevZIndex;
        }

        const overlay = document.getElementById('game-lock-overlay');
        if (overlay) overlay.style.display = 'none';

        gameContainer.style.transition = '';
        gameContainer.style.height = '200px'; // Lock before restore
        gameContainer.style.background = '';
        
        const hiddenEls = gameContainer.querySelectorAll('[data-hw-prev-display]');
        hiddenEls.forEach(el => {
            el.style.display = el.dataset.hwPrevDisplay;
            el.style.opacity = '0';
        });

        // Measure new target height
        gameContainer.style.height = 'auto';
        const targetHeight = gameContainer.getBoundingClientRect().height;

        gameContainer.style.height = '200px';
        gameContainer.offsetHeight; // reflow
        gameContainer.style.transition = 'height 0.4s ease';
        gameContainer.style.height = targetHeight + 'px';

        hiddenEls.forEach(el => {
            el.style.transition = 'opacity 0.4s ease';
            el.style.opacity = '1';
        });

        setTimeout(() => {
            gameContainer.style.transition = '';
            if (gameContainer.dataset.hwPrevHeight !== undefined) {
                gameContainer.style.height = gameContainer.dataset.hwPrevHeight;
                delete gameContainer.dataset.hwPrevHeight;
            }
            hiddenEls.forEach(el => {
                el.style.transition = '';
                el.style.opacity = '';
                delete el.dataset.hwPrevDisplay;
            });
        }, 400);

        Array.from(gameContainer.children).forEach(el => {
            el.style.pointerEvents = '';
        });
    }

    window.startDinoGame = startGame;
})();
