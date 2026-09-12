(function () {
    'use strict';
    if (new URLSearchParams(location.search).get('demo_premium') !== '1') return;
    const modal = document.getElementById('custom-countdown-modal');
    const grid = modal?.querySelector('.theme-selector-grid');
    if (!grid) return;
    document.body.classList.add('premium-design-demo');
    const designs = [
        ['default', 'רגיל', '#f6f8f7'], ['vacation', 'חופשה או טיסה', '#eff8fa'],
        ['celebration', 'חגיגה', '#fcf3f5'], ['exam', 'מבחן', '#f5f8f6'],
        ['military', 'צבא', '#f0f4ed'], ['license', 'רישיון', '#f0f5f6']
    ];
    function artwork(theme, base) {
        const c = document.createElement('canvas'); c.width = 900; c.height = 540;
        const x = c.getContext('2d'); x.fillStyle = base; x.fillRect(0, 0, 900, 540);
        const path = (points, color, weight = 2, dash = []) => {
            x.beginPath(); x.moveTo(...points[0]);
            points.slice(1).forEach(p => p.length === 6 ? x.bezierCurveTo(...p) : x.lineTo(...p));
            x.strokeStyle = color; x.lineWidth = weight; x.setLineDash(dash); x.stroke(); x.setLineDash([]);
        };
        const rect = (a, b, w, h, color) => {x.fillStyle = color; x.fillRect(a, b, w, h);};
        if (theme === 'exam') {
            for (let n = 0; n < 900; n += 28) path([[n, 0], [n, 540]], '#dde8e4', 1);
            for (let n = 0; n < 540; n += 28) path([[0, n], [900, n]], '#dde8e4', 1);
            path([[816, 0], [816, 540]], '#d6b9bb', 2);
            x.save(); x.translate(112, 450); x.rotate(-.48);
            rect(-70, -6, 140, 12, '#bbc5a3'); rect(-70, -6, 17, 12, '#d8b7b8');
            x.fillStyle = '#d5cbb4'; x.beginPath(); x.moveTo(70, -6); x.lineTo(86, 0); x.lineTo(70, 6); x.fill();
            x.restore();
        } else if (theme === 'license') {
            x.save(); x.globalAlpha = .55;
            const road = [[850, 600], [960, 415, 760, 443, 835, 304], [870, 226, 920, 185, 958, 157]];
            path(road, '#d9e4da', 110); path(road, '#b4c2c4', 76);
            path(road, '#f7faf7', 64); path(road, '#8d9eA3', 59);
            path(road, '#f5f3da', 3, [15, 15]);
            path([[0, 461], [110, 434, 130, 503, 271, 475]], '#d6e2db', 2);
            rect(812, 364, 3, 37, '#a9b9b4'); rect(803, 353, 22, 22, '#f7faf4');
            path([[808, 360], [820, 360], [814, 366]], '#96aaa0', 2);
            x.restore();
        } else if (theme === 'vacation') {
            for (let n = 0; n < 5; n++) path([[0, 423 + n * 22], [110, 375 + n * 22, 175, 500 + n * 22, 320, 450 + n * 22]], n % 2 ? '#cee5e7' : '#d9ecec', 12);
            path([[740, 73], [823, 130, 857, 45, 900, 100]], '#b7cfd5', 2, [6, 8]);
            x.save(); x.translate(730, 68); x.rotate(-.35);
            x.fillStyle = '#a7c1ca'; x.beginPath();
            [[-20,0],[-4,-5],[3,-20],[8,-20],[7,-5],[23,0],[7,5],[8,13],[3,13],[-4,5]].forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p));
            x.closePath(); x.fill(); x.restore();
        } else if (theme === 'celebration') {
            path([[-10, 75], [74, 135, 111, 10, 188, 66]], '#dec0c8', 7);
            path([[751, 506], [774, 415, 918, 540, 876, 394]], '#c3cfda', 6);
            [[60,185],[126,98],[200,40],[786,458],[853,380],[718,513]].forEach(([a,b],i)=>{
                x.save();x.translate(a,b);x.rotate(i*.6);rect(-3,-8,6,16,i%2?'#c2cec5':'#d8c69d');x.restore();
            });
        } else if (theme === 'military') {
            for(let n=0;n<8;n++) {
                path([[-40, 300+n*22],[75,235+n*20,125,460+n*17,252,418+n*17]], '#d3ddcb', 1.5);
                path([[698+n*16,-30],[648+n*18,95,829+n*12,132,940,198+n*18]], '#d3ddcb', 1.5);
            }
            path([[777,453],[796,465],[815,453]], '#a7b69c', 3);
            path([[777,463],[796,475],[815,463]], '#a7b69c', 3);
        }
        return c.toDataURL('image/png');
    }
    const images = Object.fromEntries(designs.map(([key,,color]) => [key, artwork(key, color)]));
    const style = document.createElement('style');
    style.textContent = `
        .premium-design-demo #custom-countdown-modal {background:#14221bcc !important;padding:16px;box-sizing:border-box;}
        .premium-design-demo #custom-countdown-modal > div {width:460px !important;max-width:100% !important;max-height:calc(100dvh - 32px);overflow:auto;background:#fff !important;border:1px solid #d9e1dc !important;border-radius:8px !important;padding:28px 22px 20px !important;box-shadow:0 16px 50px #152b2430 !important;color:#29413a;}
        .premium-design-demo #custom-countdown-modal h3 {color:#29413a !important;text-shadow:none !important;font-size:21px !important;padding:0 25px;margin-bottom:18px !important;}
        .premium-design-demo #custom-countdown-modal label {color:#40564d !important;font-size:13px;}
        .premium-design-demo #custom-countdown-modal input:not([type=radio]):not([type=hidden]) {background:#f8faf9 !important;color:#29413a !important;border:1px solid #cfdad3 !important;border-radius:6px !important;height:42px !important;color-scheme:light;}
        .premium-design-demo #custom-countdown-modal button {box-shadow:none !important;text-shadow:none !important;}
        .premium-design-demo #custom-countdown-modal > div > button:first-child {color:#53695f !important;background:#edf2ef !important;}
        .premium-design-demo #custom-countdown-modal > div > button:last-child {background:#315e50 !important;color:#fff !important;border-radius:6px !important;}
        .premium-design-demo #custom-countdown-modal button[onclick*="custom-emoji-grid-wrap"] {background:#f0f5f2 !important;color:#40564d !important;border-color:#d6e0d9 !important;}
        .premium-design-demo .theme-selector-grid {grid-template-columns:repeat(3,minmax(0,1fr)) !important;gap:8px !important;}
        .premium-design-demo .theme-btn {position:relative;display:flex;flex-direction:column;gap:5px;min-width:0;border:1px solid #d8e1db !important;border-radius:6px;padding:5px;background:#fff;cursor:pointer;text-align:center;}
        .premium-design-demo .theme-btn:has(input:checked) {border:2px solid #477461 !important;padding:4px;background:#f4f8f5;}
        .premium-design-demo .theme-btn:focus-within {outline:2px solid #537c9b;outline-offset:2px;}
        .premium-design-demo .theme-btn input {position:absolute;top:8px;right:8px;margin:0;accent-color:#386b55;width:13px;height:13px;}
        .premium-design-demo .theme-btn img {width:100%;height:51px;object-fit:cover;border-radius:3px;}
        .premium-design-demo .theme-btn span {font-size:12px;font-weight:600;line-height:18px;white-space:normal;}
        .premium-design-preview {margin:12px 0 0;min-height:116px;box-sizing:border-box;padding:21px 44px;text-align:center;background-size:100% 100%;border:1px solid #d8e1db;border-radius:6px;display:flex;flex-direction:column;justify-content:center;gap:8px;}
        .premium-design-preview strong {font-size:18px;color:#29413a;overflow-wrap:anywhere;line-height:1.35;}
        .premium-design-preview time {font-size:13px;color:#64796e;}
        body.premium-design-demo #main-timer-bg[data-special-design]:not(.dino-art-active) {background-image:var(--special-design-image) !important;background-size:100% 100% !important;background-position:center !important;background-repeat:no-repeat !important;border:1px solid #ccd9d2 !important;box-shadow:0 6px 22px #243c3110 !important;color:#29413a !important;}
        body.premium-design-demo #main-timer-bg[data-special-design]:not(.dino-art-active) .net-days-container,
        body.premium-design-demo #main-timer-bg[data-special-design]:not(.dino-art-active) .absolute-timer {background:transparent !important;border-color:transparent !important;box-shadow:none !important;}
        body.premium-design-demo #main-timer-bg[data-special-design]:not(.dino-art-active) :is(.net-days,.time-val,.time-lbl,.total-days-label,#main-target-title,#net-days-prefix,#net-days-suffix,#excluding-label,.vacation-length-box,#vacation-days-count) {color:#294b40 !important;-webkit-text-fill-color:#294b40 !important;background:none !important;text-shadow:none !important;filter:none !important;}
        @media(max-width:380px) {.premium-design-demo #custom-countdown-modal > div {padding:28px 14px 18px !important;}.premium-design-demo .theme-btn span{font-size:11px;}}
    `;
    document.head.append(style);
    grid.previousElementSibling.textContent = 'בחירת עיצוב מיוחד';
    grid.setAttribute('role', 'radiogroup'); grid.setAttribute('aria-label', 'בחירת עיצוב מיוחד');
    grid.replaceChildren();
    const preview = document.createElement('div'); preview.className = 'premium-design-preview';
    const title = document.createElement('strong'), date = document.createElement('time'); preview.append(title, date);
    grid.after(preview);
    function refresh() {
        const key = document.getElementById('custom-theme').value;
        preview.style.backgroundImage = `url("${images[key] || images.default}")`;
        title.textContent = document.getElementById('custom-name').value.trim() || 'האירוע שלי';
        const value = document.getElementById('custom-date').value;
        const time = document.getElementById('custom-time').value;
        date.textContent = value ? new Intl.DateTimeFormat('he-IL', {day:'numeric',month:'long',year:'numeric'}).format(new Date(value + 'T12:00:00')) + (time ? ' · ' + time : '') : '';
        date.dateTime = value ? value + (time ? 'T' + time : '') : '';
        grid.querySelectorAll('input').forEach(input => {input.checked = input.value === key;});
    }
    designs.forEach(([key, name]) => {
        const label = document.createElement('label'); label.className = 'theme-btn';label.dataset.theme = key;
        const radio = document.createElement('input');radio.type = 'radio';radio.name = 'special-countdown-design';radio.value = key;
        const img = document.createElement('img');img.src = images[key];img.alt = '';
        const text = document.createElement('span');text.textContent = name;
        label.append(radio, img, text);grid.append(label);
        radio.addEventListener('change', () => {window.selectCustomTheme(label);refresh();});
    });
    ['custom-name','custom-date','custom-time'].forEach(id => document.getElementById(id).addEventListener('input', refresh));
    new MutationObserver(refresh).observe(modal, {attributes:true,attributeFilter:['style']});
    const timer = document.getElementById('main-timer-bg');
    function updateTimer() {
        const found = designs.find(([key]) => key !== 'default' && timer.classList.contains('theme-' + key));
        if (found) {timer.dataset.specialDesign = found[0];timer.style.setProperty('--special-design-image', `url("${images[found[0]]}")`);}
        else {delete timer.dataset.specialDesign;timer.style.removeProperty('--special-design-image');}
    }
    new MutationObserver(updateTimer).observe(timer, {attributes:true,attributeFilter:['class']});
    refresh();updateTimer();
})();
