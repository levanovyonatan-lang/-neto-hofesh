// --- Boss Piñata Mini-Game ---
// פיניאטת המבחנים - לחסל את הלימודים

(function() {
    const PAIN_EMOJIS = ['💦', '💢', '🤕', '😵', '🗯️'];
    const WIN_EMOJIS = ['🍉', '🍦', '🏖️', '🎮', '☀️', '😎', '💦'];
    const MAX_HEALTH = 30; // 30 taps to win
    
    let currentHealth = MAX_HEALTH;
    let triggerBtn = null;
    let arenaOverlay = null;
    let bossEl = null;
    let healthBarFill = null;
    let isExploding = false;

    function createTriggerButton() {
        const timerCard = document.getElementById('main-timer-bg');
        if (!timerCard) return;

        triggerBtn = document.createElement('div');
        triggerBtn.id = 'boss-trigger';
        triggerBtn.textContent = '😡';
        triggerBtn.title = 'חסל את המבחנים!';
        triggerBtn.setAttribute('role', 'button');
        triggerBtn.setAttribute('aria-label', 'משחק חיסול המבחנים');
        document.body.appendChild(triggerBtn);

        triggerBtn.addEventListener('click', startBossFight);
    }

    function startBossFight() {
        if (arenaOverlay) return;
        if (typeof trackEvent === 'function') trackEvent('start_pinata');

        const timerCard = document.getElementById('main-timer-bg');
        if (!timerCard) return;

        // Hide normal card content
        timerCard.style.overflow = 'hidden';
        triggerBtn.style.display = 'none';

        const hiddenEls = timerCard.querySelectorAll('.ai-tools, .net-days-container, .absolute-timer, .total-days-label, .vacation-length-box, [id*="tip"], h2');
        hiddenEls.forEach(el => { el.dataset.bossPrevDisplay = el.style.display; el.style.display = 'none'; });
        Array.from(timerCard.children).forEach(el => {
            if (el.id !== 'boss-arena' && el.id !== 'boss-trigger') el.style.pointerEvents = 'none';
        });

        // Create Arena
        arenaOverlay = document.createElement('div');
        arenaOverlay.id = 'boss-arena';
        arenaOverlay.innerHTML = `
            <div class="boss-title">חסלו את המבחן!! 🔥</div>
            
            <div class="boss-health-bar">
                <div class="boss-health-fill" id="boss-health-fill"></div>
            </div>

            <div class="boss-container">
                <div class="boss-monster" id="boss-monster" onclick="window._bossHit(event)">📝</div>
            </div>
            
            <div class="boss-instructions">תקתקו עליו מהר!</div>
            <button class="boss-close-btn" onclick="window._bossClose()">✖ עזוב אותי</button>
        `;
        timerCard.appendChild(arenaOverlay);

        bossEl = document.getElementById('boss-monster');
        healthBarFill = document.getElementById('boss-health-fill');
        currentHealth = MAX_HEALTH;
        isExploding = false;

        window._bossHit = hitBoss;
        window._bossClose = closeBossFight;
    }

    function hitBoss(e) {
        if (isExploding) return;
        
        currentHealth--;
        
        // Vibrate
        if (navigator.vibrate) navigator.vibrate(20);
        
        // Health Bar Update
        const healthPercent = Math.max(0, (currentHealth / MAX_HEALTH) * 100);
        healthBarFill.style.width = healthPercent + '%';
        if (healthPercent < 40) healthBarFill.style.background = '#ef4444'; // turn red
        else if (healthPercent < 70) healthBarFill.style.background = '#f59e0b'; // turn orange

        // Boss animation
        bossEl.classList.remove('boss-hit-anim');
        void bossEl.offsetWidth; // trigger reflow
        bossEl.classList.add('boss-hit-anim');

        // Spawn a pain emoji
        spawnPainEmoji(e);

        if (currentHealth <= 0) {
            triggerWin();
        }
    }

    function spawnPainEmoji(e) {
        const pain = document.createElement('div');
        pain.className = 'boss-pain-emoji';
        pain.textContent = PAIN_EMOJIS[Math.floor(Math.random() * PAIN_EMOJIS.length)];
        
        // Random position around the click or boss center
        const offsetX = (Math.random() - 0.5) * 80;
        const offsetY = (Math.random() - 0.5) * 80;
        
        // Try to get click position relative to boss container
        const container = document.querySelector('.boss-container');
        if (container) {
            pain.style.left = `calc(50% + ${offsetX}px)`;
            pain.style.top = `calc(50% + ${offsetY}px)`;
            container.appendChild(pain);
        }

        setTimeout(() => {
            if (pain && pain.parentNode) pain.remove();
        }, 800);
    }

    function triggerWin() {
        isExploding = true;
        if (navigator.vibrate) navigator.vibrate([50, 50, 100, 50, 200]);
        if (typeof trackEvent === 'function') trackEvent('win_pinata');

        // Boss explode animation
        bossEl.classList.add('boss-explode-anim');

        // Show win text
        setTimeout(() => {
            if (!arenaOverlay) return;
            const container = document.querySelector('.boss-container');
            if (container) {
                container.innerHTML = `
                    <div class="boss-win-text">חיסלתם את הלימודים!<br><span>החופש קורא לכם! 😎🎉</span></div>
                `;
            }
            
            // Rain emojis
            for(let i=0; i<40; i++) {
                setTimeout(() => {
                    if(!arenaOverlay) return;
                    spawnWinEmoji();
                }, i * 40);
            }

            // Auto close after some time
            setTimeout(() => {
                closeBossFight();
            }, 4500);

        }, 400); // Wait for explode anim
    }

    function spawnWinEmoji() {
        if (!arenaOverlay) return;
        const emoji = document.createElement('div');
        emoji.className = 'boss-win-emoji';
        emoji.textContent = WIN_EMOJIS[Math.floor(Math.random() * WIN_EMOJIS.length)];
        
        const startX = Math.random() * 100;
        emoji.style.left = startX + '%';
        emoji.style.top = '-20px';
        
        const duration = 1 + Math.random() * 1.5;
        emoji.style.animationDuration = duration + 's';
        
        arenaOverlay.appendChild(emoji);
        
        setTimeout(() => {
            if (emoji && emoji.parentNode) emoji.remove();
        }, duration * 1000);
    }

    function closeBossFight() {
        const timerCard = document.getElementById('main-timer-bg');
        if (!timerCard || !arenaOverlay) return;

        arenaOverlay.remove();
        arenaOverlay = null;

        // Restore hidden elements
        const hiddenEls = timerCard.querySelectorAll('[data-boss-prev-display]');
        hiddenEls.forEach(el => { el.style.display = el.dataset.bossPrevDisplay || ''; delete el.dataset.bossPrevDisplay; });
        Array.from(timerCard.children).forEach(el => { el.style.pointerEvents = ''; });

        timerCard.style.overflow = '';
        if (triggerBtn) triggerBtn.style.display = '';

        // Cleanup
        delete window._bossHit;
        delete window._bossClose;
    }

    function initGame() {
        createTriggerButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }
})();
