// --- UI עבור טבלת שיאים ומודל הרשמה ---

document.addEventListener("DOMContentLoaded", () => {
    injectFirebaseUI();
    
    const uiUrlParams = new URLSearchParams(window.location.search);
    if(uiUrlParams.get('openGame') === 'dino_game_over') {
        window.pendingDinoGameOver = {
            score: uiUrlParams.get('score'),
            stage: uiUrlParams.get('stage'),
            killer: uiUrlParams.get('killer')
        };
        const hash = uiUrlParams.get('hash');
        if (hash) {
            window.location.hash = hash;
        }
    }
    
    if(uiUrlParams.get('openLogin') === 'true' && window.showLeaderboard) {
        window.showLeaderboard();
    }
});

function injectFirebaseUI() {
    // הזרקת CSS למודלים
    const style = document.createElement('style');
    style.innerHTML = `
        .fb-modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.85);
            display: flex; align-items: center; justify-content: center;
            z-index: 10000;
            opacity: 0; pointer-events: none; transition: 0.3s ease;
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
        .fb-title { color: #1e293b; font-size: 22px; font-weight: 800; margin-bottom: 10px; }
        .fb-subtitle { font-size: 14px; color: #64748b; margin-bottom: 20px; line-height: 1.4; }
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
        .lb-emoji { font-size: 20px; width: 30px; text-align: center; }
        .lb-name { flex-grow: 1; font-weight: 500; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .lb-score { font-weight: bold; color: #0f172a; }
        .emoji-grid { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; margin-top: 10px; margin-bottom: 15px; max-height: 150px; overflow-y: auto; padding: 5px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }
        .emoji-grid::-webkit-scrollbar { width: 6px; }
        .emoji-grid::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .emoji-btn { background: #f1f5f9; border: 2px solid transparent; border-radius: 8px; font-size: 24px; padding: 5px; cursor: pointer; transition: 0.2s; }
        .emoji-btn:hover { background: #e2e8f0; transform: scale(1.1); }
        .emoji-btn.selected { border-color: #3b82f6; background: #bfdbfe; transform: scale(1.1); }
    `;
    document.head.appendChild(style);

    // מודל השלמת הרשמה
    const regModalHTML = `
        <div class="fb-modal-overlay" id="reg-modal">
            <div class="fb-modal">
                <button class="fb-modal-close" onclick="closeModals()">×</button>
                <div class="fb-title">הרשמה ובחירת כינוי לאתר</div>
                <div class="fb-subtitle">הכינוי ישמש אותך בכל משחקי האתר, וישמר בטבלאות השיאים הארציות:</div>
                <input type="text" class="fb-input" id="reg-nickname" placeholder="לדוגמה: אלוף_ישראל_123" maxlength="15">
                
                <div class="fb-subtitle" style="margin-top: 15px;">בחר/י דמות לפרופיל:</div>
                <div class="emoji-grid" id="reg-emoji-grid"></div>
                <input type="hidden" id="reg-selected-emoji" value="👤">
                
                <div class="fb-checkbox-wrap">
                    <input type="checkbox" id="reg-newsletter">
                    <label for="reg-newsletter">אני מאשר/ת קבלת עדכונים, הפתעות ופרסומות למייל מנטו חופש.</label>
                </div>
                
                <button class="fb-btn" onclick="submitRegistration()">שמור כינוי וסיימנו</button>
                <div class="terms-text">בלחיצה על שמירה אני מאשר/ת את <a href="terms.html" target="_blank" style="color: #3b82f6;">תקנון האתר ומדיניות הפרטיות</a>.</div>
            </div>
        </div>
    `;

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    
    // בדוק אם זה דפדפן ספארי אמיתי (שולל כרום ואפליקציית גוגל)
    const isChromeOrGoogle = /Chrome|CriOS|GSA/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !isChromeOrGoogle && !/Android/i.test(ua);
    
    // הצג התחברות באימייל רק אם מדובר באפליקציית מסך בית (PWA) או בדפדפן ספארי
    const showEmailAuth = isStandalone || isSafari;

    let authHTML = `
        <div id="lb-auth-section" style="border-top: 2px solid #f1f5f9; padding-top: 15px; margin-top: 10px;">
            <p style="font-size: 13px; color: #64748b; margin-bottom: 10px; font-weight: bold;">התחבר בשביל לשמור על השיא שלך או להיכנס לטבלה:</p>
    `;

    if (!showEmailAuth) {
        authHTML += `
            <button class="fb-btn google" onclick="handleGoogleLogin()" style="margin-bottom: 15px;">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20">
                התחבר עם Google
            </button>
        `;
    } else {
        authHTML += `
            <form onsubmit="handleEmailLogin(event)">
                <input type="email" id="lb-email" class="fb-input" placeholder="אימייל" style="margin-bottom: 8px;" autocomplete="off" required>
                <input type="text" id="lb-password" class="fb-input" placeholder="סיסמה (6 תווים לפחות)" style="margin-bottom: 5px;" autocomplete="off" onfocus="this.type='password'" required>
                <div style="text-align: right; margin-bottom: 15px; padding-right: 5px;">
                    <a href="javascript:void(0)" onclick="handleForgotPassword()" style="color: #3b82f6; font-size: 12px; text-decoration: none;">שכחת סיסמה?</a>
                </div>
                <button type="submit" class="fb-btn" id="lb-email-btn" style="font-size: 16px; padding: 10px 0;">התחבר / הירשם</button>
                <div id="lb-email-error" style="color: #ef4444; font-size: 12px; margin-top: 5px; display: none;"></div>
            </form>
        `;
    }

    authHTML += `</div>`;

    // מודל טבלת שיאים והתחברות
    const lbModalHTML = `
        <div class="fb-modal-overlay" id="lb-modal">
            <div class="fb-modal">
                <div class="fb-title">🏆 טבלת השיאים 🏆</div>
                
                <ul class="leaderboard-list" id="lb-list">
                    <div style="text-align: center; padding: 20px; color: #94a3b8;">טוען נתונים...</div>
                </ul>
                
                ${authHTML}
                
                <div id="lb-user-section" style="display: none; border-top: 2px solid #f1f5f9; padding-top: 15px; margin-top: 10px;">
                    <p style="font-size: 14px; font-weight: bold; color: #10b981;" id="lb-user-greeting">היי כינוי!</p>
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                        <div id="lb-share-container" style="display: none;"></div>
                        <button class="fb-btn" style="background: #3b82f6; color: white; font-size: 12px; padding: 6px 15px; width: auto; margin-bottom: 0;" onclick="if(window.openPersonalArea) { closeModals(); window.openPersonalArea(); }">👤 אזור אישי</button>
                    </div>
                </div>
                
                <div style="margin-top: 15px;">
                    <button class="fb-btn" style="background: #e2e8f0; color: #475569; font-size: 14px; padding: 8px 0;" onclick="closeModals()">חזרה למשחק</button>
                </div>
            </div>
        </div>
    `;

    const personalAreaModalHTML = `
        <div id="personal-area-modal" class="fb-modal-overlay">
            <div class="fb-modal" style="max-width: 400px; padding: 25px; position: relative; text-align: center;">
                <button onclick="if(window.closePersonalArea) window.closePersonalArea()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b;">&times;</button>
                <div class="fb-title" style="margin-top: 0; color: #0f172a; margin-bottom: 20px;">האזור האישי</div>
                
                <div style="background: #f8fafc; border-radius: 12px; padding: 15px; margin-bottom: 25px;">
                    <div id="pa-emoji-display" style="font-size: 50px; margin-bottom: 10px;">👤</div>
                    <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">הכינוי שלך בטבלה:</div>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <div id="pa-nickname-display" style="font-size: 24px; font-weight: 900; color: #3b82f6;"></div>
                        <button onclick="if(window.editNicknameUI) window.editNicknameUI()" style="background: #e2e8f0; color: #334155; border: none; cursor: pointer; font-size: 14px; padding: 5px 10px; border-radius: 6px; font-weight: bold;">ערוך</button>
                    </div>
                    
                    <div id="pa-nickname-edit-container" style="display: none; margin-top: 15px;">
                        <input type="text" id="pa-nickname-input" class="auth-input" maxlength="20" placeholder="כינוי חדש...">
                        <div style="margin-top: 10px; font-size: 12px; font-weight: bold; color: #64748b;">בחר דמות חדשה:</div>
                        <div class="emoji-grid" id="pa-emoji-grid"></div>
                        <input type="hidden" id="pa-selected-emoji" value="👤">
                        
                        <button onclick="if(window.saveNewNickname) window.saveNewNickname()" class="auth-submit-btn" style="padding: 8px 15px; margin-top: 10px;">שמור שינויים</button>
                    </div>
                    <div id="pa-error-msg" style="color: #ef4444; font-size: 13px; margin-top: 10px; font-weight: bold; display: none;"></div>
                </div>

                <div id="pa-account-actions" style="display: flex; justify-content: center; gap: 15px; font-size: 13px;">
                    <button onclick="if(window.handleLogout) window.handleLogout()" style="background: none; border: none; color: #64748b; cursor: pointer; text-decoration: underline;">התנתק מהחשבון</button>
                    <button onclick="if(window.handleDeleteAccount) window.handleDeleteAccount()" style="background: none; border: none; color: #ef4444; cursor: pointer; text-decoration: underline; opacity: 0.8;">מחק חשבון</button>
                </div>
            </div>
        </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = regModalHTML + lbModalHTML + personalAreaModalHTML;
    document.body.appendChild(container);
    
    // רשימת האימוג'ים הזמינים לפרופיל
    window.availableProfileEmojis = [
        "👤", "🦁", "🐯", "🐻", "🐼", "🐨", "🐸", "🐙", "🦄", "🦊",
        "👾", "🤖", "👻", "👽", "🤠", "😎", "🤓", "🦸‍♂️", "🧚", "🧜‍♂️",
        "💣", "💩", "🤡", "😈", "💀", "🦖", "🐒", "🦍", "🦧", "🐧",
        "🦉", "🦇", "🐺", "🐗", "🍔", "🍕", "🍟", "🍩", "🍦", "🍭",
        "⚽", "🏀", "🏈", "🎸", "🎧", "🚀", "🛸", "🚁", "🏎️", "🎮",
        "🎲", "🎯", "🏆", "🥇", "🔥", "⚡", "✨", "🌟", "👑", "💎",
        "🤪", "🤫", "🤯", "🥶", "🥵", "🥸", "🤑", "🤭", "🤩", "🥷",
        "🧛", "🧟", "🧝", "🦈", "🐊", "🐍", "🐢", "🦥", "🦝", "🦩",
        "🌮", "🍣", "🥩", "🍉", "🍓", "💯", "💸", "🔮", "🧿", "🎭",
        "🪀", "🛹", "🏍️", "🚜", "🚽", "☠️", "🤘", "✌️", "👊", "💪", 
        "🧠", "👀", "👅", "🧊", "🇮🇱", "🇺🇸"
    ];
    
    window.renderEmojiGrid = function(containerId, inputId) {
        const grid = document.getElementById(containerId);
        if (!grid) return;
        grid.innerHTML = '';
        
        window.availableProfileEmojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'emoji-btn';
            btn.textContent = emoji;
            btn.type = 'button';
            
            // הגדרת ברירת מחדל
            if (emoji === document.getElementById(inputId).value) {
                btn.classList.add('selected');
            }
            
            btn.onclick = () => {
                document.querySelectorAll(`#${containerId} .emoji-btn`).forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                document.getElementById(inputId).value = emoji;
            };
            
            grid.appendChild(btn);
        });
    };
    
    // אתחול רשתות האימוג'י
    renderEmojiGrid('reg-emoji-grid', 'reg-selected-emoji');
    renderEmojiGrid('pa-emoji-grid', 'pa-selected-emoji');
    
    // בדיקה האם הגענו לכאן מקישור של "פתיחה בכרום" או קישור שיתוף
    if (window.location.search.includes('openLogin=true')) {
        const tryOpenLeaderboard = () => {
            if (window.showLeaderboard && window.getTopDinoScores) {
                window.showLeaderboard();
            } else {
                setTimeout(tryOpenLeaderboard, 200);
            }
        };
        setTimeout(tryOpenLeaderboard, 500);
    }
}

