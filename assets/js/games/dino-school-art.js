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

    function create(container) {
        const canvas = document.createElement('canvas');
        canvas.className = 'dino-element dino-art-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        container.prepend(canvas); container.classList.add('dino-art-active');
        const ctx = canvas.getContext('2d');
        let stage = 0, distance = 0, width = 0, height = 0;
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
            ctx.fillStyle = stage === 10 ? '#e1e7d5' : '#647d73'; ctx.fillText(text, x, y);
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
        function classroom(x) {
            const p = themes[stage];
            if ([1, 8].includes(stage)) {
                board(x + 28, stage === 1 ? 'זה לבוחן?' : 'מי נגע בשלט?');
                windowPane(x + 180, 82); bench(x + 49, 144, true);
                if (stage === 8) {
                    rect(x + 263, 72, 54, 15, '#f0f3e9'); rect(x + 269, 82, 42, 2, '#a2bec4');
                } else door(x + 286, 'ג׳2');
            } else if (stage === 2) {
                rect(x + 28, 90, 105, 47, '#bbcbbb'); caption('המזנון של אבי', x + 80, 104);
                for (let n = 0; n < 3; n++) rect(x + 54 + n * 18, 119, 10, 16, '#dbd2b0');
                rect(x + 22, 137, 118, 5, '#eee3cc'); rect(x + 28, 142, 106, 22, '#c7b8a5');
                windowPane(x + 206, 82); bench(x + 278, 145);
            } else if (stage === 4) {
                windowPane(x + 25, 74, 63, 46);
                rect(x + 178, 85, 53, 33, '#eef1e4');
                line(x + 193, 113, x + 217, 113, '#c1a58f', 3);
                line(x + 194, 117, x + 201, 132, '#e4e6d8', 1);
                line(x + 216, 117, x + 209, 132, '#e4e6d8', 1);
                bench(x + 280, 144);
            } else if (stage === 6) {
                board(x + 28, 'לא לשתות!');
                rect(x + 187, 129, 99, 5, '#aac0b2');
                for (let n = 0; n < 3; n++) {
                    const a = x + 198 + n * 28; rect(a + 4, 106, 6, 10, '#bbd0c5');
                    triangle(a, 113, 15, 15, ['#b2c7ad', '#c9b7c8', '#acc6cf'][n]);
                }
            } else {
                windowPane(x + 28, 84); door(x + 184, stage === 9 ? 'המנהל' : stage === 10 ? 'יציאה' : 'ג׳2');
                if (stage === 3) {
                    rect(x + 291, 127, 26, 26, '#a9c4bf'); rect(x + 288, 125, 32, 4, '#8faeb1');
                    line(x + 310, 118, x + 310, 125, '#8faeb1');
                } else bench(x + 281, 144);
                if (stage === 7) { rect(x + 281, 132, 66, 12, p[1]); }
            }
        }
        function outside(x) {
            if (stage === 0) {
                for (let b = 0; b < 2; b++) {
                    const a = x + 17 + b * 154, y = 83 + b * 12;
                    rect(a, y, 113, 75, '#cbd7d0'); rect(a - 3, y - 3, 119, 4, '#b7c8bd');
                    rect(a + 12, y - 10, 16, 7, '#e9ece0');
                    for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++)
                        rect(a + 13 + col * 32, y + 13 + row * 27, 16, 17, '#a9c3c6');
                }
                line(x + 140, 115, x + 140, 163, '#90aaa0');
                rect(x + 131, 104, 20, 20, '#d4c797'); rect(x + 135, 109, 12, 9, '#91adb3');
                bench(x + 310, 144);
            } else if (stage === 5) {
                triangle(x - 20, 91, 217, 72, '#d0c7b3'); triangle(x + 157, 110, 208, 53, '#dad0b8');
                rect(x + 279, 128, 3, 36, '#aaab8e'); rect(x + 263, 124, 40, 13, '#e4ddbf');
            } else {
                rect(x + 49, 81, 166, 82, '#ccd9c3'); rect(x + 44, 78, 176, 4, '#abc2af');
                for (let n = 0; n < 4; n++) windowPane(x + 61 + n * 38, 91, 24, 29);
                rect(x + 117, 130, 29, 33, '#aec7bc');
                caption('לחופש!', x + 280, 108); bench(x + 270, 144);
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
            const offset = distance * .14 % 450;
            for (let x = offset - 450; x < width; x += 450) {
                if ([0, 5, 11].includes(stage)) outside(x); else classroom(x);
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
            setStage(index) { stage = Math.max(0, Math.min(11, index)); canvas.dataset.stage = String(stage + 1); draw(); },
            update(speed, timeScale) { distance += speed * timeScale; draw(); },
            destroy() { observer.disconnect(); canvas.remove(); container.classList.remove('dino-art-active'); }
        };
    }
    window.DinoSchoolArt = { create };
})();
