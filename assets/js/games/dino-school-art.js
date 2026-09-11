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
        .dino-art-active .dino-art-announcement { top:122px !important; width:calc(100% - 32px); max-width:400px; font-size:17px !important; line-height:1.4; padding:10px 14px; box-sizing:border-box; background:rgba(255,255,255,.96); color:#233d3e !important; text-shadow:none !important; border:1px solid #b4cbc5; border-bottom:3px solid #54877b; border-radius:6px; pointer-events:none; }
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
        let stage = 0, distance = 0, clock = 0, width = 0, height = 0;
        const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
        function line(points, color, thickness = 2) {
            ctx.strokeStyle = color; ctx.lineWidth = thickness; ctx.beginPath();
            points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
        }
        function poly(points, color) {
            ctx.fillStyle = color; ctx.beginPath();
            points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill();
        }
        function circle(x, y, radius, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); }
        function label(text, x, y, color = '#eef9f4', size = 11) {
            ctx.fillStyle = color; ctx.font = `700 ${size}px Arial`; ctx.textAlign = 'center';
            ctx.direction = /[\u0590-\u05ff]/.test(text) ? 'rtl' : 'ltr'; ctx.fillText(text, x, y);
        }
        function repeat(period, speed, paint) {
            const offset = distance * speed % period;
            for (let x = offset - period; x < width + period; x += period) paint(x);
        }
        function windowPane(x, y, w = 85, h = 96) {
            rect(x + 4, y + 5, w, h, '#294b5520');
            rect(x, y, w, h, '#f0f4ef'); rect(x + 5, y + 5, w - 10, h - 10, palettes[stage][3]);
            if (stage === 10) { circle(x + 60, y + 24, 10, '#ecedcb'); circle(x + 64, y + 20, 10, palettes[stage][3]); }
            else {
                poly([[x + 5, y + h - 13], [x + 29, y + 51], [x + 55, y + h - 13]], '#74a89a');
                poly([[x + 31, y + h - 7], [x + 60, y + 43], [x + w - 5, y + h - 7]], '#91baa7');
                poly([[x + 8, y + 6], [x + 25, y + 6], [x + w - 8, y + h - 8], [x + w - 28, y + h - 8]], '#ffffff30');
            }
            rect(x + w / 2 - 2, y, 4, h, '#f0f4ef'); rect(x, y + h * .52, w, 4, '#f0f4ef');
            rect(x - 5, y + h, w + 10, 5, '#fbfaf1');
        }
        function door(x, name, color = '#528b86') {
            rect(x, 87, 77, 170, '#365552'); rect(x + 5, 92, 67, 165, color);
            rect(x + 13, 103, 50, 54, palettes[stage][3]); rect(x + 16, 106, 44, 47, '#ffffff16');
            rect(x + 57, 183, 9, 4, '#eee6b9'); rect(x + 14, 170, 33, 34, '#ffffff18');
            rect(x + 7, 66, 63, 16, '#344f51'); label(name, x + 39, 78, '#f0eee0', 10);
        }
        function lockers(x) {
            for (let i = 0; i < 3; i++) {
                const a = x + i * 32;
                rect(a + 2, 118, 30, 135, '#315c60'); rect(a + 4, 120, 26, 130, i % 2 ? '#619a93' : '#77aaa1');
                for (let j = 0; j < 3; j++) rect(a + 9, 128 + j * 4, 15, 1, '#3d7270');
                rect(a + 23, 171, 3, 10, '#e2e3c2'); rect(a + 10, 150, 10, 7, '#e6e9d5');
            }
            rect(x, 252, 100, 5, '#365755');
        }
        function notice(x) {
            rect(x, 111, 83, 68, '#faf1d9'); rect(x + 4, 115, 75, 60, '#bba580');
            for (let i = 0; i < 4; i++) {
                const a = x + 10 + (i % 2) * 32, b = 121 + Math.floor(i / 2) * 25;
                rect(a, b, 24, 20, ['#eef3dc', '#e6aba0', '#acd4d1', '#ede9dd'][i]); circle(a + 12, b + 3, 1.5, '#7f5651');
                rect(a + 4, b + 8, 15, 1, '#627a7355'); rect(a + 4, b + 12, 10, 1, '#627a7355');
            }
        }
        function bench(x, y, color = '#bb8b6d') {
            rect(x + 7, y + 8, 5, 25, '#44635f'); rect(x + 80, y + 8, 5, 25, '#44635f');
            rect(x, y, 96, 8, color); rect(x + 3, y + 8, 90, 3, '#3d5c5c');
        }
        function board(x, text) {
            rect(x, 96, 135, 87, '#e4c797'); rect(x + 5, 101, 125, 76, '#305c50');
            label(text, x + 68, 122, '#e8eee0', 13); line([[x + 17, 133], [x + 116, 133]], '#aac4b6', 1);
            label('x + 2 = 5', x + 49, 153, '#cfdfcb', 12);
            line([[x + 90, 165], [x + 99, 142], [x + 119, 165], [x + 90, 165]], '#e2d496', 1);
            rect(x - 3, 182, 140, 5, '#f0dcb5'); rect(x + 18, 179, 14, 3, '#f2f5e9');
        }
        function flask(x, y, color) {
            rect(x + 7, y, 8, 13, '#d4ece8'); poly([[x + 7, y + 10], [x - 1, y + 28], [x + 23, y + 28], [x + 15, y + 10]], '#e0f2ee');
            poly([[x + 5, y + 17], [x + 1, y + 25], [x + 21, y + 25], [x + 17, y + 17]], color);
            rect(x + 6, y - 1, 10, 3, '#6d9e98');
        }
        function interior() {
            const p = palettes[stage];
            rect(0, 0, width, 300, p[0]); rect(0, 0, width, 37, stage === 10 ? '#20343d' : '#f5f3e8');
            rect(0, 37, width, 5, '#7f96954d'); rect(0, 194, width, 67, p[1]);
            rect(0, 192, width, 4, '#ffffff70'); rect(0, 256, width, 8, '#345a5955');
            repeat(240, .18, x => {
                rect(x + 38, 20, 100, 5, stage === 10 ? '#8caca4' : '#b7c4bb');
                rect(x + 42, 25, 92, 3, stage === 10 ? '#d6e5b6' : '#fffef0');
                poly([[x + 42, 28], [x + 134, 28], [x + 183, 191], [x - 6, 191]], '#fffbe811');
            });
            repeat(590, .38, x => {
                if ([0, 3, 7, 9, 10].includes(stage)) {
                    windowPane(x + 18, 83); lockers(x + 133); notice(x + 260);
                    door(x + 393, stage === 9 ? 'מנהל' : stage === 10 ? 'יציאה' : 'כיתה ג׳2', stage === 9 ? '#996f67' : '#538d86');
                    if (stage === 3) {
                        rect(x + 493, 147, 10, 94, '#9ebdbd'); rect(x + 488, 158, 56, 9, '#b9ccca'); rect(x + 531, 145, 6, 16, '#567e84');
                        line([[x + 534, 144], [x + 537, 132], [x + 552, 145], [x + 560, 198]], '#dbfbff', 3);
                    } else if (stage === 7) {
                        rect(x + 473, 211, 98, 30, '#aa839b'); rect(x + 479, 196, 86, 27, '#bc9ab2');
                        rect(x + 472, 210, 10, 32, '#92728c'); rect(x + 561, 210, 10, 32, '#92728c');
                        rect(x + 481, 242, 5, 12, '#53665f'); rect(x + 556, 242, 5, 12, '#53665f');
                        rect(x + 496, 215, 16, 6, '#365c65');
                    } else bench(x + 477, 221);
                    if (stage === 10) {
                        line([[x + 391, 87], [x + 372, 108], [x + 371, 87]], '#bfd3cc66', 1);
                        line([[x + 380, 87], [x + 380, 128]], '#bfd3cc66', 1); circle(x + 380, 130, 2, '#a8bbb3');
                    }
                } else if ([1, 8].includes(stage)) {
                    board(x + 15, stage === 1 ? 'בוחן פתע' : 'שקט, לומדים'); windowPane(x + 199, 89, 90, 99);
                    rect(x + 329, 78, 84, 26, '#f0f5ef'); rect(x + 335, 95, 72, 4, '#7f9a9f');
                    label(stage === 8 ? '16°' : '24°', x + 393, 91, '#4d8d93', 9);
                    bench(x + 25, 223, '#bca781'); bench(x + 204, 223, '#bca781'); bench(x + 386, 223, '#bca781');
                    notice(x + 452);
                } else if (stage === 2) {
                    rect(x + 18, 96, 211, 111, '#658e87'); rect(x + 24, 102, 199, 99, '#466e68');
                    label('קפיטריה', x + 122, 125, '#f7e6bd', 18);
                    for (let i = 0; i < 6; i++) { rect(x + 37 + i * 29, 165, 18, 21, i % 2 ? '#dea78b' : '#eed496'); rect(x + 39 + i * 29, 160, 14, 5, '#e9ece1'); }
                    rect(x + 7, 200, 235, 9, '#f4e4bf'); rect(x + 13, 209, 223, 43, '#c69781');
                    for (let i = 0; i < 9; i++) rect(x + 21 + i * 24, 212, 1, 37, '#977367');
                    windowPane(x + 286, 87, 112, 90); bench(x + 278, 217, '#d58e7d'); bench(x + 442, 217, '#d58e7d');
                    circle(x + 310, 213, 9, '#f8f1d8'); circle(x + 310, 213, 5, '#c49c66'); notice(x + 464);
                } else if (stage === 4) {
                    windowPane(x + 20, 69, 90, 75); rect(x + 168, 92, 86, 55, '#f4f0de');
                    line([[x + 196, 134], [x + 196, 113], [x + 227, 113], [x + 227, 134]], '#bc7259', 2);
                    line([[x + 186, 141], [x + 233, 141]], '#d18455', 4);
                    for (let i = 0; i < 6; i++) line([[x + 187 + i * 9, 143], [x + 195 + i * 5, 167]], '#f9f6e8', 1);
                    rect(x + 297, 94, 7, 158, '#ba956c'); rect(x + 382, 94, 7, 158, '#ba956c');
                    for (let i = 0; i < 10; i++) rect(x + 298, 103 + i * 14, 86, 4, '#e1c59b');
                    rect(x + 443, 82, 101, 46, '#344e4a'); label('08 : 00', x + 493, 112, '#e6ce87', 22); bench(x + 444, 223);
                } else if (stage === 6) {
                    board(x + 18, 'H₂O + ?'); windowPane(x + 217, 79, 103, 93);
                    rect(x + 368, 100, 160, 9, '#71948d'); rect(x + 368, 166, 160, 9, '#71948d');
                    for (let i = 0; i < 5; i++) { flask(x + 380 + i * 28, 71, i % 2 ? '#d582a6' : '#84c688'); flask(x + 380 + i * 28, 137, i % 2 ? '#e3c374' : '#7cbed0'); }
                    bench(x + 28, 221, '#4d7470'); bench(x + 229, 221, '#4d7470'); bench(x + 435, 221, '#4d7470');
                    flask(x + 63, 191, '#77bf85'); flask(x + 271, 191, '#c980b0');
                    for (let i = 0; i < 5; i++) circle(x + 76 + Math.sin(clock * .002 + i) * 12, 184 - ((clock * .018 + i * 13) % 61), 2 + i % 3, '#80b99388');
                }
            });
        }
        function outdoors() {
            const trip = stage === 5;
            rect(0, 0, width, 300, palettes[stage][3]); circle(width * .72, 70, 25, '#fff0ba');
            repeat(510, .10, x => {
                if (trip) {
                    poly([[x - 30, 236], [x + 40, 117], [x + 95, 117], [x + 196, 236]], '#c7ada0');
                    poly([[x + 40, 117], [x + 95, 117], [x + 151, 187], [x + 71, 164]], '#e9c7aa');
                    poly([[x + 180, 236], [x + 285, 153], [x + 362, 137], [x + 498, 236]], '#dbb79b');
                } else {
                    rect(x + 50, 98, 260, 149, '#ece6cb'); rect(x + 43, 94, 274, 9, '#629385');
                    for (let j = 0; j < 2; j++) for (let i = 0; i < 6; i++) { rect(x + 66 + i * 40, 116 + j * 48, 23, 33, '#78abb0'); rect(x + 76 + i * 40, 116 + j * 48, 3, 33, '#e6e8d8'); }
                    rect(x + 149, 197, 59, 50, '#4c7f7c'); label('בית ספר', x + 180, 89, '#315f57', 14);
                }
            });
            repeat(430, .38, x => {
                if (trip) {
                    rect(x + 48, 186, 5, 74, '#837358'); rect(x + 26, 187, 80, 20, '#f1e2bd'); label('השביל', x + 66, 201, '#6c735d', 11);
                    poly([[x + 190, 254], [x + 232, 186], [x + 279, 254]], '#82a291'); poly([[x + 232, 186], [x + 242, 254], [x + 279, 254]], '#426f6a');
                    poly([[x + 212, 254], [x + 232, 216], [x + 244, 254]], '#384e4b');
                    rect(x + 350, 213, 10, 44, '#6b967a'); rect(x + 336, 226, 20, 8, '#6b967a'); rect(x + 336, 213, 7, 17, '#6b967a');
                } else {
                    rect(x + 27, 164, 12, 95, '#659186'); rect(x + 269, 164, 12, 95, '#659186');
                    line([[x + 35, 183], [x + 272, 183]], '#5c8680', 3);
                    for (let i = 0; i < 12; i++) rect(x + 42 + i * 20, 183, 3, 74, '#6d9890');
                    for (let i = 0; i < 7; i++) poly([[x + 39 + i * 31, 152], [x + 66 + i * 31, 152], [x + 52 + i * 31, 177]], ['#e9b66e', '#c97f85', '#65a69d'][i % 3]);
                    line([[x + 35, 152], [x + 268, 152]], '#648a7d', 1);
                    rect(x + 335, 207, 8, 48, '#8f8d67'); circle(x + 339, 181, 36, '#77a886'); circle(x + 318, 195, 23, '#6c9b7a');
                }
            });
        }
        function draw() {
            if (!ctx || !width || !height) return;
            const dpr = Math.min(devicePixelRatio || 1, 2);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
            // Keep the floor at the game's original 30px collision baseline.
            ctx.save(); ctx.scale(1, (height - 30) / 270);
            if (stage === 5 || stage === 11) outdoors(); else interior();
            rect(0, 260, width, 10, palettes[stage][2]);
            if (stage === 10) { rect(0, 42, width, 218, '#14263855'); }
            if (stage === 9) { rect(0, 42, width, 218, `rgba(199,65,64,${.035 + (Math.sin(clock * .002) + 1) * .025})`); }
            if (stage === 8) {
                repeat(160, .6, x => { for (let i = 0; i < 4; i++) { const y = 121 + i * 28 + Math.sin(clock * .001 + i) * 8; line([[x + 20, y], [x + 43, y - 2], [x + 55, y]], '#ffffff80', 1); } });
                repeat(110, .38, x => poly([[x, 42], [x + 7, 59], [x + 12, 42]], '#e7f6ff'));
            }
            ctx.restore();
            rect(0, height - 30, width, 30, palettes[stage][2]); rect(0, height - 30, width, 3, '#355b5960');
            repeat(stage === 4 ? 70 : 95, 1, x => { line([[x, height - 27], [x + 20, height]], '#45696725', 1); });
            line([[0, height - 12], [width, height - 12]], '#ffffff50', 1);
            if (stage === 4) line([[0, height - 18], [width, height - 18]], '#faf7e4', 2);
            if (stage === 3) {
                rect(0, height - 27, width, 27, '#58b5caa0');
                repeat(75, .7, x => line([[x, height - 23], [x + 12, height - 25 + Math.sin(clock * .003)], [x + 34, height - 23]], '#d6f8f5', 2));
            }
            // Stable header band separates score and controls from moving scenery.
            rect(0, 0, width, 78, '#f7faf2ed'); rect(0, 77, width, 1, '#496d6150');
        }
        const observer = new ResizeObserver(() => {
            width = container.clientWidth; height = container.clientHeight;
            const dpr = Math.min(devicePixelRatio || 1, 2);
            canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); draw();
        });
        observer.observe(container);
        return {
            setStage(index) { stage = Math.max(0, Math.min(11, index)); canvas.dataset.stage = String(stage + 1); draw(); },
            update(speed, timeScale) { distance += speed * timeScale; clock += timeScale * 1000 / 60; draw(); },
            destroy() { observer.disconnect(); canvas.remove(); container.classList.remove('dino-art-active'); }
        };
    }
    window.DinoSchoolArt = { create };
})();
