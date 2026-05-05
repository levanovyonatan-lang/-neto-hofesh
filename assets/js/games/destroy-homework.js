// --- Destroy the Homework Mini-Game ---
// לחיצה על אימוג'י מוחבא בתחתית המסך מפעילה מצב ירי על שיעורי בית

(function() {
    const HOMEWORK_EMOJIS = ['📓', '📝', '📖', '📐', '📏', '✏️'];
    const MATH_PROBLEMS = ['2+2=?', '7×8=?', '15-9=?', '3²=?', '½+¼=?', '√16=?', '9÷3=?', '6×7=?', '11+14=?', '100-37=?'];
    const GAME_DURATION_MS = 12000;
    const SPAWN_INTERVAL_MS = 700;

    let isGameActive = false;
    let score = 0;
    let spawnInterval = null;
    let triggerBtn = null;
    let scoreDisplay = null;

    function createTriggerButton() {
        triggerBtn = document.createElement('div');
        triggerBtn.id = 'homework-trigger';
        triggerBtn.textContent = '📓';
        triggerBtn.title = 'לחצו עליי...';
        triggerBtn.setAttribute('role', 'button');
        triggerBtn.setAttribute('aria-label', 'משחק השמדת שיעורי בית');
        document.body.appendChild(triggerBtn);

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

        // הפעל מצב כוונת
        document.body.classList.add('hw-crosshair-mode');

        // תצוגת ניקוד
        scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'hw-score-display';
        scoreDisplay.innerHTML = '💥 <span id="hw-score-val">0</span>';
        document.body.appendChild(scoreDisplay);

        // התחל להוציא דפים
        spawnInterval = setInterval(spawnHomework, SPAWN_INTERVAL_MS);

        // סיום המשחק
        setTimeout(endGame, GAME_DURATION_MS);
    }

    function spawnHomework() {
        const hw = document.createElement('div');
        hw.className = 'hw-paper';

        const emoji = HOMEWORK_EMOJIS[Math.floor(Math.random() * HOMEWORK_EMOJIS.length)];
        const problem = MATH_PROBLEMS[Math.floor(Math.random() * MATH_PROBLEMS.length)];
        hw.innerHTML = `<span class="hw-paper-emoji">${emoji}</span><span class="hw-paper-text">${problem}</span>`;

        // מיקום אקראי
        const startX = Math.random() * 80 + 10;
        hw.style.left = startX + 'vw';

        // כיוון תנועה אקראי
        const swayAmount = (Math.random() - 0.5) * 200;
        hw.style.setProperty('--hw-sway', swayAmount + 'px');
        hw.style.animationDuration = (Math.random() * 3 + 4) + 's';

        hw.addEventListener('click', () => destroyHomework(hw));
        document.body.appendChild(hw);

        // ניקוי אוטומטי אם לא נלחץ
        setTimeout(() => { if (hw.parentNode) hw.remove(); }, 8000);
    }

    function destroyHomework(hw) {
        if (!isGameActive) return;
        score++;

        // רטט קצר
        if (navigator.vibrate) navigator.vibrate(20);

        // עדכון ניקוד
        const scoreVal = document.getElementById('hw-score-val');
        if (scoreVal) scoreVal.textContent = score;

        // אנימציית פיצוץ
        const rect = hw.getBoundingClientRect();
        hw.remove();

        const boom = document.createElement('div');
        boom.className = 'hw-explosion';
        boom.textContent = '💥';
        boom.style.left = rect.left + rect.width / 2 + 'px';
        boom.style.top = rect.top + rect.height / 2 + 'px';
        document.body.appendChild(boom);
        setTimeout(() => boom.remove(), 600);
    }

    function endGame() {
        isGameActive = false;
        clearInterval(spawnInterval);
        document.body.classList.remove('hw-crosshair-mode');

        // נקה דפים שנשארו
        document.querySelectorAll('.hw-paper').forEach(p => p.remove());

        // הצג תוצאה
        if (scoreDisplay) {
            const msg = score >= 10 ? 'אלוף! 🏆' : score >= 5 ? 'יפה מאוד! 👏' : 'נסו שוב! 💪';
            scoreDisplay.innerHTML = `${msg}<br><span style="font-size:18px;">השמדתם ${score} שיעורי בית!</span>`;
            scoreDisplay.classList.add('hw-score-final');
            setTimeout(() => {
                if (scoreDisplay) scoreDisplay.remove();
                scoreDisplay = null;
            }, 3000);
        }

        // החזר את הכפתור
        setTimeout(() => {
            if (triggerBtn) triggerBtn.style.display = '';
        }, 3500);
    }

    document.addEventListener('DOMContentLoaded', () => {
        // מוסיף את הכפתור רק אחרי שהמסך הראשי מוכן
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
