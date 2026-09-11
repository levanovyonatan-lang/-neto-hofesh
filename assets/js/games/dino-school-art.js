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
            // Give wall text time to be read while keeping the pavement at running speed.
            const readingPace = speed < 1 ? 0.22 : 1;
            const offset = distance * speed * readingPace % period;
            for (let x = offset - period; x < width + period; x += period) paint(x);
        }
        function windowPane(x, y, w = 85, h = 96) {
            rect(x + 4, y + 5, w, h, '#294b5520');
            rect(x, y, w, h, '#f0f4ef'); rect(x + 5, y + 5, w - 10, h - 10, palettes[stage][3]);
            if (stage === 10) { circle(x + 60, y + 24, 10, '#ecedcb'); circle(x + 64, y + 20, 10, palettes[stage][3]); }
            else {
                rect(x + 6, y + h - 39, w - 12, 32, '#d4ccba');
                for (let i = 0; i < 3; i++) rect(x + 12 + i * 21, y + h - 32, 12, 14, '#849ea0');
                rect(x + 12, y + h - 46, 15, 7, '#e9e6db');
                circle(x + w - 20, y + h - 22, 15, '#83a38b');
                poly([[x + 8, y + 6], [x + 25, y + 6], [x + w - 8, y + h - 8], [x + w - 28, y + h - 8]], '#ffffff30');
            }
            rect(x + w / 2 - 2, y, 4, h, '#b6c1c0');
            rect(x + 2, y + 2, w - 4, 19, '#d9ded7');
            for (let i = 0; i < 4; i++) rect(x + 3, y + 3 + i * 5, w - 6, 1, '#9eaeaa');
            for (let i = 1; i < 4; i++) rect(x + w * i / 4, y + 23, 1, h - 24, '#6a85856b');
            rect(x + w / 2 - 6, y + h / 2, 2, 10, '#6a8585');
            rect(x - 5, y + h, w + 10, 5, '#d0d3ca');
        }
        function door(x, name, color = '#528b86') {
            rect(x, 87, 77, 170, '#365552'); rect(x + 5, 92, 67, 165, color);
            rect(x + 14, 105, 23, 59, '#b6c9c4'); rect(x + 17, 108, 17, 53, '#dce6df');
            rect(x + 57, 183, 9, 4, '#eee6b9'); rect(x + 14, 170, 33, 34, '#ffffff18');
            rect(x + 3, 67, 71, 17, '#f0efe7'); label(name, x + 39, 80, '#354e53', 11);
            rect(x + 50, 149, 15, 5, '#eeece1');
        }
        function schoolStorage(x) {
            rect(x, 177, 101, 76, '#b6ab95'); rect(x + 4, 181, 93, 67, '#ddd4bb');
            for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
                const a = x + 8 + i * 30, y = 185 + j * 30;
                rect(a, y, 25, 24, '#827f70'); rect(a + 2, y + 2, 21, 20, '#acb4a3');
                rect(a + 5, y + 8, 16, 14, ['#668f9e','#c18b81','#9c9b74'][i]);
                line([[a + 10, y + 8], [a + 10, y + 5], [a + 16, y + 5], [a + 16, y + 8]], '#536665', 1);
            }
            rect(x + 7, 153, 88, 5, '#b5ab93');
            for (let i = 0; i < 4; i++) line([[x + 17 + i * 21, 156], [x + 17 + i * 21, 165], [x + 21 + i * 21, 165]], '#6e7c7b', 2);
            label('אבידות ומציאות', x + 51, 142, '#496562', 12);
        }
        function notice(x) {
            const notices = [
                ['תורני השבוע', 'גם השבוע: אנחנו'], ['להביא אישור הורים', '״אמא אמרה״ לא נחשב'],
                ['נא לפנות מגשים', 'גם אם לא אתם לכלכתם'], ['זהירות, רטוב', 'לא, זו לא בריכה'],
                ['חובה נעלי ספורט', 'קרוקס לא נחשב'], ['אישור הורים לטיול', 'להביא עד אתמול'],
                ['לא לשתות מהניסוי', 'גם אם זה נראה כמו פטל'], ['שיעור חופשי', 'המורה השאירה עבודה'],
                ['לא לגעת בשלט', 'כן, גם לך קר'], ['נא להמתין בסבלנות', 'המנהל ״רק בשיחה״'],
                ['האחרון מכבה אור', 'רגע, מי עוד פה?'], ['חופשה נעימה', 'חוברת קיץ במזכירות']
            ];
            rect(x, 103, 124, 92, '#9d927b'); rect(x + 4, 107, 116, 84, '#c5b99e');
            rect(x + 10, 113, 104, 63, '#faf8ee'); circle(x + 63, 117, 2, '#a56056');
            label(notices[stage][0], x + 62, 136, '#364e56', 11);
            label(notices[stage][1], x + 62, 157, '#727565', 9);
            rect(x + 15, 181, 25, 7, '#8faab6'); rect(x + 85, 181, 26, 7, '#d39789');
        }
        function bench(x, y, color = '#bb8b6d') {
            rect(x + 7, y + 8, 5, 25, '#44635f'); rect(x + 80, y + 8, 5, 25, '#44635f');
            rect(x, y, 96, 8, color); rect(x + 3, y + 8, 90, 3, '#3d5c5c');
        }
        function studentDesk(x, y) {
            // Laminate double desk, steel frame and molded classroom chairs.
            for (const a of [x + 4, x + 65]) {
                rect(a, y - 22, 24, 17, '#3978a0'); rect(a + 2, y - 20, 20, 2, '#6fa1b7');
                rect(a + 3, y - 5, 3, 31, '#737e7f'); rect(a + 19, y - 5, 3, 31, '#737e7f');
                rect(a - 1, y + 10, 27, 5, '#3978a0');
            }
            rect(x + 3, y + 4, 4, 28, '#707e7c'); rect(x + 86, y + 4, 4, 28, '#707e7c');
            poly([[x - 4, y + 1], [x + 88, y + 1], [x + 99, y + 7], [x + 3, y + 7]], '#e1d9b7');
            rect(x + 3, y + 7, 96, 4, '#a9a893');
            rect(x + 17, y + 2, 20, 3, '#eef0e2'); rect(x + 43, y + 3, 12, 1, '#567b99');
            line([[x + 73, y + 7], [x + 80, y + 8]], '#8d8f7955', 1);
        }
        function board(x, text, joke) {
            rect(x + 3, 98, 167, 96, '#304b4920'); rect(x, 95, 167, 96, '#aebbb9');
            rect(x + 4, 99, 159, 87, '#f6f7ed');
            label(text, x + 83, 120, '#2a5975', 14); line([[x + 15, 129], [x + 151, 129]], '#7d9ba3', 1);
            label(joke[0], x + 83, 150, '#414f4c', 12);
            label(joke[1], x + 83, 172, '#835b64', 11);
            rect(x - 3, 190, 173, 5, '#879b9d'); rect(x + 18, 186, 19, 4, '#435d6a');
            rect(x + 111, 187, 16, 3, '#467bac'); rect(x + 133, 187, 12, 3, '#b16f67');
        }
        function wallClock(x) {
            circle(x, 87, 12, '#6c7d7f'); circle(x, 87, 10, '#f7f7ed');
            for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; circle(x + Math.sin(a) * 8, 87 - Math.cos(a) * 8, .65, '#657574'); }
            line([[x - 5, 90], [x, 87], [x, 80]], '#526365', 1.3);
        }
        function flag(x, y) {
            rect(x, y, 2, 66, '#a4b2b3'); rect(x + 2, y + 2, 36, 25, '#f5f6ef');
            rect(x + 2, y + 5, 36, 3, '#4579a5'); rect(x + 2, y + 21, 36, 3, '#4579a5');
            line([[x + 20, y + 10], [x + 15, y + 18], [x + 25, y + 18], [x + 20, y + 10]], '#4579a5', 1);
            line([[x + 20, y + 20], [x + 15, y + 12], [x + 25, y + 12], [x + 20, y + 20]], '#4579a5', 1);
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
            repeat(193, .38, x => {
                rect(x + 16, 177, 8, 12, '#f0eee3'); rect(x + 19, 180, 2, 3, '#8b9e97');
                line([[x + 52, 234], [x + 61, 233]], '#60777128', 1);
                line([[x + 153, 242], [x + 169, 242]], '#60777120', 1);
            });
            repeat(240, .18, x => {
                rect(x + 38, 20, 100, 5, stage === 10 ? '#8caca4' : '#b7c4bb');
                rect(x + 42, 25, 92, 3, stage === 10 ? '#d6e5b6' : '#fffef0');
                poly([[x + 42, 28], [x + 134, 28], [x + 183, 191], [x - 6, 191]], '#fffbe811');
            });
            repeat(590, .38, x => {
                if ([0, 3, 7, 9, 10].includes(stage)) {
                    windowPane(x + 18, 97); schoolStorage(x + 133); notice(x + 252);
                    door(x + 393, stage === 9 ? 'מזכירות' : stage === 10 ? 'יציאה' : 'כיתה ג׳2', stage === 9 ? '#996f67' : '#9cae9d');
                    wallClock(x + 183);
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
                    board(x + 15, stage === 1 ? 'בוחן פתע' : 'המזגן על 16', stage === 1 ? ['״אבל לא למדנו את זה״', 'למדנו. ביום שלא באת.'] : ['מי לקח את השלט?', 'נא להגיע עם מעיל.']); windowPane(x + 208, 99, 90, 99);
                    rect(x + 329, 78, 84, 26, '#f0f5ef'); rect(x + 335, 95, 72, 4, '#7f9a9f');
                    label(stage === 8 ? '16°' : '24°', x + 393, 91, '#4d8d93', 9);
                    studentDesk(x + 25, 223); studentDesk(x + 204, 223); studentDesk(x + 386, 223);
                    notice(x + 452);
                } else if (stage === 2) {
                    rect(x + 18, 96, 211, 111, '#658e87'); rect(x + 24, 102, 199, 99, '#466e68');
                    label('המזנון של בית הספר', x + 122, 122, '#f7e6bd', 16);
                    label('טוסט • טרופית • בורקס', x + 122, 140, '#eef0db', 12);
                    label('״תרשום לי״ זה לא אמצעי תשלום', x + 122, 154, '#e6ccac', 10);
                    for (let i = 0; i < 6; i++) { rect(x + 37 + i * 29, 165, 18, 21, i % 2 ? '#dea78b' : '#eed496'); rect(x + 39 + i * 29, 160, 14, 5, '#e9ece1'); }
                    rect(x + 7, 200, 235, 9, '#f4e4bf'); rect(x + 13, 209, 223, 43, '#c69781');
                    for (let i = 0; i < 9; i++) rect(x + 21 + i * 24, 212, 1, 37, '#977367');
                    windowPane(x + 286, 87, 112, 90); bench(x + 278, 217, '#d58e7d'); bench(x + 442, 217, '#d58e7d');
                    circle(x + 310, 213, 9, '#f8f1d8'); circle(x + 310, 213, 5, '#c49c66'); notice(x + 444);
                } else if (stage === 4) {
                    windowPane(x + 20, 69, 90, 75); rect(x + 168, 92, 86, 55, '#f4f0de');
                    line([[x + 196, 134], [x + 196, 113], [x + 227, 113], [x + 227, 134]], '#bc7259', 2);
                    line([[x + 186, 141], [x + 233, 141]], '#d18455', 4);
                    for (let i = 0; i < 6; i++) line([[x + 187 + i * 9, 143], [x + 195 + i * 5, 167]], '#f9f6e8', 1);
                    rect(x + 297, 94, 7, 158, '#ba956c'); rect(x + 382, 94, 7, 158, '#ba956c');
                    for (let i = 0; i < 10; i++) rect(x + 298, 103 + i * 14, 86, 4, '#e1c59b');
                    rect(x + 443, 82, 101, 46, '#344e4a'); label('08 : 00', x + 493, 112, '#e6ce87', 22); bench(x + 444, 223);
                    rect(x + 421, 154, 147, 38, '#f5f2df'); label('״המורה, שכחתי נעלי ספורט״', x + 494, 169, '#4f665b', 10); label('אז הולכים. לא יושבים.', x + 494, 183, '#7d6e59', 10);
                } else if (stage === 6) {
                    board(x + 18, 'ניסוי בכימיה', ['לא לטעום. לא להריח.', 'לא, גם לא בקטנה.']); windowPane(x + 223, 95, 103, 93);
                    rect(x + 368, 100, 160, 9, '#71948d'); rect(x + 368, 166, 160, 9, '#71948d');
                    for (let i = 0; i < 5; i++) { flask(x + 380 + i * 28, 71, i % 2 ? '#d582a6' : '#84c688'); flask(x + 380 + i * 28, 137, i % 2 ? '#e3c374' : '#7cbed0'); }
                    bench(x + 28, 221, '#4d7470'); bench(x + 229, 221, '#4d7470'); bench(x + 435, 221, '#4d7470');
                    flask(x + 63, 191, '#77bf85'); flask(x + 271, 191, '#c980b0');
                    for (let i = 0; i < 5; i++) circle(x + 76 + Math.sin(clock * .002 + i) * 12, 184 - ((clock * .018 + i * 13) % 61), 2 + i % 3, '#80b99388');
                }
            });
        }
        function morningStreet() {
            rect(0, 0, width, 300, '#cce5ed'); circle(width * .78, 92, 23, '#fff0bf');
            // Distant apartments, street furniture, and pavement scroll at different speeds.
            repeat(620, .14, x => {
                for (let b = 0; b < 3; b++) {
                    const a = x + b * 195, top = 94 + b % 2 * 23;
                    rect(a + 6, top, 167, 140, ['#ddd8c8', '#d4dcda', '#e4d5c4'][b]);
                    rect(a, top - 4, 179, 5, '#aeb7b1');
                    rect(a + 13, top - 14, 19, 10, '#efeee3');
                    poly([[a + 44, top - 4], [a + 62, top - 18], [a + 79, top - 18], [a + 61, top - 4]], '#738e97');
                    for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) {
                        const wx = a + 16 + col * 38, wy = top + 13 + row * 34;
                        rect(wx, wy, 24, 25, '#f1f0e5'); rect(wx + 3, wy + 3, 18, 19, '#86a9b1');
                        rect(wx + 2, wy + 2, 20, row % 2 ? 9 : 4, '#bbc5c0');
                        rect(wx + 27, wy + 12, 8, 8, '#f0eee2');
                    }
                    rect(a + 67, 204, 38, 30, '#739493');
                }
            });
            rect(0, 227, width, 35, '#a4adae');
            repeat(125, .25, x => rect(x + 12, 242, 49, 3, '#eeeee0'));
            repeat(740, .38, x => {
                // Neighborhood bus shelter with a timetable and a familiar morning complaint.
                rect(x + 15, 153, 136, 7, '#687f80');
                rect(x + 22, 160, 4, 97, '#6c8585'); rect(x + 140, 160, 4, 97, '#6c8585');
                rect(x + 27, 164, 111, 65, '#e5f0e04d');
                rect(x + 30, 169, 70, 40, '#f7f5e5');
                label('האוטובוס מגיע', x + 65, 185, '#4b6265', 10);
                label('כשמפסיקים לחכות', x + 65, 200, '#7e7363', 9);
                bench(x + 35, 229, '#9baba3');
                rect(x + 160, 138, 3, 119, '#6c8585'); rect(x + 148, 125, 27, 31, '#dfbb54');
                rect(x + 153, 131, 17, 13, '#486d86'); rect(x + 155, 133, 13, 5, '#e8f1e9');
                circle(x + 156, 145, 2, '#3f5762'); circle(x + 167, 145, 2, '#3f5762');
                rect(x + 148, 161, 27, 21, '#f6f3e5'); label('18', x + 161, 176, '#3f6478', 13);
                // A small corner shop under a striped awning.
                rect(x + 273, 162, 127, 96, '#d9ceba'); rect(x + 281, 184, 49, 74, '#6f9698');
                rect(x + 337, 184, 55, 50, '#8bacac'); rect(x + 340, 187, 49, 44, '#bed6ce');
                rect(x + 267, 150, 139, 24, '#f3ead3'); label('המכולת של אבי', x + 337, 166, '#4e7467', 14);
                for (let i = 0; i < 10; i++) rect(x + 267 + i * 14, 175, 14, 10, i % 2 ? '#e4ead5' : '#729689');
                rect(x + 343, 196, 42, 26, '#f4eedc'); label('שוקו ולחמנייה', x + 364, 207, '#7b7160', 7); label('לפני הצלצול', x + 364, 218, '#7b7160', 7);
                // Crosswalk is behind the running sidewalk, not an extra collision surface.
                for (let i = 0; i < 5; i++) poly([[x + 465 + i * 16, 228], [x + 474 + i * 16, 228], [x + 464 + i * 16, 257], [x + 452 + i * 16, 257]], '#edf0e4');
                rect(x + 560, 164, 3, 93, '#708786'); rect(x + 548, 140, 29, 27, '#487f9d');
                poly([[x + 562, 144], [x + 552, 161], [x + 572, 161]], '#edf2e8');
                circle(x + 562, 150, 2, '#52676c'); line([[x + 562, 153], [x + 559, 157], [x + 556, 160]], '#52676c', 1.5);
                line([[x + 562, 153], [x + 565, 159]], '#52676c', 1.5);
                rect(x + 665, 192, 7, 64, '#918e71'); circle(x + 668, 163, 32, '#83aa88'); circle(x + 647, 178, 23, '#739c7d');
                rect(x + 616, 229, 23, 26, '#6a9586'); rect(x + 613, 226, 29, 5, '#527c70');
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
                    rect(x + 149, 197, 59, 50, '#4c7f7c'); label('בית הספר ״ניצנים״', x + 180, 89, '#315f57', 14);
                    flag(x + 320, 105);
                    rect(x + 59, 200, 74, 30, '#f4f1e2'); label('יציאה לחופש', x + 96, 212, '#4b777b', 10); label('לא לשכוח חוברת!', x + 96, 224, '#7c6d67', 9);
                }
            });
            repeat(430, .38, x => {
                if (trip) {
                    rect(x + 48, 173, 5, 87, '#837358'); rect(x + 8, 174, 124, 38, '#f1e2bd'); label('״עוד חמש דקות מגיעים״', x + 70, 189, '#6c735d', 11); label('המורה, לפני שעה', x + 70, 204, '#866d59', 10);
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
            if (stage === 0) morningStreet();
            else if (stage === 5 || stage === 11) outdoors(); else interior();
            rect(0, 260, width, 10, palettes[stage][2]);
            if (stage === 10) { rect(0, 42, width, 218, '#14263855'); }
            if (stage === 9) { rect(0, 42, width, 218, `rgba(199,65,64,${.035 + (Math.sin(clock * .002) + 1) * .025})`); }
            if (stage === 8) {
                repeat(160, .6, x => { for (let i = 0; i < 4; i++) { const y = 121 + i * 28 + Math.sin(clock * .001 + i) * 8; line([[x + 20, y], [x + 43, y - 2], [x + 55, y]], '#ffffff80', 1); } });
                repeat(110, .38, x => poly([[x, 42], [x + 7, 59], [x + 12, 42]], '#e7f6ff'));
            }
            ctx.restore();
            rect(0, height - 30, width, 30, palettes[stage][2]); rect(0, height - 30, width, 3, '#355b5960');
            if (stage === 0) {
                rect(0, height - 30, width, 30, '#d0cec2');
                repeat(48, 1, x => rect(x, height - 30, 24, 4, '#b76460'));
            }
            repeat(stage === 4 ? 70 : 95, 1, x => { line([[x, height - 27], [x + 20, height]], '#45696725', 1); });
            line([[0, height - 12], [width, height - 12]], '#ffffff50', 1);
            if (![3, 4, 5, 11].includes(stage)) {
                repeat(95, 1, x => { for (let i = 0; i < 9; i++) { const a = x + (i * 29 % 91); const y = height - 24 + (i * 7 % 22); rect(a, y, i % 2 + 1, 1, '#4b696329'); } });
            }
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
