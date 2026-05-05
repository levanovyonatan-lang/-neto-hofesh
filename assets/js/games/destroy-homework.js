// --- Destroy the Homework Mini-Game ---
// לחיצה על אימוג'י מוחבא בתחתית המסך מפעילה מצב ירי על שיעורי בית
// הדפים נופלים רק בתוך כרטיסיית הטיימר כדי לא לחסום פרסומות

(function() {
    const HOMEWORK_EMOJIS = ['📓', '📝', '📖', '📐', '📏', '✏️'];
    const MATH_PROBLEMS = ['2+2=?', '7×8=?', '15-9=?', '3²=?', '½+¼=?', '√16=?', '9÷3=?', '6×7=?', '11+14=?', '100-37=?'];
    const GAME_DURATION_MS = 12000;
    const SPAWN_INTERVAL_MS = 500;

    let isGameActive = false;
    let score = 0;
    let spawnInterval = null;
    let triggerBtn = null;
    let scoreDisplay = null;
    let gameContainer = null;

    function createTriggerButton() {
        const timerCard = document.getElementById('main-timer-bg');
        if (!timerCard) return;

        triggerBtn = document.createElement('div');
        triggerBtn.id = 'homework-trigger';
        triggerBtn.textContent = '📓';
        triggerBtn.title = 'לחצו עליי...';
        triggerBtn.setAttribute('role', 'button');
        triggerBtn.setAttribute('aria-label', 'משחק השמדת שיעורי בית');
        timerCard.style.position = 'relative';
        timerCard.appendChild(triggerBtn);

        triggerBtn.addEventListener('click', startGame);
    }

    function startGame() {
        if (isGameActive) return;
        isGameActive = true;
        score = 0;

        // רטט
        if (navigator.vibrate) navigator.vibrate([30, 20, 30]);

        // החבא את הכפתור
        triggerBtn.style.display = 'none';

        // הפוך את כרטיסיית הטיימר למיכל המשחק
        const timerCard = document.getElementById('main-timer-bg');
        if (!timerCard) { isGameActive = false; return; }

        gameContainer = timerCard;
        gameContainer.style.position = 'relative';
        gameContainer.style.overflow = 'hidden';
        gameContainer.classList.add('hw-crosshair-mode');

        // תצוגת ניקוד בתוך הכרטיסייה
        scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'hw-score-display';
        scoreDisplay.innerHTML = '💥 <span id="hw-score-val">0</span>';
        gameContainer.appendChild(scoreDisplay);

        // התחל להוציא דפים
        spawnInterval = setInterval(spawnHomework, SPAWN_INTERVAL_MS);

        // סיום המשחק
        setTimeout(endGame, GAME_DURATION_MS);
    }

    function spawnHomework() {
        if (!gameContainer) return;

        const hw = document.createElement('div');
        hw.className = 'hw-paper';

        const emoji = HOMEWORK_EMOJIS[Math.floor(Math.random() * HOMEWORK_EMOJIS.length)];
        const problem = MATH_PROBLEMS[Math.floor(Math.random() * MATH_PROBLEMS.length)];
        hw.innerHTML = `<span class="hw-paper-emoji">${emoji}</span><span class="hw-paper-text">${problem}</span>`;

        // מיקום אקראי בתוך הכרטיסייה (אחוזים יחסיים)
        const startX = Math.random() * 60 + 10;
        hw.style.left = startX + '%';

        // נדנוד מצומצם לרוחב הכרטיסייה
        const swayAmount = (Math.random() - 0.5) * 80;
        hw.style.setProperty('--hw-sway', swayAmount + 'px');
        hw.style.animationDuration = (Math.random() * 0.8 + 1.2) + 's';

        hw.addEventListener('click', (e) => {
            e.stopPropagation();
            destroyHomework(hw);
        });
        gameContainer.appendChild(hw);

        // ניקוי אוטומטי כשנגמרת האנימציה
        hw.addEventListener('animationend', () => hw.remove());
        setTimeout(() => { if (hw.parentNode) hw.remove(); }, 3000);
    }

    function destroyHomework(hw) {
        if (!isGameActive) return;
        score++;

        // רטט קצר
        if (navigator.vibrate) navigator.vibrate(20);

        // עדכון ניקוד
        const scoreVal = document.getElementById('hw-score-val');
        if (scoreVal) scoreVal.textContent = score;

        // אנימציית פיצוץ (יחסי לכרטיסייה)
        const rect = hw.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();
        hw.remove();

        const boom = document.createElement('div');
        boom.className = 'hw-explosion';
        boom.textContent = '💥';
        boom.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
        boom.style.top = (rect.top - containerRect.top + rect.height / 2) + 'px';
        gameContainer.appendChild(boom);
        setTimeout(() => boom.remove(), 600);
    }

    function endGame() {
        isGameActive = false;
        clearInterval(spawnInterval);

        if (gameContainer) {
            gameContainer.classList.remove('hw-crosshair-mode');
            // נקה דפים שנשארו
            gameContainer.querySelectorAll('.hw-paper').forEach(p => p.remove());
        }

        // הצג תוצאה
        if (scoreDisplay) {
            const msg = score >= 15 ? 'מכונת השמדה! 🔥' : score >= 10 ? 'אלוף! 🏆' : score >= 5 ? 'לא רע... 😏' : score >= 2 ? 'המורה ניצחה אותך 😂' : 'בושה וחרפה 🤦‍♂️';
            scoreDisplay.innerHTML = `${msg}<br><span style="font-size:18px;">השמדתם ${score} שיעורי בית!</span>`;
            scoreDisplay.classList.add('hw-score-final');
            setTimeout(() => {
                if (scoreDisplay) scoreDisplay.remove();
                scoreDisplay = null;
                if (gameContainer) {
                    gameContainer.style.overflow = '';
                }
                gameContainer = null;
            }, 3000);
        }

        // החזר את הכפתור
        setTimeout(() => {
            if (triggerBtn) triggerBtn.style.display = '';
        }, 3500);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const observer = new MutationObserver(() => {
            const mainScreen = document.getElementById('main-screen');
            if (mainScreen && mainScreen.style.display !== 'none') {
                createTriggerButton();
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    });
})();
