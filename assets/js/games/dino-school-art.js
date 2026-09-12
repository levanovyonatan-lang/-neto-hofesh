// Compact demo artwork. The original runner owns movement, scoring and collisions.
(function () {
    'use strict';
    if (new URLSearchParams(location.search).get('show_demo') !== 'true') return;
    const themes = [
        ['#e5eef0', '#bdced0', '#d2d9d6'],
        ['#edf0e7', '#bbc9b7', '#d6dace'],
        ['#f1e9e4', '#d1b6aa', '#ddd1c5'],
        ['#e2edef', '#adc9cc', '#bfd7d8'],
        ['#e9eee4', '#b7c8ae', '#d4c9ad'],
        ['#eeeadc', '#c8bea2', '#d6c9aa'],
        ['#e7eeeb', '#b0c6bd', '#cbd8cd'],
        ['#eee9ee', '#c3b8c8', '#d6cfd9'],
        ['#e4edf2', '#b4cbd8', '#cfdee6'],
        ['#eee7e5', '#cdb9b5', '#d7cdca'],
        ['#566a76', '#768c92', '#8b9da0'],
        ['#e3eee8', '#b2cbb8', '#d0ddc5']
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
        ['האוטובוס? בדרך.', 'עוד חמש דקות...', 'שוקו לפני בוחן', 'רק לא לאחר שוב', 'השיפוץ מסיים י״ב', 'הצלצול לא מחכה'],
        ['זה לבוחן?', 'גם השם שווה נקודות', 'לא למדנו את זה!', 'שאלה קלה. למורה.'],
        ['תרשום לי? לא.', 'טוסט בלי תור?', 'טרופית של תקווה', 'הבורקס האחרון'],
        ['לא שיעור שחייה', 'מי סגר את הברז?', 'רצפה עם בונוס', 'הברז לקח חופש'],
        ['עוד סיבוב קטן', 'הליכה זה גם ספורט', 'קרוקס לא נחשב', 'מי החביא את הכדור?'],
        ['עוד חמש דקות...', 'אין כאן קליטה', 'מי הביא רמקול?', 'זה לא קיצור דרך'],
        ['זה לא פטל!', 'לא לטעום. שוב.', 'מי ערבב את זה?', 'הניסוי הצליח. בערך.'],
        ['שיעור חופשי. כמעט.', 'המורה רק מאחרת', 'הפסקה לא רשמית', 'ששש... המנהל'],
        ['מי נגע בשלט?', 'להביא מעיל לבוחן', '16 זה לא ציון', 'הקוטב, כיתה ג׳2'],
        ['אני רק עובר פה', 'זימון לשיחה קצרה', 'ההורים כבר יודעים?', 'המנהל רואה הכול'],
        ['מי נשאר תורן?', 'האחרון מכבה אור', 'גם השומר הלך', 'לא יום הורים עכשיו'],
        ['לחופש! בלי חוברת?', 'נתראה בספטמבר', 'השיעורים? במזוודה', 'סוף סוף צלצול טוב']
    ];

    function create(container) {
        const canvas = document.createElement('canvas');
        canvas.className = 'dino-element dino-art-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        container.prepend(canvas); container.classList.add('dino-art-active');
        const ctx = canvas.getContext('2d');
        let stage = 0, distance = 0, width = 0, height = 0, runSeed = nextScene;
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
        function caption(text, x, y) {
            ctx.font = '600 10px Arial'; ctx.textAlign = 'center'; ctx.direction = 'rtl';
            ctx.fillStyle = stage === 10 ? '#e1e7d5' : '#647d73'; ctx.fillText(text, x, y, 112);
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
        function door(x, label) {
            rect(x, 83, 42, 78, '#a4b9ad'); rect(x + 3, 86, 36, 75, '#c2cebb');
            rect(x + 8, 94, 12, 24, '#e3e9d9'); rect(x + 31, 132, 6, 2, '#8caa9a');
            caption(label, x + 21, 77);
        }
        function board(x, title) {
            rect(x, 81, 96, 50, '#adbfb2'); rect(x + 3, 84, 90, 43, '#f0f3e7');
            caption(title, x + 48, 104);
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
        function classroom(x, variant) {
            const p = themes[stage];
            const joke = wallJokes[stage][variant];
            const shift = variant % 2 ? 40 : 0;
            if ([1, 8].includes(stage)) {
                board(x + 28 + shift, joke);
                if (variant < 2) windowPane(x + 180 + shift, 82); else shelf(x + 184, variant);
                bench(x + 49 + shift, 144, true);
                if (stage === 8) {
                    rect(x + 263, 72, 54, 15, '#f0f3e9'); rect(x + 269, 82, 42, 2, '#a2bec4');
                } else if (variant % 2) plant(x + 300); else door(x + 286, 'ג׳2');
            } else if (stage === 2) {
                rect(x + 28, 90, 105, 47, '#bbcbbb'); caption(joke, x + 80, 104);
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
                caption(joke, x + 298, 97);
                if (variant % 2) {
                    for (let n = 0; n < 5; n++) line(x + 30, 84 + n * 11, x + 74, 84 + n * 11, '#c5b99d', 3);
                }
                if (variant > 1) circle(x + 309, 138, 7, '#c7b999');
            } else if (stage === 6) {
                board(x + 28 + shift, joke);
                rect(x + 187, 129, 99, 5, '#aac0b2');
                for (let n = 0; n < 3; n++) {
                    const a = x + 198 + n * 28; rect(a + 4, 106, 6, 10, '#bbd0c5');
                    if (variant % 2) rect(a, 113, 15, 15, ['#b2c7ad', '#c9b7c8', '#acc6cf'][n]);
                    else triangle(a, 113, 15, 15, ['#b2c7ad', '#c9b7c8', '#acc6cf'][n]);
                }
                if (variant > 1) plant(x + 324);
            } else {
                if (variant % 2) shelf(x + 28, variant); else windowPane(x + 28, 84);
                door(x + 184 + shift, stage === 9 ? 'המנהל' : stage === 10 ? 'יציאה' : 'ג׳2');
                caption(joke, x + 104, 73);
                if (stage === 3) {
                    rect(x + 291, 127, 26, 26, '#a9c4bf'); rect(x + 288, 125, 32, 4, '#8faeb1');
                    line(x + 310, 118, x + 310, 125, '#8faeb1');
                } else bench(x + 281, 144);
                if (stage === 7) { rect(x + 281, 132, 66, 12, p[1]); }
                if (variant > 1) plant(x + 114);
            }
        }
        function outside(x, variant) {
            if (stage === 0) {
                for (let b = 0; b < 2; b++) {
                    const a = x + 17 + b * 154, y = 78 + (b + variant) % 3 * 8;
                    rect(a, y, 113, 75, '#cbd7d0'); rect(a - 3, y - 3, 119, 4, '#b7c8bd');
                    rect(a + 12, y - 10, 16, 7, '#e9ece0');
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
                rect(x + 171, 93, 112, 18, '#f0f3e8'); caption(wallJokes[0][variant], x + 227, 106);
            } else if (stage === 5) {
                triangle(x - 20, 91 + variant * 4, 217, 72, '#d0c7b3'); triangle(x + 157, 110, 208, 53, '#dad0b8');
                rect(x + 279, 128, 3, 36, '#aaab8e'); rect(x + 263, 124, 40, 13, '#e4ddbf');
                if (variant % 2) { triangle(x + 50, 125, 47, 36, '#b9c6af'); triangle(x + 63, 136, 21, 25, '#93ada1'); }
                if (variant > 1) plant(x + 178);
                caption(wallJokes[stage][variant], x + 276, 116);
            } else {
                rect(x + 49, 81, 166, 82, '#ccd9c3'); rect(x + 44, 78, 176, 4, '#abc2af');
                for (let n = 0; n < 4; n++) windowPane(x + 61 + n * 38, 91, 24, 29);
                rect(x + 117, 130, 29, 33, '#aec7bc');
                caption(wallJokes[stage][variant], x + 294, 103);
                if (variant % 2) plant(x + 289); else bench(x + 270, 144);
                if (variant > 1) for (let n = 0; n < 5; n++) triangle(x + 68 + n * 24, 68, 12, 9, n % 2 ? '#c6baa9' : '#b1c8b7');
            }
        }
        function draw() {
            if (!ctx || !width || !height) return;
            const dpr = Math.min(devicePixelRatio || 1, 2), p = themes[stage];
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
            // Scale the artwork only. The player's 30px ground baseline is unchanged.
            ctx.save(); ctx.scale(1, (height - 30) / 170);
            rect(0, 0, width, 170, p[0]);
            if (![0, 5, 11].includes(stage)) rect(0, 136, width, 34, p[1] + '55');
            const scroll = distance * .14, offset = scroll % 450;
            // World-indexed variants stay continuous across tile wraps and use no gameplay RNG.
            for (let x = offset - 450, tile = 0; x < width; x += 450, tile++) {
                const count = stage === 0 ? 6 : 4;
                const index = runSeed + stage * 3 + Math.floor(scroll / 450) - tile;
                const variant = (index % count + count) % count;
                if ([0, 5, 11].includes(stage)) outside(x, variant); else classroom(x, variant);
            }
            // Quiet foreground lane keeps small obstacles easy to distinguish.
            rect(0, 152, width, 18, p[0] + 'b0');
            ctx.restore();
            rect(0, height - 30, width, 30, p[2]);
            rect(0, height - 30, width, 1, '#91a89d');
            for (let x = distance % 125 - 125; x < width; x += 125)
                line(x, height - 12, x + 15, height - 12, '#91a39840', 1);
            rect(0, 0, width, 53, '#f5f7ef'); rect(0, 52, width, 1, '#d6dfd3');
        }
        const observer = new ResizeObserver(() => {
            width = container.clientWidth; height = container.clientHeight;
            const dpr = Math.min(devicePixelRatio || 1, 2);
            canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); draw();
        });
        observer.observe(container);
        return {
            setStage(index) {
                stage = Math.max(0, Math.min(11, index));
                if (stage === 0) { runSeed = ++nextScene; distance = 0; }
                canvas.dataset.stage = String(stage + 1); draw();
            },
            update(speed, timeScale) { distance += speed * timeScale; draw(); },
            destroy() { observer.disconnect(); canvas.remove(); container.classList.remove('dino-art-active'); }
        };
    }
    window.DinoSchoolArt = { create };
})();
