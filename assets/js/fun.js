// --- Emoji Rain Easter Egg ---
// לחיצה 5 פעמים ברצף על הטיימר המרכזי מפעילה גשם של אימוג'ים

(function() {
    const REQUIRED_CLICKS = 3;
    const CLICK_TIMEOUT_MS = 800;  // חלון הזמן בין לחיצות (0.8 שניות)
    const RAIN_DURATION_MS = 3000; // משך הגשם (3 שניות)
    const EMOJI_INTERVAL_MS = 60;  // תדירות יצירת אימוג'ים
    const EMOJIS = ['🍉', '☀️', '🏖️', '🕶️', '🩲', '😎'];

    let clickCount = 0;
    let clickTimer = null;
    let isRaining = false;

    function startEmojiRain() {
        if (isRaining) return;
        isRaining = true;

        const rainInterval = setInterval(() => {
            const emoji = document.createElement('div');
            emoji.className = 'emoji-drop';
            emoji.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
            emoji.style.left = Math.random() * 100 + 'vw';
            emoji.style.fontSize = (Math.random() * 20 + 20) + 'px';
            emoji.style.animationDuration = (Math.random() * 1.5 + 1.5) + 's';
            document.body.appendChild(emoji);
            setTimeout(() => emoji.remove(), 3500);
        }, EMOJI_INTERVAL_MS);

        setTimeout(() => {
            clearInterval(rainInterval);
            isRaining = false;
        }, RAIN_DURATION_MS);
    }

    // מחכים שהדף ייטען ומאזינים ללחיצות על הטיימר
    document.addEventListener('DOMContentLoaded', () => {
        const timer = document.getElementById('main-net-days');
        if (!timer) return;

        timer.style.cursor = 'pointer';
        timer.addEventListener('click', () => {
            clickCount++;
            clearTimeout(clickTimer);

            if (clickCount >= REQUIRED_CLICKS) {
                clickCount = 0;
                startEmojiRain();
            } else {
                clickTimer = setTimeout(() => { clickCount = 0; }, CLICK_TIMEOUT_MS);
            }
        });
    });
})();
