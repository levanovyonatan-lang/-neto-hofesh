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
        const canvas = document.createElement('canvas'); canvas.width = 900; canvas.height = 700;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = theme === 'license' ? '#39474c' : base;
        ctx.fillRect(0, 0, 900, 700);
        const box = (x,y,w,h,color) => {ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
        const line = (x,y,x2,y2,color,width=2,dash=[]) => {
            ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);
            ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);
        };
        if (theme === 'license') {
            box(0,0,35,700,'#303e43');box(865,0,35,700,'#303e43');
            line(35,0,35,700,'#d9c88b',5);line(865,0,865,700,'#d9c88b',5);
            // The empty middle lane is reserved for countdown text.
            line(104,-20,104,720,'#d8e2df',10,[40,34]);
            line(796,-20,796,720,'#d8e2df',10,[40,34]);
            for(let n=0;n<700;n+=8){box(3,n,4,2,'#4b575a');box(889,n,4,2,'#4b575a');}
        } else if (theme === 'vacation') {
            box(0,0,99,700,'#d2e8ed');
            line(111,0,111,700,'#a5c7d0',2,[8,9]);
            line(139,99,866,99,'#d4e5e8',2);
            for(let n=0;n<19;n++)box(26+(n%2)*4,430+n*8,44-(n%3)*5,n%3===0?4:2,'#83a8b3');
            ctx.save();ctx.translate(50,69);ctx.fillStyle='#588694';ctx.beginPath();
            [[-23,0],[-4,-6],[4,-27],[10,-27],[8,-6],[25,0],[8,6],[10,16],[4,16],[-4,6]].forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));
            ctx.closePath();ctx.fill();ctx.restore();
            ctx.fillStyle='#f8fbfc';ctx.beginPath();ctx.arc(111,0,15,0,Math.PI);ctx.fill();
            ctx.beginPath();ctx.arc(111,700,15,Math.PI,Math.PI*2);ctx.fill();
        } else if (theme === 'exam') {
            for(let x=0;x<900;x+=32)line(x,0,x,700,'#dce8e7',1);
            for(let y=0;y<700;y+=32)line(0,y,900,y,'#dce8e7',1);
            line(785,0,785,700,'#d6a8b0',2);
            box(0,0,55,700,'#e6efed');
            for(let y=47;y<700;y+=81) {
                ctx.fillStyle='#fafcfa';ctx.beginPath();ctx.arc(27,y,8,0,Math.PI*2);ctx.fill();
                line(0,y,27,y,'#9db6ae',4);
            }
        } else if (theme === 'celebration') {
            ctx.save();ctx.translate(835,43);ctx.rotate(.75);
            box(-115,-16,230,32,'#d998a8');box(-115,8,230,3,'#f9e5e9');ctx.restore();
            ctx.save();ctx.translate(33,664);ctx.rotate(.75);
            box(-115,-16,230,32,'#97bdb9');box(-115,8,230,3,'#e9f5ee');ctx.restore();
            [[59,66],[102,120],[809,167],[845,524],[777,606],[99,546]].forEach(([x,y],n)=>{
                ctx.save();ctx.translate(x,y);ctx.rotate(n*.9);
                box(-3,-9,6,18,n%2?'#cfae6a':'#8ab6ba');ctx.restore();
            });
        } else if (theme === 'military') {
            ctx.strokeStyle='#a5b399';ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.strokeRect(27,27,846,646);ctx.setLineDash([]);
            box(47,0,7,700,'#c0ccb5');
            for(let n=0;n<6;n++) {
                ctx.beginPath();ctx.moveTo(700+n*24,0);
                ctx.bezierCurveTo(660+n*24,45,857+n*14,85,900,155+n*18);
                ctx.strokeStyle='#d6dfce';ctx.lineWidth=2;ctx.stroke();
            }
            for(let n=0;n<3;n++){line(802,537+n*15,820,548+n*15,'#899c77',4);line(820,548+n*15,838,537+n*15,'#899c77',4);}
        }
        return canvas.toDataURL('image/png');
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
        .premium-design-demo .theme-btn img {width:100%;height:58px;object-fit:fill;border-radius:3px;}
        .premium-design-demo .theme-btn span {font-size:12px;font-weight:600;line-height:18px;white-space:normal;}
        .premium-design-preview {margin:12px 0 0;min-height:130px;box-sizing:border-box;padding:26px 46px;text-align:center;background-size:100% 100%;background-repeat:no-repeat;border:1px solid #d8e1db;border-radius:6px;display:flex;flex-direction:column;justify-content:center;gap:8px;}
        .premium-design-preview strong {font-size:18px;color:var(--special-design-ink,#29413a);overflow-wrap:anywhere;line-height:1.35;}
        .premium-design-preview time {font-size:13px;color:var(--special-design-ink,#64796e);}
        body.premium-design-demo #main-timer-bg[data-special-design]:not(.dino-art-active) {background-image:var(--special-design-image) !important;background-color:var(--special-design-base) !important;background-size:100% 100% !important;background-position:center !important;background-repeat:no-repeat !important;border:1px solid #ccd9d2 !important;box-shadow:0 6px 22px #243c3110 !important;color:var(--special-design-ink,#29413a) !important;}
        body.premium-design-demo #main-timer-bg[data-special-design]:not(.dino-art-active) .ai-btn {background:#ffffffa8 !important;color:#38594c !important;border:1px solid #c9d8d0 !important;box-shadow:none !important;border-radius:8px !important;}
        body.premium-design-demo #main-timer-bg[data-special-design]:not(.dino-art-active) .ai-btn span {color:#38594c !important;}
        body.premium-design-demo #main-timer-bg[data-special-design]:not(.dino-art-active) .net-days-container,
        body.premium-design-demo #main-timer-bg[data-special-design]:not(.dino-art-active) .absolute-timer {background:transparent !important;border-color:transparent !important;box-shadow:none !important;}
        body.premium-design-demo #main-timer-bg[data-special-design]:not(.dino-art-active) :is(.net-days,.time-val,.time-lbl,.total-days-label,#main-target-title,#net-days-prefix,#net-days-suffix,#excluding-label,.vacation-length-box,#vacation-days-count) {color:var(--special-design-ink,#294b40) !important;-webkit-text-fill-color:var(--special-design-ink,#294b40) !important;background:none !important;text-shadow:none !important;filter:none !important;}
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
        preview.style.backgroundColor = designs.find(item => item[0] === key)?.[2] || designs[0][2];
        preview.style.setProperty('--special-design-ink', key === 'license' ? '#f4f5ea' : '#294b40');
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
        if (found) {timer.dataset.specialDesign = found[0];timer.style.setProperty('--special-design-image', `url("${images[found[0]]}")`);timer.style.setProperty('--special-design-base',found[2]);timer.style.setProperty('--special-design-ink',found[0] === 'license' ? '#f4f5ea' : '#294b40');}
        else {delete timer.dataset.specialDesign;timer.style.removeProperty('--special-design-image');}
    }
    new MutationObserver(updateTimer).observe(timer, {attributes:true,attributeFilter:['class']});
    refresh();updateTimer();
})();
