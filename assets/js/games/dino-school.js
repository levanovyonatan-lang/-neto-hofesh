// --- Dino School Runner Mini-Game ---
// A T-Rex styled endless runner with school obstacles.

(function() {
    const OBSTACLES = ['👩‍🏫', '👨‍🏫', '🎒', '🚌', '⏰', '📚', '📝', '🍎', '🥪', '🧻', '🧪', '📋', '📐'];
    const FLYING = ['✈️', '🦅'];
    const BONUSES = ['🏖️', '🕶️', '🎈', '✈️', '🏝️', '⛵'];
    const CLOUDS = ['☁️'];
    
    const STAGES = [
        /* 0  */ { threshold: 0, title: 'שלב 1: שעת אפס... למי יש כוח 🥱', bg: 'linear-gradient(to bottom, #bae6fd, #f0f9ff)', gravity: 0.6, jumpForce: -10, flyChance: 0, bonusChance: 0, obsSet: ['🚌', '🎒', '⏰'], dinoEmoji: '🦖', dinoFilter: 'none', dinoOpacity: '1' },
        /* 1  */ { threshold: 120, title: 'שלב 2: בוחן פתע ששכחת ממנו! 😱📝', bg: 'linear-gradient(to bottom, #fca5a5, #fee2e2)', gravity: 0.6, jumpForce: -10, flyChance: 0.25, bonusChance: 0, obsSet: ['📝', '📋', '📚', '📐'], dinoEmoji: '🦕', dinoFilter: 'none', dinoOpacity: '1' },
        /* 2  */ { threshold: 240, title: 'שלב 3: מלחמת אוכל בקפיטריה! 🍕', bg: 'linear-gradient(to bottom, #fbcfe8, #fdf2f8)', gravity: 0.6, jumpForce: -10, flyChance: 0, bonusChance: 0.45, bonusSet: ['🍕', '🥪'], obsSet: ['🗑️', '🪑', '🧹', '📦', '🗄️'], dinoEmoji: '🦖', dinoFilter: 'drop-shadow(0 2px 5px rgba(251,191,36,0.6))', dinoOpacity: '1', objective: 'תאספו אוכל! 🍕🥪' },
        /* 3  */ { threshold: 380, title: 'שלב 4: מישהו פוצץ את הברזייה! 🌊', bg: 'linear-gradient(to bottom, #60a5fa, #1d4ed8)', gravity: 0.4, jumpForce: -8, flyChance: 0.3, flySet: ['🐟', '🌊', '💧'], bonusChance: 0, obsSet: ['🚰', '🪣', '🧹', '🚧', '⚠️'], dinoEmoji: '🐊', dinoFilter: 'none', dinoOpacity: '1' },
        /* 4  */ { threshold: 520, title: 'שלב 5: שיעור ספורט ממוצע! 🏀', bg: 'linear-gradient(to bottom, #86efac, #dcfce7)', gravity: 0.5, jumpForce: -9, flyChance: 0.35, flySet: ['🏸', '🥏', '🏐', '🎾'], bonusChance: 0, obsSet: ['⚽', '🏀', '🎳', '🏋️‍♂️', '🚧', '👟'], dinoEmoji: '🦖', dinoFilter: 'none', dinoOpacity: '1' },
        /* 5  */ { threshold: 680, title: 'שלב 6: הטיול השנתי המקולל 🌵', bg: 'linear-gradient(to bottom, #fde047, #ea580c)', gravity: 0.6, jumpForce: -10, flyChance: 0.2, flySet: ['🦅', '🦇', '🐝', '🦟', '🦅'], bonusChance: 0, obsSet: ['🐍', '🦂', '🌵', '🥾'], dinoEmoji: '🦕', dinoFilter: 'none', dinoOpacity: '1' },
        /* 6  */ { threshold: 880, title: 'שלב 7: ניסוי מדעים יצא משליטה 💥', bg: 'linear-gradient(to bottom, #a78bfa, #c026d3)', gravity: 0.6, jumpForce: -10, flyChance: 0.3, flySet: ['🧪', '🦠', '🛸', '⚡', '☄️'], bonusChance: 0, obsSet: ['🧪', '🔬', '💥', '🦠'], dinoEmoji: '🐉', dinoFilter: 'hue-rotate(280deg) saturate(2)', dinoOpacity: '1' },
        /* 7  */ { threshold: 1100, title: 'שלב 8: שיעור חלון! התגנבות יחידים... 🎧', bg: 'linear-gradient(to bottom, #fbcfe8, #f43f5e)', gravity: 0.6, jumpForce: -10, flyChance: 0, bonusChance: 0.5, bonusSet: ['🎧', '📱'], obsSet: ['🎒', '🎵', '🎶', '🎮'], dinoEmoji: '🦖', dinoFilter: 'none', dinoOpacity: '1', objective: 'תאספו ציוד! 🎧📱' },
        /* 8  */ { threshold: 1350, title: 'שלב 9: מזגן על 16 - קפוא פה! 🥶', bg: 'linear-gradient(to bottom, #1e293b, #334155)', gravity: 0.7, jumpForce: -11, flyChance: 0.25, flySet: ['🌨️', '🌬️', '🧊', '❄️', '🪁'], bonusChance: 0, obsSet: ['☔', '💧', '🌬️', '🌨️', '🌂', '🧊'], dinoEmoji: '🦖', dinoFilter: 'hue-rotate(180deg) brightness(1.3)', dinoOpacity: '1' },
        /* 9  */ { threshold: 1650, title: 'שלב 10: אוי לא, המנהל במסדרון!!! 🚨', bg: 'linear-gradient(to bottom, #ef4444, #7f1d1d)', gravity: 0.6, jumpForce: -10, flyChance: 0, bonusChance: 0, obsSet: ['👨‍💼', '👮‍♂️', '🛑', '🚨'], dinoEmoji: '🦖', dinoFilter: 'none', dinoOpacity: '1' },
        /* 10 */ { threshold: 2000, title: 'שלב 11: ננעלת בבית ספר! 🌙👻', bg: 'linear-gradient(to bottom, #020617, #0f172a)', gravity: 0.6, jumpForce: -10, flyChance: 0.4, flySet: ['👻', '🦇', '💀', '👽', '🕷️', '🦉'], bonusChance: 0, obsSet: ['🚌', '🎒', '⏰', '📝', '📋', '📚', '📐', '👻', '🔦'], dinoEmoji: '🦖', dinoFilter: 'invert(1) opacity(0.6)', dinoOpacity: '0.6' },
        /* 11 */ { threshold: 2450, title: 'שלב 12: החופש הגדול!!! (המורה עדיין רודפת אחריך 😱)', bg: 'linear-gradient(to bottom, #f97316, #facc15)', gravity: 0.7, jumpForce: -11.5, flyChance: 0.35, flySet: ['✈️', '📓', '📝', '🛸'], bonusChance: 0.4, bonusSet: ['🍉', '🍦', '🍹'], obsSet: ['👩‍🏫', '📝', '⏰', '🏫', '🎈', '✈️'], dinoEmoji: '😎', dinoFilter: 'none', dinoOpacity: '1', objective: 'תאספו פינוקים! 🍉🍦🍹' }
    ];

    if (!document.getElementById('dino-styles')) {
        const style = document.createElement('style');
        style.id = 'dino-styles';
        style.textContent = `
        @keyframes flashRed {
            0% { box-shadow: inset 0 0 50px rgba(239,68,68,0.2); }
            100% { box-shadow: inset 0 0 150px rgba(239,68,68,0.9); }
        }
        @keyframes dinoWalk {
            0% { transform: translateY(0); }
            50% { transform: translateY(-0.6px); }
            100% { transform: translateY(0); }
        }
        @keyframes rainbowDino {
            0% { filter: hue-rotate(0deg) drop-shadow(0 0 10px #ff0000); }
            20% { filter: hue-rotate(72deg) drop-shadow(0 0 10px #ff00ff); }
            40% { filter: hue-rotate(144deg) drop-shadow(0 0 10px #0000ff); }
            60% { filter: hue-rotate(216deg) drop-shadow(0 0 10px #00ffff); }
            80% { filter: hue-rotate(288deg) drop-shadow(0 0 10px #00ff00); }
            100% { filter: hue-rotate(360deg) drop-shadow(0 0 10px #ff0000); }
        }
        @keyframes shiverDino {
            0% { transform: translateX(0); }
            25% { transform: translateX(-1px) rotate(-3deg); }
            50% { transform: translateX(1px) rotate(3deg); }
            75% { transform: translateX(-1px) rotate(-3deg); }
            100% { transform: translateX(0); }
        }
        @keyframes stagePop {
            0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
            50% { transform: translateX(-50%) scale(1.1); opacity: 1; }
            100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        .dino-inner {
            display: inline-block;
            transform-origin: bottom center;
        }
        .dino-inner.walking {
            animation: dinoWalk 0.22s infinite ease-in-out;
        }
        .dino-inner.rainbow {
            animation: rainbowDino 1.5s infinite linear;
        }
        .dino-inner.walking.rainbow {
            animation: dinoWalk 0.22s infinite ease-in-out, rainbowDino 1.5s infinite linear;
        }
        .dino-inner.shivering {
            animation: shiverDino 0.1s infinite;
        }
        .dino-inner.walking.shivering {
            animation: dinoWalk 0.22s infinite ease-in-out, shiverDino 0.1s infinite;
        }
        @keyframes bonusGlow {
            0% { filter: drop-shadow(0 0 5px #facc15) drop-shadow(0 0 10px #facc15); transform: scale(1); }
            50% { filter: drop-shadow(0 0 10px #facc15) drop-shadow(0 0 20px #facc15); transform: scale(1.1); }
            100% { filter: drop-shadow(0 0 5px #facc15) drop-shadow(0 0 10px #facc15); transform: scale(1); }
        }
        .bonus-item {
            animation: bonusGlow 1s infinite ease-in-out !important;
            background: radial-gradient(circle, rgba(250,204,21,0.3) 0%, transparent 60%);
            border-radius: 50%;
            padding: 5px;
            margin: -5px;
        }
        `;
        document.head.appendChild(style);
    }
    
    const GAME_SPEED_START = 4.5;
    
    let isGameActive = false;
    let score = 0;
    let currentStageIndex = 0;
    let gameLoopId = null;
    let triggerBtn = null;
    let scoreDisplay = null;
    let objectiveDisplay = null; // Centered target task bar
    let gameContainer = null;
    let groundLine = null;
    let dino = null;
    
    // Physics & State
    let dinoY = 0;
    let dinoVelocity = 0;
    let isJumping = false;
    let obstaclesList = [];
    let obstacleQueue = []; // Queue for spawning combos
    let gameSpeed = GAME_SPEED_START;
    let spawnTimer = 0;
    let frameCount = 0;
    let isGameOver = false;

    // trigger button logic removed

    let objectiveTimeoutId = null;

    function announceStage(stageIndex) {
        const stage = STAGES[stageIndex];
        
        const isCollecting = stage.bonusChance > 0;
        if (isCollecting && stage.objective) {
            objectiveDisplay.textContent = stage.objective;
            objectiveDisplay.style.display = 'block';
            objectiveDisplay.style.opacity = '1';
        } else {
            objectiveDisplay.style.opacity = '0';
            setTimeout(() => {
                if (objectiveDisplay && objectiveDisplay.style.opacity === '0') {
                    objectiveDisplay.style.display = 'none';
                }
            }, 500);
        }
        
        const stageTxt = document.createElement('div');
        stageTxt.className = 'dino-element';
        stageTxt.textContent = stage.title;
        stageTxt.style.position = 'absolute';
        stageTxt.style.top = '40px';
        stageTxt.style.left = '50%';
        stageTxt.style.transform = 'translateX(-50%)';
        stageTxt.style.animation = 'stagePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        stageTxt.style.fontSize = '24px';
        stageTxt.style.fontWeight = 'bold';
        stageTxt.style.color = (stageIndex === 4 || stageIndex === 5) ? '#fff' : '#ef4444';
        stageTxt.style.zIndex = '10';
        stageTxt.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
        stageTxt.style.opacity = '1';
        stageTxt.style.transition = 'opacity 1s ease';
        gameContainer.appendChild(stageTxt);
        
        setTimeout(() => {
            if (stageTxt.parentNode) stageTxt.style.opacity = '0';
            setTimeout(() => { if (stageTxt.parentNode) stageTxt.remove(); }, 1000);
        }, 4500);
    }

    function startGame() {
        if (isGameActive) return;
        isGameActive = true;
        isGameOver = false;
        score = 0;
        currentStageIndex = 0;
        gameSpeed = GAME_SPEED_START;
        obstaclesList = [];
        obstacleQueue = [];
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
        
        const highScore = localStorage.getItem('dinoHighScore') || 0;
        
        scoreDisplay.innerHTML = `<span id="dino-score-val">0</span> <span style="font-size:14px; color:#6b7280; margin-right: 15px;">שיא: <span id="dino-high-score-val">${highScore}</span></span>`;
        scoreDisplay.style.position = 'absolute';
        scoreDisplay.style.top = '15px';
        scoreDisplay.style.right = '20px';
        scoreDisplay.style.fontSize = '20px';
        scoreDisplay.style.fontWeight = 'bold';
        scoreDisplay.style.color = '#333';
        scoreDisplay.style.display = 'flex';
        scoreDisplay.style.alignItems = 'center';
        gameContainer.appendChild(scoreDisplay);

        // Persistent objective text for collecting stages (under score)
        objectiveDisplay = document.createElement('div');
        objectiveDisplay.className = 'dino-objective dino-element';
        objectiveDisplay.style.position = 'absolute';
        objectiveDisplay.style.top = '15px';
        objectiveDisplay.style.left = '50%';
        objectiveDisplay.style.transform = 'translateX(-50%)';
        objectiveDisplay.style.fontSize = '16px';
        objectiveDisplay.style.fontWeight = 'bold';
        objectiveDisplay.style.color = '#10b981'; // Green color to match points
        objectiveDisplay.style.zIndex = '200';
        objectiveDisplay.style.pointerEvents = 'none';
        objectiveDisplay.style.transition = 'opacity 0.5s ease';
        objectiveDisplay.style.display = 'none';
        objectiveDisplay.style.opacity = '0';
        gameContainer.appendChild(objectiveDisplay);

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
        dino.innerHTML = '<span class="dino-inner walking">🦖</span>';
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

        announceStage(0);
    }

    function handleInput(e) {
        if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'ArrowUp') return;
        if (e.type === 'touchstart') e.preventDefault();
        
        if (isGameOver) return;

        if (!isJumping) {
            isJumping = true;
            const stage = STAGES[currentStageIndex];
            dinoVelocity = stage.jumpForce;
            if (navigator.vibrate) navigator.vibrate([15]);
            
            // Dust effect (flying to the right)
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
            dust.style.transform = 'scaleX(1)';
            gameContainer.appendChild(dust);
            
            requestAnimationFrame(() => {
                dust.style.right = '10px';
                dust.style.bottom = '40px';
                dust.style.opacity = '0';
                dust.style.transform = 'scaleX(1.5) scaleY(1.5)';
            });
            setTimeout(() => { if(dust.parentNode) dust.remove(); }, 500);
        }
    }

    function spawnObstacle() {
        const stage = STAGES[currentStageIndex];
        let type = 'obstacle';
        const rand = Math.random();
        
        if (rand < stage.flyChance) {
            type = 'flying';
        } else if (rand >= stage.flyChance && rand < stage.flyChance + stage.bonusChance) {
            type = 'bonus';
        }
        
        spawnEntity(type);
    }

    function spawnEntity(type) {
        const stage = STAGES[currentStageIndex];
        const el = document.createElement('div');
        el.className = 'dino-element';
        
        let emoji = '';
        let bottom = '30px';
        let speedMult = 1;
        let size = '28px';
        let isCloud = (type === 'cloud');

        if (type === 'obstacle') {
            emoji = stage.obsSet[Math.floor(Math.random() * stage.obsSet.length)];
        } else if (type === 'flying') {
            const pool = stage.flySet || FLYING;
            emoji = pool[Math.floor(Math.random() * pool.length)];
            bottom = '70px'; // Head height, requires no jump
            speedMult = 1.2; 
        } else if (type === 'bonus') {
            el.classList.add('bonus-item');
            const pool = stage.bonusSet || BONUSES;
            emoji = pool[Math.floor(Math.random() * pool.length)];
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
        gameSpeed += 0.0005;

        // Physics
        const stage = STAGES[currentStageIndex];
        dinoVelocity += stage.gravity;
        dinoY += dinoVelocity;

        if (dinoY >= 0) {
            dinoY = 0;
            isJumping = false;
            dinoVelocity = 0;
        }

        dino.style.transform = `translateY(${dinoY}px)`;

        // Update walking class based on state
        const dinoInner = dino.querySelector('.dino-inner');
        if (dinoInner) {
            if (!isJumping && !isGameOver) {
                dinoInner.classList.add('walking');
            } else {
                dinoInner.classList.remove('walking');
            }
        }

        // Event transition based on dynamic threshold
        let nextStageIndex = currentStageIndex;
        for (let i = 0; i < STAGES.length; i++) {
            if (score >= STAGES[i].threshold) {
                nextStageIndex = i;
            }
        }

        if (nextStageIndex > currentStageIndex) {
            currentStageIndex = nextStageIndex;
            const newStage = STAGES[currentStageIndex];
            
            gameContainer.style.background = newStage.bg;
            gameContainer.style.transition = 'background 2s ease, height 0.4s ease';
            
            if (currentStageIndex === 9) { // Stage 10: Principal
                gameContainer.style.animation = 'flashRed 0.5s infinite alternate';
            } else {
                gameContainer.style.animation = 'none';
            }

            // Change Dino appearance to match stage
            const wasWalking = dino.querySelector('.dino-inner')?.classList.contains('walking');
            const isRainbow = (currentStageIndex === 11);
            const isShivering = (currentStageIndex === 8);
            dino.innerHTML = `<span class="dino-inner${wasWalking ? ' walking' : ''}${isRainbow ? ' rainbow' : ''}${isShivering ? ' shivering' : ''}">${newStage.dinoEmoji || '🦖'}</span>`;
            dino.style.filter = newStage.dinoFilter || 'none';
            dino.style.opacity = newStage.dinoOpacity || '1';
            
            // Announce Event and show objective temporarily
            announceStage(currentStageIndex);
        }

        // Spawn entities
        spawnTimer--;
        if (spawnTimer <= 0) {
            const stage = STAGES[currentStageIndex];
            
            if (obstacleQueue.length > 0) {
                const nextQueued = obstacleQueue.shift();
                spawnEntity(nextQueued.type);
                spawnTimer = nextQueued.delay;
            } else {
                const randCombo = Math.random();
                // 35% chance to spawn a combo if stage has flying elements
                if (stage.flyChance > 0 && randCombo < 0.35) {
                    const isGroundFirst = Math.random() < 0.5;
                    const delay = Math.floor(Math.random() * 15 + 48); // 48-63 frames delay
                    
                    if (isGroundFirst) {
                        spawnEntity('obstacle');
                        obstacleQueue.push({ type: 'flying', delay: delay });
                    } else {
                        spawnEntity('flying');
                        obstacleQueue.push({ type: 'obstacle', delay: delay });
                    }
                    spawnTimer = delay;
                } else {
                    spawnObstacle();
                    
                    // Calculate next spawn gap based on difficulty
                    const diffLevel = Math.min(5, currentStageIndex);
                    const jumpFrames = 2 * Math.abs(stage.jumpForce / stage.gravity);
                    
                    let minGap = Math.max(Math.floor(jumpFrames + 10), 75 - Math.floor(gameSpeed * 2) - (diffLevel * 5));
                    let maxGap = minGap + Math.max(20, 45 - diffLevel * 5) + Math.floor(Math.random() * 15);
                    
                    // Adjust gap based on stage explicitly adding extra space if needed, but not reducing below jumpFrames+10
                    if (currentStageIndex === 0) { maxGap += 10; } 
                    if (currentStageIndex === 3) { minGap += 5; maxGap += 10; } 
                    if (currentStageIndex === 9) { minGap += 22; maxGap += 30; } 
                    if (currentStageIndex === 4) { minGap += 20; maxGap += 30; } 
                    
                    // Enforce absolute fairness minimum
                    minGap = Math.max(Math.floor(jumpFrames + 10), minGap);
                    spawnTimer = Math.floor(Math.random() * (maxGap - minGap + 1)) + minGap;
                }
            }
        }
        
        // Randomly spawn clouds
        if (currentStageIndex !== 4 && currentStageIndex !== 5 && Math.random() < 0.015) {
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
                    // God mode: just remove the obstacle on collision and accumulate points!
                    score += 10;
                    document.getElementById('dino-score-val').textContent = score;
                    obs.el.remove();
                    obstaclesList.splice(i, 1);
                    continue;
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

    function getGameOverMessage(stageIndex) {
        const msgs = [
            "הכלב אכל לי את המחברת! 🐕", // Stage 1
            "האוטובוס ברח לך! 🚌💨", // Stage 2
            "2 + 2 = 5? חזור על החומר! 📚", // Stage 3
            "הסנדוויץ' נפל עם הממרח למטה! 🥪💥", // Stage 4
            "נפסלת במחניים! 🏐", // Stage 5
            "נפל לך הסנדוויץ' לבוץ! 🥾", // Stage 6
            "הניסוי התפוצץ במעבדה! 💥🧪", // Stage 7
            "המורה תפסה אותך משחק בטלפון! 📱", // Stage 8
            "קפאת למוות, מי שם על 16 מעלות?! 🥶", // Stage 9
            "המנהל קורא לך למשרד! 👨‍💼", // Stage 10
            "הדלתות ננעלו! 👻", // Stage 11
            "נשרפת בים, שכחת קרם הגנה! 🥵☀️" // Stage 12
        ];
        return msgs[stageIndex] || "נפסלת! 💥";
    }

    function gameOver() {
        isGameOver = true;
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        
        let currentHighScore = parseInt(localStorage.getItem('dinoHighScore')) || 0;
        let isNewRecord = false;
        if (score > currentHighScore) {
            currentHighScore = score;
            localStorage.setItem('dinoHighScore', currentHighScore);
            isNewRecord = true;
            const hsEl = document.getElementById('dino-high-score-val');
            if (hsEl) hsEl.textContent = currentHighScore;
        }

        const funnyMessage = getGameOverMessage(currentStageIndex);

        const title = document.createElement('div');
        title.id = 'dino-game-over';
        title.className = 'dino-element';
        title.innerHTML = `${funnyMessage}<br><span style="font-size:18px">צברת ${score} נקודות</span>${isNewRecord ? '<br><span style="font-size:22px; color:#10b981;">🏆 שיא חדש! 🏆</span>' : ''}`;
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
        obstacleQueue = [];

        score = 0;
        currentStageIndex = 0;
        gameContainer.style.background = '';
        gameContainer.style.animation = 'none';
        document.getElementById('dino-score-val').textContent = '0';
        isGameOver = false;
        gameSpeed = GAME_SPEED_START;
        spawnTimer = 60;
        frameCount = 0;
        dinoY = 0;
        dinoVelocity = 0;
        isJumping = false;
        dino.style.transform = `translateY(0px)`;
        dino.innerHTML = '<span class="dino-inner walking">🦖</span>';
        dino.style.filter = 'none';
        dino.style.opacity = '1';
        
        if (objectiveTimeoutId) clearTimeout(objectiveTimeoutId);
        if (objectiveDisplay) {
            objectiveDisplay.style.opacity = '1';
            objectiveDisplay.style.display = 'none';
        }
        
        window.addEventListener('keydown', handleInput);
        window.addEventListener('touchstart', handleInput, {passive: false});
        gameContainer.addEventListener('mousedown', handleInput);

        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        gameLoopId = requestAnimationFrame(gameLoop);

        announceStage(0);
    }

    function cleanupGame() {
        isGameActive = false;
        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        if (objectiveTimeoutId) clearTimeout(objectiveTimeoutId);
        
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
