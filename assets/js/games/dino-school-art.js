// Demo-only scenery. Coordinates and animation never participate in collisions.
(function () {
    'use strict';
    if (new URLSearchParams(location.search).get('show_demo') !== 'true') return;

    const palettes = [
        ['#e1ece8', '#73aaa0', '#cbd7d4', '#c9e7ed'],
        ['#e9e4dc', '#9ba995', '#d2d2c6', '#c5dfe4'],
        ['#f1e4dc', '#db968c', '#ded2c9', '#bee1d9'],
        ['#d8eaeb', '#609da6', '#77b9c8', '#b2dbe9'],
        ['#e7e9dc', '#679786', '#d9bc86', '#b9dfe4'],
        ['#f3d7ac', '#bd8069', '#d7ab77', '#c1dfe5'],
        ['#dce9e5', '#568c87', '#bed0cc', '#aed6cf'],
        ['#ede3e5', '#a18aaf', '#d1cbd7', '#ecc5c4'],
        ['#d4e7ee', '#7eafc7', '#b8dbe8', '#9bc6e3'],
        ['#e3d8d4', '#ac7373', '#cfbeb9', '#d9b5a7'],
        ['#263c48', '#355564', '#344f5e', '#182b43'],
        ['#c9e6e2', '#79ac93', '#c9d0b4', '#b4dce8']
    ];

    const style = document.createElement('style');
    style.textContent = `
        #main-timer-bg.dino-art-active { height:340px !important; padding:0 !important; border-radius:8px !important; border:2px solid #304c50 !important; animation:none !important; isolation:isolate; }
        .dino-art-canvas { position:absolute; inset:0; width:100%; height:100%; z-index:0; pointer-events:none; }
        .dino-art-score { z-index:30; background:rgba(255,255,255,.94); padding:8px 12px; border:1px solid #c3d0ce; border-radius:6px; min-width:104px; box-shadow:0 3px 0 #304c5020; }
        .dino-art-active .dino-objective { top:87px !important; max-width:calc(100% - 32px); white-space:nowrap; font-size:13px !important; color:#155b49 !important; background:#f4fff5; padding:5px 10px; border:1px solid #a5cfb4; border-radius:4px; }
        .dino-art-active .dino-art-announcement { animation:none !important; top:122px !important; width:calc(100% - 32px); max-width:400px; font-size:17px !important; line-height:1.4; padding:10px 14px; box-sizing:border-box; background:rgba(255,255,255,.96); color:#233d3e !important; text-shadow:none !important; border:1px solid #b4cbc5; border-bottom:3px solid #54877b; border-radius:6px; pointer-events:none; }
        .dino-art-active #dino-game-over { max-height:285px !important; padding:16px !important; gap:8px !important; background:rgba(22,43,48,.97) !important; border-color:#86bbac !important; border-radius:8px !important; box-sizing:border-box; }
        .dino-art-active #dino-game-over > div:first-child { line-height:1.5 !important; }
        .dino-art-active .dino-art-close { background:#fff; color:#304c50 !important; width:32px; height:32px; line-height:32px; border-radius:6px; border:1px solid #c3d0ce; font-size:18px !important; }
        .dino-art-active .dino-inner { text-shadow:0 2px 2px #ffffffb0; }
        @media (max-width:380px) { #main-timer-bg.dino-art-active { height:320px !important; } }
    `;
    document.head.appendChild(style);

    function create(container) {
        const canvas = document.createElement('canvas');
        canvas.className = 'dino-element dino-art-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        container.prepend(canvas);
        container.classList.add('dino-art-active');
        const ctx = canvas.getContext('2d');
        let stage = 0, distance = 0, width = 0, height = 0;
        const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
        function line(points, color, thickness = 2) {
            ctx.strokeStyle = color; ctx.lineWidth = thickness; ctx.beginPath();
            points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
        }
        function circle(x, y, radius, color) {
            ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
        }
        function triangle(x, y, w, h, color) {
            ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y + h);
            ctx.lineTo(x + w / 2, y); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
        }
        function windowPane(x, y, w = 66, h = 67) {
            rect(x, y, w, h, '#e9eddf'); rect(x + 4, y + 4, w - 8, h - 8, stage === 10 ? '#647b89' : '#bad0ce');
            rect(x + w / 2, y + 3, 2, h - 6, '#e9eddf');
            rect(x, y, w, 10, '#c5cdc1');
            if (stage === 10) circle(x + w - 18, y + 24, 7, '#ccd2b9');
        }
        function desk(x, y) {
            rect(x + 5, y - 17, 18, 14, '#87a6ad'); rect(x + 50, y - 17, 18, 14, '#87a6ad');
            rect(x + 2, y, 71, 6, '#d1d0b7');
            line([[x + 9, y + 6], [x + 9, y + 28]], '#a1afaa', 3);
            line([[x + 66, y + 6], [x + 66, y + 28]], '#a1afaa', 3);
        }
        function board(x, y, w) {
            rect(x, y, w, 68, '#aebfba'); rect(x + 3, y + 3, w - 6, 61, '#edf0e5');
            // A few erased marker strokes convey a classroom without reading demands.
            line([[x + 14, y + 19], [x + w - 20, y + 19]], '#c8d5cc', 2);
            line([[x + 14, y + 30], [x + w * .56, y + 30]], '#d0dad0', 2);
            rect(x - 2, y + 67, w + 4, 3, '#aebfba');
        }
        function doorway(x) {
            rect(x, 95, 56, 143, '#b0c1b8'); rect(x + 4, 99, 48, 139, '#c5d0c1');
            rect(x + 11, 110, 19, 46, '#dce3d4'); rect(x + 42, 177, 7, 3, '#9cafa6');
        }
        function street() {
            rect(0, 0, width, 270, '#e3ece8');
            const start = width / 2 - 143;
            for (let b = 0; b < 2; b++) {
                const x = start + b * 166, top = 104 + b * 13;
                rect(x, top, 119, 135, b ? '#d5d9cd' : '#d0d9d2');
                rect(x - 3, top - 3, 125, 4, '#bccbc2');
                rect(x + 15, top - 11, 16, 8, '#e6e9dd');
                for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++)
                    rect(x + 15 + col * 33, top + 15 + row * 32, 16, 19, '#b4c9c6');
            }
            rect(0, 239, width, 31, '#d0d9d4');
            const stop = width * .29;
            line([[stop, 167], [stop, 259]], '#acbdb4', 3);
            rect(stop - 10, 150, 22, 24, '#c9c6a6');
            rect(stop - 6, 155, 14, 10, '#a5b7b1');
            line([[width * .65, 227], [width * .65 + 62, 227]], '#b6bfa9', 5);
            line([[width * .65 + 5, 230], [width * .65 + 5, 249]], '#a5b6aa', 3);
        }
        function interior() {
            const p = palettes[stage];
            rect(0, 0, width, 270, p[0]); rect(0, 212, width, 58, p[1]);
            rect(0, 212, width, 58, '#eef2e5a8');
            const left = Math.max(22, width * .12), right = width - 94;
            if ([1, 8].includes(stage)) {
                board(left, 113, Math.min(145, width * .43)); windowPane(right, 113);
                desk(width * .5 - 38, 226);
                if (stage === 8) {
                    rect(width * .5 - 25, 83, 50, 17, '#eaf0e5');
                    rect(width * .5 - 20, 95, 40, 2, '#b7cbc7');
                }
            } else if (stage === 2) {
                rect(left, 117, width - left * 2, 71, '#b0c3b3');
                rect(left + 5, 122, width - left * 2 - 10, 60, '#c4d1bc');
                rect(left - 5, 189, width - left * 2 + 10, 7, '#d9d9bd');
                rect(left, 196, width - left * 2, 42, '#c6cbb7');
                for (let i = 0; i < 3; i++) rect(width / 2 - 35 + i * 25, 165, 14, 19, '#dad9b7');
            } else if (stage === 4) {
                windowPane(left, 103);
                rect(right - 13, 116, 63, 41, '#edf0df');
                line([[right + 2, 149], [right + 2, 135], [right + 24, 135], [right + 24, 149]], '#c3b7a2');
                line([[right - 2, 158], [right + 31, 158]], '#bea993', 3);
                line([[right + 1, 161], [right + 8, 178], [right + 22, 178], [right + 28, 161]], '#d9ddd0', 1);
            } else if (stage === 6) {
                board(left, 108, 100);
                rect(right - 20, 186, 91, 6, '#acc0b4');
                for (let i = 0; i < 3; i++) {
                    const x = right - 12 + i * 29;
                    rect(x + 5, 161, 6, 13, '#c5d8ce');
                    triangle(x, 169, 17, 16, ['#b7c9b1', '#c6baca', '#b9cdd1'][i]);
                }
            } else {
                windowPane(left, 112); doorway(right);
                if (stage === 3) {
                    rect(width / 2 - 16, 190, 33, 37, '#b5c9c4');
                    rect(width / 2 - 20, 187, 41, 5, '#a0b8b5');
                } else if (stage === 7) {
                    rect(width / 2 - 29, 220, 58, 16, '#c5bccc');
                    rect(width / 2 - 29, 204, 58, 18, '#d2c8d5');
                } else if (stage === 9) {
                    rect(right + 7, 85, 41, 7, '#bac8bd');
                }
            }
            // Reduce scenery contrast uniformly; gameplay entities remain untouched above it.
            rect(0, 78, width, 192, stage === 10 ? '#4a60684a' : '#eef1e536');
        }
        function outside() {
            rect(0, 0, width, 270, '#dfeae6');
            if (stage === 5) {
                triangle(-40, 137, width * .8, 120, '#d5d0bd');
                triangle(width * .4, 155, width * .7, 102, '#dcd5c1');
                rect(0, 254, width, 16, '#d7d2bd');
            } else {
                const x = width / 2 - 95;
                rect(x, 112, 190, 143, '#d4dccc'); rect(x - 4, 108, 198, 5, '#b1c6b6');
                for (let i = 0; i < 4; i++) windowPane(x + 13 + i * 44, 127, 30, 43);
                rect(x + 76, 198, 38, 57, '#aec5be');
                rect(0, 255, width, 15, '#ced9c8');
            }
        }
        function draw() {
            if (!ctx || !width || !height) return;
            const dpr = Math.min(devicePixelRatio || 1, 2);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
            ctx.save(); ctx.scale(1, (height - 30) / 270);
            if (stage === 0) street(); else if (stage === 5 || stage === 11) outside(); else interior();
            ctx.restore();
            const floor = stage === 3 ? '#cadfdb' : stage === 10 ? '#839a9c' : '#dce2d5';
            rect(0, height - 30, width, 30, floor);
            rect(0, height - 30, width, 1, '#91a69d');
            // Only sparse ground marks move, preserving a running cue without parallax clutter.
            for (let x = distance % 175 - 175; x < width; x += 175)
                line([[x, height - 16], [x + 18, height - 16]], '#9bafa34d', 1);
            rect(0, 0, width, 78, '#f3f6ed'); rect(0, 77, width, 1, '#d0d9ce');
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