window.closeModals = function() {
    document.getElementById('reg-modal').classList.remove('active');
    document.getElementById('lb-modal').classList.remove('active');

    if (window.pendingDinoGameOver) {
        const tryGameOver = () => {
            if (window.showDinoGameOver) {
                window.showDinoGameOver(
                    window.pendingDinoGameOver.score, 
                    window.pendingDinoGameOver.stage,
                    window.pendingDinoGameOver.killer
                );
                window.pendingDinoGameOver = null;
            } else {
                setTimeout(tryGameOver, 100);
            }
        };
        tryGameOver();
    }
}

window.showRegistrationCompletionModal = function(user) {
    document.getElementById('lb-modal').classList.remove('active');
    window.pendingFirebaseUser = user;
    document.getElementById('reg-modal').classList.add('active');
}

window.submitRegistration = async function() {
    const nickname = document.getElementById('reg-nickname').value.trim();
    const optIn = document.getElementById('reg-newsletter').checked;
    const emoji = document.getElementById('reg-selected-emoji').value || "👤";
    
    if(!nickname || nickname.length < 2) {
        alert("אנא הזן כינוי באורך 2 תווים לפחות.");
        return;
    }
    
    // סינון קללות וקישורים
    const hasForbiddenWord = window.containsProfanity(nickname);
    const hasLink = /(http|https|www\.|:\/\/)|\.(com|co\.il|org|net|me|xyz|io|gov)/i.test(nickname);
    
    if (hasForbiddenWord || hasLink) {
        alert("הכינוי מכיל מילים לא ראויות או קישורים. אנא בחר כינוי אחר.");
        return;
    }
    
    const btn = document.querySelector('#reg-modal .fb-btn');
    btn.textContent = "שומר...";
    btn.disabled = true;
    
    if(window.completeUserRegistration) {
        await window.completeUserRegistration(window.pendingFirebaseUser, nickname, optIn, emoji);
    }
    
    closeModals();
        // Update any current high score they just achieved
        const currentHS = parseInt(localStorage.getItem('dinoHighScore')) || 0;
        if(currentHS > 0 && window.saveDinoHighScore) {
            window.saveDinoHighScore(currentHS);
        }
}

