// --- UI עבור טבלת שיאים ומודל הרשמה ---

document.addEventListener("DOMContentLoaded", () => {
    injectFirebaseUI();
});

function injectFirebaseUI() {
    // הזרקת CSS למודלים
    const style = document.createElement('style');
    style.innerHTML = `
        .fb-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(5px);
            display: flex; align-items: center; justify-content: center;
            z-index: 10000; opacity: 0; pointer-events: none; transition: 0.3s ease;
        }
        .fb-modal-overlay.active { opacity: 1; pointer-events: all; }
        .fb-modal {
            background: #ffffff; border-radius: 20px; width: 90%; max-width: 400px;
            padding: 30px 25px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            text-align: center; position: relative; transform: scale(0.9); transition: 0.3s ease;
        }
        .fb-modal-overlay.active .fb-modal { transform: scale(1); }
        .fb-modal-close {
            position: absolute; top: 15px; left: 15px; background: none; border: none;
            font-size: 24px; color: #94a3b8; cursor: pointer;
        }
        .fb-title { color: #1e293b; font-size: 22px; font-weight: 800; margin-bottom: 15px; }
        .fb-input {
            width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0;
            border-radius: 12px; font-size: 16px; margin-bottom: 15px; box-sizing: border-box;
            font-family: inherit; text-align: center;
        }
        .fb-input:focus { border-color: #3b82f6; outline: none; }
        .fb-checkbox-wrap {
            display: flex; align-items: flex-start; gap: 10px; text-align: right; margin-bottom: 20px;
        }
        .fb-checkbox-wrap input { margin-top: 5px; width: 18px; height: 18px; }
        .fb-checkbox-wrap label { font-size: 13px; color: #475569; line-height: 1.4; }
        .fb-btn {
            background: linear-gradient(135deg, #3b82f6, #2563eb); color: white;
            border: none; border-radius: 50px; padding: 12px 0; width: 100%;
            font-size: 18px; font-weight: bold; cursor: pointer; transition: 0.2s;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        .fb-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(37, 99, 235, 0.4); }
        .fb-btn.google {
            background: white; color: #475569; border: 2px solid #e2e8f0;
            display: flex; align-items: center; justify-content: center; gap: 10px;
            box-shadow: none;
        }
        .fb-btn.google:hover { background: #f8fafc; border-color: #cbd5e1; }
        .terms-text { font-size: 11px; color: #94a3b8; margin-top: 15px; }
        
        .leaderboard-list {
            list-style: none; padding: 0; margin: 0 0 20px 0; text-align: right;
            max-height: 300px; overflow-y: auto;
        }
        .leaderboard-item {
            display: flex; justify-content: space-between; padding: 10px 15px;
            border-bottom: 1px solid #f1f5f9; align-items: center;
        }
        .leaderboard-item:nth-child(1) { background: #fef08a; font-weight: bold; border-radius: 8px; }
        .leaderboard-item:nth-child(2) { background: #e2e8f0; border-radius: 8px; }
        .leaderboard-item:nth-child(3) { background: #fed7aa; border-radius: 8px; }
        .lb-rank { font-weight: bold; color: #64748b; width: 25px; }
        .lb-name { flex-grow: 1; font-weight: 500; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .lb-score { font-weight: bold; color: #0f172a; }
    `;
    document.head.appendChild(style);

    // מודל השלמת הרשמה
    const regModalHTML = `
        <div class="fb-modal-overlay" id="reg-modal">
            <div class="fb-modal">
                <button class="fb-modal-close" onclick="closeModals()">×</button>
                <div class="fb-title">ברוך הבא לאלופים! 🏆</div>
                <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">בחר כינוי שיופיע בטבלת השיאים הארצית</p>
                <input type="text" id="reg-nickname" class="fb-input" placeholder="למשל: DinoMaster99" maxlength="15">
                
                <div class="fb-checkbox-wrap">
                    <input type="checkbox" id="reg-newsletter">
                    <label for="reg-newsletter">אני מאשר/ת קבלת עדכונים, הפתעות ופרסומות למייל מנטו חופש.</label>
                </div>
                
                <button class="fb-btn" onclick="submitRegistration()">שמור כינוי וסיימנו</button>
                <div class="terms-text">בלחיצה על שמירה אני מאשר/ת את <a href="terms.html" target="_blank" style="color: #3b82f6;">תקנון האתר ומדיניות הפרטיות</a>.</div>
            </div>
        </div>
    `;

    // מודל טבלת שיאים והתחברות
    const lbModalHTML = `
        <div class="fb-modal-overlay" id="lb-modal">
            <div class="fb-modal">
                <button class="fb-modal-close" onclick="closeModals()">×</button>
                <div class="fb-title">🏆 טבלת האלופים 🏆</div>
                
                <ul class="leaderboard-list" id="lb-list">
                    <div style="text-align: center; padding: 20px; color: #94a3b8;">טוען נתונים...</div>
                </ul>
                
                <div id="lb-auth-section" style="border-top: 2px solid #f1f5f9; padding-top: 15px; margin-top: 10px;">
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 10px;">רוצה לשמור את השיא שלך לתמיד?</p>
                    <button class="fb-btn google" onclick="handleGoogleLogin()">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20">
                        התחבר עם Google
                    </button>
                </div>
                
                <div id="lb-user-section" style="display: none; border-top: 2px solid #f1f5f9; padding-top: 15px; margin-top: 10px;">
                    <p style="font-size: 14px; font-weight: bold; color: #10b981;" id="lb-user-greeting">היי כינוי!</p>
                    <button class="fb-btn" style="background: #e2e8f0; color: #475569; font-size: 14px; padding: 8px 0; margin-top: 5px;" onclick="handleLogout()">התנתק</button>
                </div>
            </div>
        </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = regModalHTML + lbModalHTML;
    document.body.appendChild(container);
}

window.closeModals = function() {
    document.getElementById('reg-modal').classList.remove('active');
    document.getElementById('lb-modal').classList.remove('active');
}

window.showRegistrationCompletionModal = function(user) {
    window.pendingFirebaseUser = user;
    document.getElementById('reg-modal').classList.add('active');
}

window.submitRegistration = function() {
    const nickname = document.getElementById('reg-nickname').value.trim();
    const optIn = document.getElementById('reg-newsletter').checked;
    
    if(!nickname || nickname.length < 2) {
        alert("אנא הזן כינוי באורך 2 תווים לפחות.");
        return;
    }
    
    if(window.pendingFirebaseUser && window.completeUserRegistration) {
        window.completeUserRegistration(window.pendingFirebaseUser, nickname, optIn);
        closeModals();
        // Update any current high score they just achieved
        const currentHS = parseInt(localStorage.getItem('dinoHighScore')) || 0;
        if(currentHS > 0 && window.saveDinoHighScore) {
            window.saveDinoHighScore(currentHS);
        }
    }
}

window.showLeaderboard = async function() {
    document.getElementById('lb-modal').classList.add('active');
    window.updateLeaderboardUI();
    
    if(window.getTopDinoScores) {
        const scores = await window.getTopDinoScores();
        const listEl = document.getElementById('lb-list');
        listEl.innerHTML = '';
        
        if(scores.length === 0) {
            listEl.innerHTML = '<div style="text-align: center; padding: 20px; color: #94a3b8;">אין עדיין שיאים בטבלה. תהיה הראשון!</div>';
            return;
        }
        
        scores.forEach((s, index) => {
            let rankStr = (index + 1) + ".";
            if(index === 0) rankStr = "🥇";
            if(index === 1) rankStr = "🥈";
            if(index === 2) rankStr = "🥉";
            
            listEl.innerHTML += `
                <li class="leaderboard-item">
                    <span class="lb-rank">${rankStr}</span>
                    <span class="lb-name">${s.nickname || "אנונימי"}</span>
                    <span class="lb-score">${s.score}</span>
                </li>
            `;
        });
    }
}

window.updateLeaderboardUI = function() {
    const authSec = document.getElementById('lb-auth-section');
    const userSec = document.getElementById('lb-user-section');
    const greeting = document.getElementById('lb-user-greeting');
    
    if(window.currentUserProfile) {
        if(authSec) authSec.style.display = 'none';
        if(userSec) {
            userSec.style.display = 'block';
            greeting.textContent = "היי " + window.currentUserProfile.nickname + "! השיא שלך: " + (window.currentUserProfile.dinoHighScore || 0);
        }
    } else {
        if(authSec) authSec.style.display = 'block';
        if(userSec) userSec.style.display = 'none';
    }
}

window.handleGoogleLogin = async function() {
    if(window.firebaseSignIn) {
        try {
            await window.firebaseSignIn();
            // Auth observer will handle the rest
        } catch(e) {
            alert("התחברות נכשלה. אנא נסה שוב.");
        }
    }
}

window.handleLogout = async function() {
    if(window.firebaseSignOut) {
        await window.firebaseSignOut();
        alert("התנתקת בהצלחה.");
    }
}
