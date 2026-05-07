// --- Vacation Slot Machine Game ---
// גלגל המזל של החופש - 3 גלגלים עם אימוג'ים של חופש

(function() {
    const REEL_EMOJIS = ['🏖️', '🍦', '😴', '🎮', '🏊', '🎬', '🍉', '☀️', '🕶️', '🤪'];
    const RESULTS = [
        { combo: '🏖️', msg: 'ביום הראשון של החופש – ים! 🌊' },
        { combo: '🍦', msg: 'גלידה על חשבון ההורים 😏' },
        { combo: '😴', msg: 'לישון עד הצהריים. מגיע לך! 💤' },
        { combo: '🎮', msg: 'מרתון גיימינג של 6 שעות 🔥' },
        { combo: '🏊', msg: 'קפיצת בטן לבריכה! 💦' },
        { combo: '🎬', msg: 'מרתון סרטים עם חברים 🍿' },
        { combo: '🍉', msg: 'אבטיח ענק על החוף 🏝️' },
        { combo: '☀️', msg: 'שיזוף עד שתהפכו לשוקולד 😎' },
        { combo: '🕶️', msg: 'יום בקניון עם החבר\'ה 🛍️' },
        { combo: '🤪', msg: 'אתגר: להגיד למורה שאתם אוהבים אותה 😂' },
    ];
    const JACKPOT_MSGS = [
        '🎉 ג\'קפוט! החופש הזה יהיה אגדי!',
        '🔥 שלושה זהים! מזל מטורף!',
        '🏆 וואו! המזל שלכם ברמות!',
    ];

    let triggerBtn = null;
    let isSpinning = false;
    let slotOverlay = null;

    function createTriggerButton() {
        const timerCard = document.getElementById('main-timer-bg');
        if (!timerCard) return;

        triggerBtn = document.createElement('div');
        triggerBtn.id = 'slot-trigger';
        triggerBtn.textContent = '🎰';
        triggerBtn.title = 'גלגל המזל של החופש!';
        triggerBtn.setAttribute('role', 'button');
        triggerBtn.setAttribute('aria-label', 'גלגל המזל של החופש');
        timerCard.style.position = 'relative';
        timerCard.appendChild(triggerBtn);

        triggerBtn.addEventListener('click', openSlotMachine);
    }

    function openSlotMachine() {
        if (slotOverlay) return;
        if (typeof trackEvent === 'function') trackEvent('open_slot_machine');

        const timerCard = document.getElementById('main-timer-bg');
        if (!timerCard) return;

        timerCard.style.overflow = 'hidden';
        triggerBtn.style.display = 'none';

        // Hide other elements
        const hiddenEls = timerCard.querySelectorAll('.ai-tools, .net-days-container, .absolute-timer, .total-days-label, .vacation-length-box, [id*="tip"], h2');
        hiddenEls.forEach(el => { el.dataset.slotPrevDisplay = el.style.display; el.style.display = 'none'; });
        Array.from(timerCard.children).forEach(el => {
            if (el.id !== 'slot-overlay' && el.id !== 'slot-trigger') el.style.pointerEvents = 'none';
        });

        // Create overlay
        slotOverlay = document.createElement('div');
        slotOverlay.id = 'slot-overlay';
        slotOverlay.innerHTML = `
            <div class="slot-title">🎰 גלגל המזל של החופש</div>
            <div class="slot-machine">
                <div class="slot-reel-container">
                    <div class="slot-reel" id="reel1"><div class="slot-reel-inner"></div></div>
                    <div class="slot-reel" id="reel2"><div class="slot-reel-inner"></div></div>
                    <div class="slot-reel" id="reel3"><div class="slot-reel-inner"></div></div>
                </div>
                <div class="slot-result" id="slot-result"></div>
                <button class="slot-spin-btn" id="slot-spin-btn" onclick="window._slotSpin()">סובבו! 🎰</button>
                <button class="slot-close-btn" id="slot-close-btn" onclick="window._slotClose()">✖ סגור</button>
            </div>
        `;
        timerCard.appendChild(slotOverlay);

        // Fill reels with emojis
        fillReels();

        // Expose functions globally
        window._slotSpin = spin;
        window._slotClose = closeSlotMachine;
    }

    function fillReels() {
        for (let i = 1; i <= 3; i++) {
            const inner = document.querySelector(`#reel${i} .slot-reel-inner`);
            if (!inner) continue;
            // Put many emojis for scrolling effect
            let html = '';
            for (let j = 0; j < 30; j++) {
                const emoji = REEL_EMOJIS[Math.floor(Math.random() * REEL_EMOJIS.length)];
                html += `<div class="slot-emoji">${emoji}</div>`;
            }
            inner.innerHTML = html;
        }
    }

    function spin() {
        if (isSpinning) return;
        isSpinning = true;
        if (typeof trackEvent === 'function') trackEvent('spin_slot_machine');

        const resultEl = document.getElementById('slot-result');
        const spinBtn = document.getElementById('slot-spin-btn');
        resultEl.textContent = '';
        resultEl.className = 'slot-result';
        spinBtn.disabled = true;
        spinBtn.textContent = 'מסתובב... 🌀';

        if (navigator.vibrate) navigator.vibrate([20, 10, 20]);

        // Pick 3 random results
        const picks = [];
        for (let i = 0; i < 3; i++) {
            picks.push(Math.floor(Math.random() * REEL_EMOJIS.length));
        }

        // Refill and animate each reel
        const delays = [800, 1200, 1600];
        for (let i = 1; i <= 3; i++) {
            const inner = document.querySelector(`#reel${i} .slot-reel-inner`);
            if (!inner) continue;

            // Build reel: random emojis + final pick at the end
            let html = '';
            const totalItems = 15 + i * 5; // more items = longer spin
            for (let j = 0; j < totalItems - 1; j++) {
                const emoji = REEL_EMOJIS[Math.floor(Math.random() * REEL_EMOJIS.length)];
                html += `<div class="slot-emoji">${emoji}</div>`;
            }
            html += `<div class="slot-emoji">${REEL_EMOJIS[picks[i-1]]}</div>`;
            inner.innerHTML = html;

            // Animate: scroll to bottom
            inner.style.transition = 'none';
            inner.style.transform = 'translateY(0)';
            requestAnimationFrame(() => {
                const targetY = -(totalItems - 1) * 60; // 60px per emoji
                inner.style.transition = `transform ${delays[i-1]}ms cubic-bezier(0.15, 0.8, 0.3, 1)`;
                inner.style.transform = `translateY(${targetY}px)`;
            });
        }

        // Show result after last reel stops
        setTimeout(() => {
            const r1 = REEL_EMOJIS[picks[0]];
            const r2 = REEL_EMOJIS[picks[1]];
            const r3 = REEL_EMOJIS[picks[2]];

            let msg;
            if (r1 === r2 && r2 === r3) {
                // Jackpot!
                msg = JACKPOT_MSGS[Math.floor(Math.random() * JACKPOT_MSGS.length)];
                resultEl.classList.add('slot-jackpot');
                if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);
                if (typeof trackEvent === 'function') trackEvent('slot_jackpot', { emoji: r1 });
            } else {
                // Use the last reel's emoji for the message
                const match = RESULTS.find(r => r.combo === r3) || RESULTS[0];
                msg = match.msg;
            }

            resultEl.textContent = msg;
            spinBtn.disabled = false;
            spinBtn.textContent = 'עוד פעם! 🎰';
            isSpinning = false;
        }, 1800);
    }

    function closeSlotMachine() {
        if (typeof trackEvent === 'function') trackEvent('close_slot_machine');

        const timerCard = document.getElementById('main-timer-bg');
        if (!timerCard || !slotOverlay) return;

        slotOverlay.remove();
        slotOverlay = null;

        // Restore hidden elements
        const hiddenEls = timerCard.querySelectorAll('[data-slot-prev-display]');
        hiddenEls.forEach(el => { el.style.display = el.dataset.slotPrevDisplay || ''; delete el.dataset.slotPrevDisplay; });
        Array.from(timerCard.children).forEach(el => { el.style.pointerEvents = ''; });

        timerCard.style.overflow = '';
        if (triggerBtn) triggerBtn.style.display = '';

        // Cleanup
        delete window._slotSpin;
        delete window._slotClose;
    }

    function initSlotMachine() {
        createTriggerButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSlotMachine);
    } else {
        initSlotMachine();
    }
})();