window.showLeaderboard = async function(score, stage, killer) {
    if (window.pendingFirebaseUser && !window.currentUserProfile) {
        window.showRegistrationCompletionModal(window.pendingFirebaseUser);
        return;
    }
    
    // סנכרון השיא המקומי לשרת במידה והוא גבוה יותר ממה ששמור בשרת
    if (window.currentUserProfile && window.saveDinoHighScore) {
        const localScore = parseInt(localStorage.getItem('dinoHighScore')) || 0;
        const serverScore = window.currentUserProfile.dinoHighScore || 0;
        const maxScore = Math.max(localScore, serverScore);
        
        const token = localStorage.getItem('dinoHighScoreToken');
        const timeElapsed = localStorage.getItem('dinoTimeElapsed');
        
        if (maxScore > 0 && !localStorage.getItem('forceSync_v1_modal')) {
            await window.saveDinoHighScore(maxScore, token, timeElapsed);
            localStorage.setItem('forceSync_v1_modal', 'true');
        } else if (localScore > serverScore) {
            await window.saveDinoHighScore(localScore, token, timeElapsed);
        }
    }
    
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
        
        const currentUid = (window.firebaseAuth && window.firebaseAuth.currentUser) ? window.firebaseAuth.currentUser.uid : null;
        let userRank = null;
        let userScore = null;
        
        scores.forEach((s, index) => {
            let rankStr = (index + 1) + ".";
            if(index === 0) rankStr = "🥇";
            if(index === 1) rankStr = "🥈";
            if(index === 2) rankStr = "🥉";
            
            const isCurrentUser = currentUid && s.uid === currentUid;
            if (isCurrentUser) {
                userRank = index + 1;
                userScore = s.score;
            }
            
            const liStyle = isCurrentUser ? 'border: 2px solid #34d399; background: rgba(52, 211, 153, 0.1);' : '';
            const liId = isCurrentUser ? 'id="current-user-lb-row"' : '';
            
            listEl.innerHTML += `
                <li class="leaderboard-item" ${liId} style="${liStyle}">
                    <span class="lb-rank">${rankStr}</span>
                    <span class="lb-emoji">${s.emoji || '👤'}</span>
                    <span class="lb-name">${s.nickname || "אנונימי"}</span>
                    <span class="lb-score">${s.score}</span>
                </li>
            `;
        });
        
        // גלילה לשורה של המשתמש
        setTimeout(() => {
            const userRow = document.getElementById('current-user-lb-row');
            if (userRow) {
                userRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
        
        // הצגת כפתור שיתוף בוואטסאפ אם המשתמש בטבלה
        const shareContainer = document.getElementById('lb-share-container');
        if (shareContainer && userRank && userScore) {
            let sharePath = window.location.pathname;
            
            if (typeof userConfig !== 'undefined' && userConfig.schoolType && userConfig.targetIntent) {
                const intent = userConfig.targetIntent;
                const school = userConfig.schoolType;
                let targetSlug = null;
                
                if (intent.startsWith('summer')) {
                    targetSlug = (school === 'high') ? 'summer-high' : 'summer';
                } else if (intent.startsWith('hanukkah')) {
                    targetSlug = 'hanukkah';
                } else if (intent.startsWith('purim')) {
                    targetSlug = 'purim';
                } else if (intent.startsWith('pesach')) {
                    targetSlug = 'pesach';
                } else if (intent.startsWith('atzmaut')) {
                    targetSlug = 'atzmaut';
                } else if (intent.startsWith('lagbaomer')) {
                    targetSlug = 'lag-baomer';
                } else if (intent.startsWith('shavuot')) {
                    targetSlug = 'shavuot';
                }
                
                if (targetSlug) {
                    sharePath = `/${targetSlug}/`;
                }
            }
            
            let urlObj = new URL(sharePath, window.location.origin);
            urlObj.searchParams.set('playDino', 'true');
            if (typeof userConfig !== 'undefined' && userConfig.schoolType && userConfig.targetIntent) {
                urlObj.searchParams.set('schoolType', userConfig.schoolType);
                urlObj.searchParams.set('targetIntent', userConfig.targetIntent);
            }
            const shareUrl = urlObj.toString();
            const shareText = encodeURIComponent(`הגעתי למקום ה-${userRank} בדינוזאור של נטו חופש עם ${userScore.toLocaleString()} נקודות! בואו נראה אתכם עוקפים אותי 🦖 ${shareUrl}`);
            shareContainer.innerHTML = `
                <a href="https://api.whatsapp.com/send?text=${shareText}" target="_blank" class="fb-btn" style="display: inline-flex; align-items: center; justify-content: center; gap: 5px; background: #25D366; color: white; font-size: 12px; padding: 6px 15px; width: auto; margin-bottom: 0; text-decoration: none; box-shadow: 0 4px 10px rgba(37,211,102,0.3); animation: subtle-pulse 2s infinite;">
                    📢 שתפו שיא
                </a>
            `;
            shareContainer.style.display = 'block';
        } else if (shareContainer) {
            shareContainer.style.display = 'none';
        }
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

window.handleGoogleLogin = function() {
    if(window.firebaseSignIn) {
        window.firebaseSignIn().catch(e => {
            console.error("Login failed in UI", e);
        });
    }
}

window.handleEmailLogin = async function(event) {
    if (event) event.preventDefault();
    const emailField = document.getElementById('lb-email');
    const passwordField = document.getElementById('lb-password');
    const email = emailField.value.trim();
    const password = passwordField.value;
    const errorEl = document.getElementById('lb-email-error');
    
    // Blur fields to help iOS Safari detect the end of typing and trigger the Save Password prompt
    emailField.blur();
    passwordField.blur();
    
    if(!email || !password || password.length < 6) {
        errorEl.textContent = "אנא הזן אימייל תקין וסיסמה של 6 תווים לפחות.";
        errorEl.style.display = "block";
        return;
    }
    
    const btn = document.getElementById('lb-email-btn');
    const originalText = btn.textContent;
    btn.textContent = "מתחבר...";
    btn.disabled = true;
    errorEl.style.display = "none";
    
    if(window.firebaseEmailAuth) {
        try {
            await window.firebaseEmailAuth(email, password);
            // On success, onAuthStateChanged in init.js will handle the UI update
        } catch(error) {
            console.error("Email auth failed:", error);
            errorEl.style.display = "block";
            if (error.code === 'auth/email-already-in-use') {
                errorEl.textContent = "האימייל כבר בשימוש עם חשבון אחר, אולי בחרת סיסמה שגויה?";
            } else if (error.code === 'auth/invalid-email') {
                errorEl.textContent = "כתובת האימייל אינה תקינה.";
            } else if (error.code === 'auth/weak-password') {
                errorEl.textContent = "הסיסמה חלשה מדי, בחר לפחות 6 תווים.";
            } else {
                errorEl.textContent = "שגיאה בהתחברות: נסה שוב";
            }
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }
}

window.handleForgotPassword = async function() {
    const email = document.getElementById('lb-email').value.trim();
    const errorEl = document.getElementById('lb-email-error');
    
    if(!email) {
        errorEl.textContent = "אנא הזן את האימייל שלך למעלה ואז לחץ 'שכחת סיסמה?'.";
        errorEl.style.display = "block";
        return;
    }
    
    errorEl.style.display = "none";
    if(window.firebaseResetPassword) {
        try {
            await window.firebaseResetPassword(email);
            alert("נשלח אליך למייל קישור לאיפוס הסיסמה! בדוק את תיבת הדואר הנכנס (וגם בתיקיית הספאם).");
        } catch(error) {
            console.error("Password reset failed:", error);
            errorEl.style.display = "block";
            if (error.code === 'auth/user-not-found') {
                errorEl.textContent = "לא נמצא משתמש עם האימייל הזה.";
            } else if (error.code === 'auth/invalid-email') {
                errorEl.textContent = "כתובת האימייל אינה תקינה.";
            } else {
                errorEl.textContent = "שגיאה בשליחת קישור האיפוס: נסה שוב";
            }
        }
    }
}

// פונקציית עזר לסינון קללות
window.containsProfanity = function(text) {
    if (!text) return false;
    const forbiddenWords = [
        "זונה", "שרמוטה", "בן זונה", "בת זונה", "זין", "כוס", "מניאק", "הומו", "קוקסינל", 
        "קחבה", "כלב", "כלבה", "חרא", "פיזדמט", "סעמק", "כוסאמק", "שרלילה", "שפיך", "זרע",
        "בולבול", "שד", "ציצי", "תחת", "ישבן", "זדיין", "מזדיין", "מצוץ", "מוצץ", "שואה",
        "נאצי", "היטלר", "מחבל", "פיגוע", "אונס", "פדופיל", "מטומטם", "מפגר", "אוטיסט",
        "דפוק", "אידיוט", "טיפש", "מכוער", "שמן", "דבה", "גיי", "לסבית", "קוקי", "ערבי",
        "יהודון", "רוסי", "אתיופי", "כושי", "ניגר", "זבל", "חמור", "קוף", "חזיר",
        
        // קללות נוספות, בריונות, ופגיעה אישית שמקובלות בקרב בני נוער
        "תמות", "תתאבד", "מוות", "סרטן", "איידס", "מחלה", "נכה", "מוגבל", "אוטיסטית",
        "פרחה", "צ'אחלה", "ערס", "שפחה", "מכוערת", "שמנה", "כונפה", "לוזר", "אפס", 
        "טמבל", "אהבל", "כסיל", "חנון", "משוגע", "פסיכופט", "פסיכופת", "חריין",
        "שתוק", "סתום", "מסריח", "מגעיל", "דוחה", "פלוץ", "קקי", 
        
        // הטרדות והקשרים מיניים
        "סקס", "פורנו", "ערום", "עירום", "אונליפאנס", "אזיין", "מזדיינת", "מוצצת",
        "זונות", "מניאקים", "אמא שלך", "אחותך", "אמאך",
        
        // מילים באנגלית
        "fuck", "shit", "bitch", "asshole", "cunt", "dick", "slut", "whore", 
        "faggot", "nigger", "nigga", "retard", "kys", "kill yourself", "die", "cancer", 
        "porn", "porno", "sex", "onlyfans"
    ];
    
    // בודק אם אחת מהמילים ברשימה נמצאת בטקסט (מתעלם מאותיות רישיות/קטנות אם זה באנגלית)
    return forbiddenWords.some(word => text.toLowerCase().includes(word));
}

window.closePersonalArea = () => {
    const modal = document.getElementById('personal-area-modal');
    if (modal) modal.classList.remove('active');
};

// פונקציות אזור אישי
window.openPersonalArea = () => {
    const modal = document.getElementById('personal-area-modal');
    if (!modal) return;
    
    if (window.currentUserProfile) {
        const nickDisplay = document.getElementById('pa-nickname-display');
        if (nickDisplay) nickDisplay.textContent = window.currentUserProfile.nickname || 'משתמש אנונימי';
        
        const emojiDisplay = document.getElementById('pa-emoji-display');
        if (emojiDisplay) emojiDisplay.textContent = window.currentUserProfile.emoji || '👤';
        
        const editContainer = document.getElementById('pa-nickname-edit-container');
        if (editContainer) editContainer.style.display = 'none';
        
        const errorMsg = document.getElementById('pa-error-msg');
        if (errorMsg) errorMsg.style.display = 'none';
        
        const inputField = document.getElementById('pa-nickname-input');
        if (inputField) inputField.value = window.currentUserProfile.nickname || '';
        
        const emojiField = document.getElementById('pa-selected-emoji');
        if (emojiField) emojiField.value = window.currentUserProfile.emoji || '👤';
        if (window.renderEmojiGrid) window.renderEmojiGrid('pa-emoji-grid', 'pa-selected-emoji');
        
        const accountActions = document.getElementById('pa-account-actions');
        if (accountActions) accountActions.style.display = 'flex';
        
        modal.classList.add('active');
    } else {
        alert("עליך להתחבר כדי לגשת לאזור האישי.");
    }
};

window.closePersonalArea = () => {
    const modal = document.getElementById('personal-area-modal');
    if (modal) modal.classList.remove('active');
};

window.editNicknameUI = () => {
    document.getElementById('pa-nickname-edit-container').style.display = 'block';
    const accountActions = document.getElementById('pa-account-actions');
    if (accountActions) accountActions.style.display = 'none';
    document.getElementById('pa-nickname-input').focus();
};

window.saveNewNickname = async () => {
    const newName = document.getElementById('pa-nickname-input').value.trim();
    const newEmoji = document.getElementById('pa-selected-emoji').value || '👤';
    const errorMsg = document.getElementById('pa-error-msg');
    
    if (newName.length < 2) {
        errorMsg.textContent = "הכינוי קצר מדי.";
        errorMsg.style.display = 'block';
        return;
    }
    
    const containsLink = /(http|https|www\.|:\/\/)|\.(com|co\.il|org|net|me|xyz|io|gov)/i.test(newName);
    
    if (window.containsProfanity(newName)) {
        errorMsg.textContent = "הכינוי מכיל מילים לא ראויות.";
        errorMsg.style.display = 'block';
        return;
    }
    
    if (containsLink) {
        errorMsg.textContent = "הכינוי לא יכול להכיל קישורים.";
        errorMsg.style.display = 'block';
        return;
    }
    
    try {
        const user = window.firebaseAuth.currentUser;
        if (!user) return;
        
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
        
        const userDocRef = doc(window.firebaseDb, "users", user.uid);
        await setDoc(userDocRef, { nickname: newName, emoji: newEmoji }, { merge: true });
        
        const scoreDocRef = doc(window.firebaseDb, "dino_scores", user.uid);
        await setDoc(scoreDocRef, { nickname: newName, emoji: newEmoji }, { merge: true });
        
        if (window.currentUserProfile) {
            window.currentUserProfile.nickname = newName;
            window.currentUserProfile.emoji = newEmoji;
        }
        
        document.getElementById('pa-nickname-display').textContent = newName;
        document.getElementById('pa-emoji-display').textContent = newEmoji;
        document.getElementById('pa-nickname-edit-container').style.display = 'none';
        
        const accountActions = document.getElementById('pa-account-actions');
        if (accountActions) accountActions.style.display = 'flex';
        
        // Hide error message on success
        errorMsg.style.display = 'none';
        
        // Show temporary success message
        const editBtn = document.querySelector('#pa-nickname-edit-container button');
        const originalBtnText = editBtn.textContent;
        editBtn.textContent = "נשמר בהצלחה! ✔️";
        setTimeout(() => {
            editBtn.textContent = originalBtnText;
        }, 2000);
        
        if (window.updateLeaderboardUI) window.updateLeaderboardUI();
        
    } catch (error) {
        console.error("Error updating nickname:", error);
        errorMsg.textContent = "שגיאה בשמירת הכינוי.";
        errorMsg.style.display = 'block';
    }
};
