// Compact demo artwork. The original runner owns movement, scoring and collisions.
(function () {
    'use strict';
    if (new URLSearchParams(location.search).get('show_demo') !== 'true') return;
    const themes = [
        ['#e5eef0', '#bdced0', '#d2d9d6'],
        ['#fbe2e5', '#dfb7be', '#e8cdd0'],
        ['#fff0d4', '#dcc498', '#ead9b9'],
        ['#d8f1f5', '#a4cdd6', '#bddfe5'],
        ['#e2f3d9', '#b2cda6', '#ccdfc1'],
        ['#f9eccd', '#d5c298', '#e7d6b0'],
        ['#eae2f6', '#c6b6dc', '#dbcee9'],
        ['#fce5ed', '#deb7c8', '#ecd0db'],
        ['#deedfc', '#b1cbe5', '#c9ddf0'],
        ['#f7dfd9', '#d7b3ac', '#e7cac3'],
        ['#566a76', '#768c92', '#8b9da0'],
        ['#def5e9', '#a9d4bf', '#c4e6d3']
    ];
    const css = document.createElement('style');
    css.textContent = `
        #main-timer-bg.dino-art-active { height:200px !important; padding:0 !important; border-radius:12px !important; border:1px solid #a7b9b2 !important; animation:none !important; isolation:isolate; box-shadow:0 5px 18px #354d4510 !important; }
        .dino-art-canvas { position:absolute; inset:0; width:100%; height:100%; z-index:0; pointer-events:none; }
        .dino-art-score { top:7px !important; right:12px !important; z-index:30; min-width:94px; padding:0; color:#304b49 !important; }
        .dino-art-score #dino-score-val { font-size:19px !important; }
        .dino-art-score .dino-score-text { font-size:9px !important; line-height:1.1 !important; }
        .dino-art-active .dino-art-close { top:9px !important; left:10px !important; color:#607b75 !important; width:28px; height:28px; line-height:28px; font-size:17px !important; }
        .dino-art-active .dino-objective { top:12px !important; left:44px !important; transform:none !important; font-size:11px !important; max-width:calc(100% - 162px); line-height:1.3; color:#487565 !important; }
        .dino-art-active .dino-art-announcement { top:59px !important; width:calc(100% - 24px); max-width:350px; box-sizing:border-box; padding:5px 8px; font-size:13px !important; line-height:1.4; border-radius:4px; background:#f7faf2ed; color:#3c5a54 !important; text-shadow:none !important; animation:none !important; pointer-events:none; }
        .dino-art-active #dino-game-over { width:calc(100% - 54px) !important; max-width:320px !important; max-height:184px !important; overflow-y:auto; padding:9px 12px !important; border:1px solid #8caaa0 !important; border-radius:8px !important; background:#263f3df5 !important; gap:4px !important; }
        .dino-art-active #dino-game-over > div:first-child { font-size:13px !important; line-height:1.3 !important; }
        .dino-art-active #dino-game-over > div:last-child { margin-top:4px !important; gap:4px !important; }
        .dino-art-active #dino-game-over button { background-color:transparent !important; }
        .dino-art-active #dino-game-over button:first-child { background:#537e70 !important; }
    `;
    document.head.appendChild(css);
    let nextScene = Date.now() % 60;
    const wallJokes = [
        ['האוטובוס? בדרך.', 'עוד חמש דקות...', 'שוקו לפני בוחן', 'רק לא לאחר שוב', 'השיפוץ מסיים י״ב', 'הצלצול לא מחכה', 'התיק ער. אני לא.', 'רצתי. מגיע פטור?', 'הפקק מאחר איתי', 'המיטה קראה לי'],
        ['זה לבוחן?', 'גם השם שווה נקודות', 'לא למדנו את זה!', 'שאלה קלה. למורה.', 'מותר חבר טלפוני?', 'הטיוטה יותר חכמה', 'השם: 100. השאר: 0', 'יש מועד ג׳?', 'החומר? בקבוצה.', 'מי מחק את התשובה?'],
        ['תרשום לי? לא.', 'טוסט בלי תור?', 'טרופית של תקווה', 'הבורקס האחרון', 'התור עד המזכירות', 'אין עודף. יש זעתר.', 'הטוסט עוד לומד', 'הקטשופ לא בחינם?', 'מי לקח לי ביס?', 'צלצול? עוד ביס.'],
        ['לא שיעור שחייה', 'מי סגר את הברז?', 'רצפה עם בונוס', 'הברז לקח חופש', 'שחייה בלי הרשמה', 'נא להביא סנפירים', 'גם התיק שותה', 'המסדרון נהר', 'מי הזמין בריכה?', 'המגב ביקש תגבור'],
        ['עוד סיבוב קטן', 'הליכה זה גם ספורט', 'קרוקס לא נחשב', 'מי החביא את הכדור?', 'רצתי לקיוסק. נחשב?', 'הספסל בהרכב', 'חימום? כבר חם.', 'הכדור על הגג שוב', 'מי סופר סיבובים?', 'השרוך ביקש הפסקה'],
        ['עוד חמש דקות...', 'אין כאן קליטה', 'מי הביא רמקול?', 'זה לא קיצור דרך', 'האוטובוס איפה?', 'הסנדוויץ׳ כבר נגמר', 'מי אורז כרית לטיול?', 'עלייה אחרונה. בטח.', 'גם הווייז התעייף', 'המדריך לא מזיע?!'],
        ['זה לא פטל!', 'לא לטעום. שוב.', 'מי ערבב את זה?', 'הניסוי הצליח. בערך.', 'הקצף לא בתוכנית', 'מי הזמין עשן?', 'המבחנה במבחן', 'לא לנער. מאוחר.', 'זה אמור לזהור?', 'החלוק היה לבן'],
        ['שיעור חופשי. כמעט.', 'המורה רק מאחרת', 'הפסקה לא רשמית', 'ששש... המנהל', 'אל תזכירו שיעורים', 'מי שאל איפה המורה?', 'שקט, שומעים חופש', 'יש מחליפה. תתחבאו.', 'הכיסא שומר מקום', 'הנוכחות ברוח'],
        ['מי נגע בשלט?', 'להביא מעיל לבוחן', '16 זה לא ציון', 'הקוטב, כיתה ג׳2', 'השלט אצל הבנים', 'הטוש קפא שוב', 'המזגן ניצח בוויכוח', 'הפשרה בהפסקה', 'מי הזמין חורף?', 'בחוץ קיץ. פה לא.'],
        ['אני רק עובר פה', 'זימון לשיחה קצרה', 'ההורים כבר יודעים?', 'המנהל רואה הכול', 'לא רצתי. מיהרתי.', 'זה לא אני. זה התיק.', 'באתי להשקות עציץ', 'הצלצול אישר לי', 'הייתי בדרך לכיתה', 'שיחה קצרה: שעה'],
        ['מי נשאר תורן?', 'האחרון מכבה אור', 'גם השומר הלך', 'לא יום הורים עכשיו', 'המחברת נחרה?', 'מי עושה פה נוכחות?', 'הפעמון עובד לילה', 'גם הרוח מבריזה', 'מחר אני כבר פה', 'השרת ישן בשרת?'],
        ['לחופש! בלי חוברת?', 'נתראה בספטמבר', 'השיעורים? במזוודה', 'סוף סוף צלצול טוב', 'השעון על שקט', 'הילקוט יצא לפנסיה', 'הים עושה נוכחות', 'מועד ב׳? לא שמעתי', 'לא קמים. נקודה.', 'המחק בחופשה']
    ];

    function create(container) {
        const startingColor = getComputedStyle(container).backgroundColor;
        const rgb = value => {
            const channels = value.match(/[\d.]+/g);
            if (value.startsWith('rgb') && channels && Number(channels[3] ?? 1) > 0)
                return channels.slice(0, 3).map(Number);
            if (/^#[\da-f]{6}$/i.test(value)) return [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16));
            return [229, 238, 240];
        };
        const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
        const hex = color => '#' + color.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
        const base = rgb(startingColor);
        const palettes = themes.map(p => p.map(rgb));
        palettes[0] = [base, mix(base, [106, 137, 132], .28), mix(base, [106, 137, 132], .16)];
        let colors = palettes[0].map(c => c.slice()), fromColors = colors, colorProgress = 1;
        const canvas = document.createElement('canvas');
        canvas.className = 'dino-element dino-art-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        container.prepend(canvas); container.classList.add('dino-art-active');
        const ctx = canvas.getContext('2d');
        let stage = 0, previousStage = 0, distance = 0, width = 0, height = 0, runSeed = nextScene;
        const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
        function line(x, y, x2, y2, color, weight = 2) {
            ctx.strokeStyle = color; ctx.lineWidth = weight; ctx.beginPath();
            ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
        }
        function circle(x, y, r, color) {
            ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        }
        function triangle(x, y, w, h, color) {
            ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y + h);
            ctx.lineTo(x + w / 2, y); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
        }
        function caption(text, x, y, maxWidth = 112) {
            ctx.font = '600 10px Arial'; ctx.textAlign = 'center'; ctx.direction = 'rtl';
            ctx.fillStyle = stage === 10 ? '#e1e7d5' : '#536e64'; ctx.fillText(text, x, y, maxWidth);
        }
        function windowPane(x, y, w = 48, h = 47) {
            rect(x, y, w, h, '#f2f3e9'); rect(x + 3, y + 3, w - 6, h - 6, stage === 10 ? '#657e8b' : '#bed4d5');
            rect(x, y, w, 7, '#c4cebf'); rect(x + w / 2, y + 7, 2, h - 7, '#edf0e3');
            if (stage === 10) circle(x + w - 12, y + 19, 5, '#d9dfc6');
        }
        function bench(x, y, classroom = false) {
            if (classroom) {
                rect(x + 4, y - 12, 16, 12, '#8aabb5'); rect(x + 40, y - 12, 16, 12, '#8aabb5');
            }
            rect(x, y, 66, 5, '#c9c6ad');
            line(x + 7, y + 5, x + 7, y + 20, '#9aafa3');
            line(x + 59, y + 5, x + 59, y + 20, '#9aafa3');
        }
        function door(x) {
            rect(x, 83, 42, 78, '#a4b9ad'); rect(x + 3, 86, 36, 75, '#c2cebb');
            rect(x + 8, 94, 12, 24, '#e3e9d9'); rect(x + 31, 132, 6, 2, '#8caa9a');
        }
        function board(x) {
            rect(x, 81, 96, 50, '#adbfb2'); rect(x + 3, 84, 90, 43, '#f0f3e7');
            line(x + 19, 115, x + 71, 115, '#c9d6c8', 1);
            rect(x - 2, 130, 100, 3, '#a8bba9');
        }
        function plant(x) {
            rect(x + 7, 143, 15, 18, '#c0b798'); line(x + 14, 142, x + 14, 121, '#a4b9a0');
            circle(x + 8, 130, 8, '#b0c5a6'); circle(x + 20, 121, 10, '#bad0ae');
        }
        function shelf(x, variant) {
            rect(x, 109, 45, 49, '#b3c2ad'); rect(x + 3, 112, 39, 43, '#dce4cc');
            rect(x, 131, 45, 3, '#b3c2ad');
            for (let i = 0; i < 4; i++) rect(x + 6 + i * 8, 118, 5, 13 + i % 2 * 2, ['#a9c0c3', '#c9bca7', '#bcb2c7', '#b6c7a4'][(i + variant) % 4]);
        }
        function classroom(x, variant, detail, stage) {
            const p = themes[stage];
            if (detail === 1) {
                circle(x + 372, 91, 10, '#aebfb5'); circle(x + 372, 91, 8, '#eef2e5');
                line(x + 372, 91, x + 372, 86, '#81968a', 1);
                line(x + 372, 91, x + 377, 91, '#81968a', 1);
            } else if (detail === 2) {
                rect(x + 359, 89, 28, 35, '#c1b89e'); rect(x + 362, 93, 22, 27, '#eee9d6');
                for (let n = 0; n < 3; n++) line(x + 366, 99 + n * 6, x + 382, 99 + n * 6, '#b5bca9', 1);
            }
            const shift = variant % 2 ? 40 : 0;
            if ([1, 8].includes(stage)) {
                board(x + 28 + shift);
                if (variant < 2) windowPane(x + 180 + shift, 82); else shelf(x + 184, variant);
                bench(x + 49 + shift, 144, true);
                if (stage === 8) {
                    rect(x + 263, 72, 54, 15, '#f0f3e9'); rect(x + 269, 82, 42, 2, '#a2bec4');
                } else if (variant % 2) plant(x + 300); else door(x + 286);
            } else if (stage === 2) {
                rect(x + 28, 90, 105, 47, '#bbcbbb');
                for (let n = 0; n < 3; n++) rect(x + 54 + n * 18, 119, 10, 16, '#dbd2b0');
                rect(x + 22, 137, 118, 5, '#eee3cc'); rect(x + 28, 142, 106, 22, '#c7b8a5');
                if (variant % 2) shelf(x + 206, variant); else windowPane(x + 206, 82);
                bench(x + 278, 145, variant > 1);
            } else if (stage === 4) {
                windowPane(x + 25, 74, 63, 46);
                rect(x + 178, 85, 53, 33, '#eef1e4');
                line(x + 193, 113, x + 217, 113, '#c1a58f', 3);
                line(x + 194, 117, x + 201, 132, '#e4e6d8', 1);
                line(x + 216, 117, x + 209, 132, '#e4e6d8', 1);
                bench(x + 280, 144);
                if (variant % 2) {
                    for (let n = 0; n < 5; n++) line(x + 30, 84 + n * 11, x + 74, 84 + n * 11, '#c5b99d', 3);
                }
                if (variant > 1) circle(x + 309, 138, 7, '#c7b999');
            } else if (stage === 6) {
                board(x + 28 + shift);
                rect(x + 187, 129, 99, 5, '#aac0b2');
                for (let n = 0; n < 3; n++) {
                    const a = x + 198 + n * 28; rect(a + 4, 106, 6, 10, '#bbd0c5');
                    if (variant % 2) rect(a, 113, 15, 15, ['#b2c7ad', '#c9b7c8', '#acc6cf'][n]);
                    else triangle(a, 113, 15, 15, ['#b2c7ad', '#c9b7c8', '#acc6cf'][n]);
                }
                if (variant > 1) plant(x + 324);
            } else {
                if (variant % 2) shelf(x + 28, variant); else windowPane(x + 28, 84);
                door(x + 184 + shift);
                if (stage === 3) {
                    rect(x + 291, 127, 26, 26, '#a9c4bf'); rect(x + 288, 125, 32, 4, '#8faeb1');
                    line(x + 310, 118, x + 310, 125, '#8faeb1');
                } else bench(x + 281, 144);
                if (stage === 7) { rect(x + 281, 132, 66, 12, p[1]); }
                if (variant > 1) plant(x + 114);
            }
        }
        function hill(x, y, w, h, color) {
            ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, 164);
            ctx.bezierCurveTo(x + w * .12, y + h, x + w * .18, y, x + w * .48, y);
            ctx.bezierCurveTo(x + w * .76, y, x + w * .8, y + h, x + w, 164);
            ctx.closePath(); ctx.fill();
        }
        function tree(x, y, size = 1) {
            rect(x - 2, y, 4, 30 * size, '#a8b39a');
            circle(x, y - 5 * size, 15 * size, '#b2c5a0');
            circle(x - 10 * size, y, 10 * size, '#b2c5a0');
        }
        function trip(x, variant) {
            const green = [0, 1, 4, 6].includes(variant);
            hill(x - 25, 95 + variant % 3 * 7, 270, 58, green ? '#cedbb7' : '#d8ceb8');
            hill(x + 175, 115, 280, 44, green ? '#bdcda9' : '#c9c0ab');
            // A winding trail, not triangular mountains, connects the small landscape scenes.
            ctx.strokeStyle = variant === 1 ? '#b4d3d7' : '#e6ddc4'; ctx.lineWidth = variant === 1 ? 9 : 6;
            ctx.beginPath(); ctx.moveTo(x + 210, 119); ctx.bezierCurveTo(x + 125, 138, x + 280, 142, x + 196, 164); ctx.stroke();
            if ([0, 1, 4, 6].includes(variant)) {
                tree(x + 65, 125, .8); tree(x + 320, 122, 1);
                if (variant === 4) tree(x + 105, 131, .65);
            }
            if ([2, 3, 7].includes(variant)) {
                for (let n = 0; n < 4; n++) {
                    ctx.fillStyle = n % 2 ? '#bfb9a8' : '#d5cebd'; ctx.beginPath();
                    ctx.ellipse(x + 50 + n * 24, 151 - n % 2 * 6, 17, 8, -.2, 0, Math.PI * 2); ctx.fill();
                }
            }
            if (variant === 3) {
                for (let n = 0; n < 3; n++) line(x + 274, 135 + n * 8, x + 351 - n * 9, 135 + n * 8, '#b6b29b', 3);
            } else if (variant === 5) {
                rect(x + 54, 118, 86, 33, '#d9c79d'); rect(x + 60, 123, 72, 13, '#b1c7c7');
                for (let n = 0; n < 4; n++) rect(x + 73 + n * 17, 123, 2, 13, '#d9c79d');
                circle(x + 72, 152, 6, '#8e9d98'); circle(x + 123, 152, 6, '#8e9d98');
                tree(x + 330, 125, .9);
            } else if (variant === 6) {
                bench(x + 112, 140); line(x + 101, 149, x + 188, 149, '#b5b59d', 3);
            } else if (variant === 7) {
                line(x + 270, 136, x + 350, 136, '#aab7a1', 2);
                for (let n = 0; n < 4; n++) line(x + 275 + n * 24, 132, x + 275 + n * 24, 159, '#aab7a1', 2);
            }
            rect(x + 368, 139, 8, 21, '#d5d5c3'); rect(x + 369, 144, 6, 3, '#8eaa9b');
        }
        function outside(x, variant, detail, stage) {
            if (stage === 0) {
                for (let b = 0; b < 2; b++) {
                    const a = x + 17 + b * 154, y = 78 + (b + variant) % 3 * 8;
                    rect(a, y, 113, 75, '#cbd7d0'); rect(a - 3, y - 3, 119, 4, '#b7c8bd');
                    rect(a + 12, y - 10, 16, 7, '#e9ece0');
                    if (detail === 1) {
                        rect(a + 45, y - 9, 25, 6, '#aebfc1'); line(a + 42, y - 3, a + 73, y - 3, '#9aadaa', 1);
                    } else if (detail === 2) {
                        rect(a + 81, y + 17, 23, 6, '#e6e9df');
                        line(a + 83, y + 21, a + 101, y + 21, '#b2c0b6', 1);
                    }
                    for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++)
                        rect(a + 13 + col * 32, y + 13 + row * 27, 16, 17, '#a9c3c6');
                }
                if (variant === 0) {
                    line(x + 140, 115, x + 140, 163, '#90aaa0');
                    rect(x + 131, 104, 20, 20, '#d4c797'); rect(x + 135, 109, 12, 9, '#91adb3');
                    bench(x + 310, 144);
                } else if (variant === 1) {
                    for (let n = 0; n < 4; n++) rect(x + 292 + n * 18, 147, 10, 14, '#e7ece1');
                    line(x + 144, 102, x + 144, 163, '#9aaea7'); rect(x + 138, 100, 13, 28, '#b3c4b7');
                    circle(x + 144, 107, 3, '#c7b49f'); circle(x + 144, 121, 3, '#a2bfa5');
                } else if (variant === 2 || variant === 5) {
                    rect(x + 22, 117, 104, 44, '#d0c7b3');
                    for (let n = 0; n < 8; n++) rect(x + 20 + n * 14, 110, 14, 8, n % 2 ? '#dfe6d3' : '#a9c0b4');
                    rect(x + 32, 129, 28, 32, '#a5bdba'); rect(x + 70, 128, 44, 22, '#e8e7ce');
                    plant(x + 318);
                } else if (variant === 3) {
                    for (let n = 0; n < 8; n++) line(x + 133 + n * 12, 117, x + 133 + n * 12, 162, '#b0c4b7');
                    line(x + 131, 124, x + 219, 124, '#a3bca9', 3);
                    rect(x + 300, 126, 5, 35, '#acb89c'); circle(x + 302, 111, 19, '#b7cca8');
                } else {
                    line(x + 292, 141, x + 292, 164, '#b6ad98', 3); line(x + 353, 141, x + 353, 164, '#b6ad98', 3);
                    rect(x + 284, 137, 77, 9, '#d6c6a9');
                    for (let n = 0; n < 4; n++) rect(x + 286 + n * 20, 138, 9, 7, '#bcb497');
                    triangle(x + 142, 141, 15, 22, '#c6b8a1');
                }
            } else if (stage === 5) {
                trip(x, variant);
            } else {
                rect(x + 49, 81, 166, 82, '#ccd9c3'); rect(x + 44, 78, 176, 4, '#abc2af');
                for (let n = 0; n < 4; n++) windowPane(x + 61 + n * 38, 91, 24, 29);
                rect(x + 117, 130, 29, 33, '#aec7bc');
                if (variant % 2) plant(x + 289); else bench(x + 270, 144);
                if (variant > 1) for (let n = 0; n < 5; n++) triangle(x + 68 + n * 24, 68, 12, 9, n % 2 ? '#c6baa9' : '#b1c8b7');
            }
        }
        function scene(sceneStage, p) {
            rect(0, 0, width, 170, p[0]);
            if (sceneStage === 0) return;
            if (![0, 5, 11].includes(sceneStage)) rect(0, 136, width, 34, p[1] + '55');
            const scroll = distance * .14, offset = scroll % 450;
            // Tile identity remains stable while it crosses the viewport.
            for (let x = offset - 450, tile = 0; x < width; x += 450, tile++) {
                const count = sceneStage === 0 ? 6 : sceneStage === 5 ? 8 : 4;
                const index = runSeed + sceneStage * 3 + Math.floor(scroll / 450) - tile;
                const variant = (index % count + count) % count;
                const detail = (Math.floor(index / count) % 3 + 3) % 3;
                if ([0, 5, 11].includes(sceneStage)) outside(x, variant, detail, sceneStage);
                else classroom(x, variant, detail, sceneStage);
            }
            rect(0, 152, width, 18, p[0] + 'b0');
        }
        function passage(x) {
            if ([1, 5, 6, 11].includes(stage)) {
                // School gates mark entering/leaving the grounds, including the trip return.
                rect(x - 8, 77, 16, 93, '#b1c2b6'); rect(x - 13, 75, 26, 6, '#d5dfce');
                for (let n = 1; n <= 5; n++) line(x + n * 9, 107, x + n * 9, 166, '#9eb6a9', 2);
                line(x + 8, 117, x + 46, 117, '#9eb6a9', 3);
            } else {
                rect(x - 11, 81, 22, 89, '#aabfb5'); rect(x - 5, 87, 10, 83, '#dce5d5');
                rect(x - 31, 81, 62, 6, '#aabfb5');
                rect(x + 11, 91, 24, 77, '#bdcdbb'); rect(x + 27, 132, 5, 2, '#829e90');
            }
        }
        function draw() {
            if (!ctx || !width || !height) return;
            const dpr = Math.min(devicePixelRatio || 1, 2), p = colors.map(hex);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
            if (stage === 0) {
                rect(0, 0, width, height, hex(palettes[0][0]));
                return;
            }
            // Scale the artwork only. The player's 30px ground baseline is unchanged.
            ctx.save(); ctx.scale(1, (height - 30) / 170);
            scene(stage, p);
            if (colorProgress < 1) {
                const boundary = -55 + (width + 110) * colorProgress;
                ctx.save(); ctx.beginPath(); ctx.rect(Math.max(0, boundary), 0, width, 170); ctx.clip();
                scene(previousStage, fromColors.map(hex)); ctx.restore();
                passage(boundary);
            }
            // Exactly one readable sign per stage/run, independent of scrolling tiles.
            const signWidth = Math.min(174, width - 28), signX = (width - signWidth) / 2;
            rect(signX, 57, signWidth, 24, stage === 10 ? '#425d5a' : '#edf2e5');
            rect(signX, 80, signWidth, 2, '#a8bda9');
            const joke = wallJokes[stage][(runSeed + stage * 3) % wallJokes[stage].length];
            caption(joke, width / 2, 73, signWidth - 12);
            ctx.restore();
            rect(0, height - 30, width, 30, p[2]);
            rect(0, height - 30, width, 1, '#91a89d');
            for (let x = distance % 125 - 125; x < width; x += 125)
                line(x, height - 12, x + 15, height - 12, '#91a39840', 1);
            rect(0, 0, width, 53, hex(mix(colors[0], [255, 255, 255], .22).map(v => Math.max(225, v))));
            rect(0, 52, width, 1, p[1]);
        }
        const observer = new ResizeObserver(() => {
            width = container.clientWidth; height = container.clientHeight;
            const dpr = Math.min(devicePixelRatio || 1, 2);
            canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); draw();
        });
        observer.observe(container);
        return {
            setStage(index) {
                const nextStage = Math.max(0, Math.min(11, index));
                if (nextStage !== stage) {
                    previousStage = stage;
                    fromColors = colors.map(c => c.slice());
                    colorProgress = 0;
                }
                stage = nextStage;
                if (stage === 0) { runSeed = ++nextScene; distance = 0; }
                canvas.dataset.stage = String(stage + 1); draw();
            },
            update(speed, timeScale) {
                distance += speed * timeScale;
                colorProgress = Math.min(1, colorProgress + timeScale / 108);
                const eased = colorProgress * colorProgress * (3 - 2 * colorProgress);
                colors = fromColors.map((c, i) => mix(c, palettes[stage][i], eased));
                draw();
            },
            destroy() { observer.disconnect(); canvas.remove(); container.classList.remove('dino-art-active'); }
        };
    }
    window.DinoSchoolArt = { create };
})();
