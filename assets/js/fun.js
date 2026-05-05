// --- Emoji Rain Easter Egg (Premium Edition) ---
// לחיצה 3 פעמים ברצף על הטיימר המרכזי מפעילה גשם אימוג'ים מטורף

(function() {
    const REQUIRED_CLICKS = 3;
    const CLICK_TIMEOUT_MS = 800;
    const RAIN_DURATION_MS = 4000;
    const EMOJI_INTERVAL_MS = 40;
    const EMOJIS = ['🍉', '☀️', '🏖️', '🕶️', '🩲', '😎', '🌊', '🍦', '🎉', '⛱️'];

    let clickCount = 0;
    let clickTimer = null;
    let isRaining = false;

    function startEmojiRain() {
        if (isRaining) return;
        isRaining = true;

        // רטט קצר בנייד (הפתעה!)
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

        // אפקט זוהר על הטיימר
        const timerCard = document.getElementById('main-timer-bg');
        if (timerCard) {
            timerCard.style.transition = 'box-shadow 0.3s ease';
            timerCard.style.boxShadow = '0 0 40px rgba(234, 179, 8, 0.6), 0 15px 35px rgba(0,0,0,0.06)';
            setTimeout(() => { timerCard.style.boxShadow = ''; }, 2000);
        }

        // אנימציית ריקוד על המספר
        const netDays = document.getElementById('main-net-days');
        if (netDays) {
            netDays.classList.add('emoji-rain-bounce');
            setTimeout(() => netDays.classList.remove('emoji-rain-bounce'), 1500);
        }

        // שלב 1: פיצוץ ראשוני של אימוג'ים (burst)
        for (let i = 0; i < 20; i++) {
            setTimeout(() => spawnEmoji(true), i * 25);
        }

        // שלב 2: גשם רציף
        const rainInterval = setInterval(() => spawnEmoji(false), EMOJI_INTERVAL_MS);

        setTimeout(() => {
            clearInterval(rainInterval);
            isRaining = false;
        }, RAIN_DURATION_MS);
    }

    function spawnEmoji(isBurst) {
        const emoji = document.createElement('div');
        emoji.className = 'emoji-drop';
        emoji.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        emoji.style.left = Math.random() * 100 + 'vw';

        // גדלים מגוונים ליצירת עומק
        const size = Math.random() * 22 + 16;
        emoji.style.fontSize = size + 'px';

        // מהירות נפילה אקראית
        const duration = isBurst ? (Math.random() * 1 + 1) : (Math.random() * 2 + 1.5);
        emoji.style.animationDuration = duration + 's';

        // כיוון נדנוד אקראי (שמאל/ימין)
        const sway = (Math.random() - 0.5) * 120;
        emoji.style.setProperty('--sway', sway + 'px');

        // סיבוב אקראי
        const rotation = Math.random() * 720 - 360;
        emoji.style.setProperty('--rotation', rotation + 'deg');

        document.body.appendChild(emoji);
        setTimeout(() => emoji.remove(), (duration + 0.5) * 1000);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const timer = document.getElementById('main-net-days');
        if (!timer) return;

        timer.style.cursor = 'pointer';
        timer.addEventListener('click', () => {
            clickCount++;
            clearTimeout(clickTimer);

            // משוב ויזואלי קטן לכל לחיצה (פולס)
            timer.style.transition = 'transform 0.15s ease';
            timer.style.transform = 'scale(1.08)';
            setTimeout(() => { timer.style.transform = 'scale(1)'; }, 150);

            if (clickCount >= REQUIRED_CLICKS) {
                clickCount = 0;
                startEmojiRain();
            } else {
                clickTimer = setTimeout(() => { clickCount = 0; }, CLICK_TIMEOUT_MS);
            }
        });
    });
})();
