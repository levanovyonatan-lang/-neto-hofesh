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
        const canvas = document.createElement('canvas'); canvas.width = 900; canvas.height = 300;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = base; ctx.fillRect(0, 0, 900, 300);
        const box = (x,y,w,h,color,r=0) => {ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();};
        const stroke = (points,color,width=3,dash=[]) => {ctx.beginPath();ctx.moveTo(...points[0]);points.slice(1).forEach(p=>p.length===6?ctx.bezierCurveTo(...p):ctx.lineTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);};
        const ellipse = (x,y,rx,ry,color) => {ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
        if(theme==='license') {
            const road=[[-70,217],[105,87,244,264,410,196],[578,105,715,153,980,91]];
            stroke(road,'#d3e1d5',126);stroke(road,'#fdfdf6',92);stroke(road,'#647980',80);stroke(road,'#f7f0cc',3,[22,18]);
            ctx.save();ctx.translate(558,156);ctx.rotate(-.18);
            box(-31,-18,62,36,'#d27969',9);box(-14,-14,29,28,'#e7ece7',5);box(-10,-12,21,24,'#9fbec9',4);
            box(-24,-20,12,4,'#344f56',2);box(14,-20,12,4,'#344f56',2);box(-24,16,12,4,'#344f56',2);box(14,16,12,4,'#344f56',2);
            ctx.restore();
            stroke([[754,68],[754,132]],'#8ba49c',5);box(732,35,44,44,'#fff',5);box(737,40,34,34,'#507b96',3);
            ctx.font='bold 27px Arial';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText('ל',754,66);
            for(const [x,y] of [[88,255],[340,84],[824,228]]){stroke([[x,y],[x,y+24]],'#9eaf91',4);ellipse(x,y-7,16,21,'#a6c1a2');}
        } else if(theme==='vacation') {
            box(0,205,900,95,'#c5e3e7');stroke([[0,206],[215,178,380,238,580,203],[717,180,815,211,920,184]],'#94c5cf',3);
            stroke([[80,241],[212,227,313,262,427,243]],'#ecf8f8',3);
            box(616,147,76,100,'#6e9daf',12);stroke([[638,147],[638,128],[670,128],[670,147]],'#607f8b',5);
            stroke([[640,163],[640,232]],'#a2c5ce',3);stroke([[668,163],[668,232]],'#a2c5ce',3);
            ellipse(634,249,5,5,'#476770');ellipse(677,249,5,5,'#476770');
            stroke([[197,143],[210,246]],'#ab9677',5);
            ctx.fillStyle='#e3a496';ctx.beginPath();ctx.arc(197,144,70,Math.PI,Math.PI*2);ctx.closePath();ctx.fill();
            stroke([[390,117],[470,180,565,15,679,56]],'#acc7d0',2,[7,9]);
            ctx.save();ctx.translate(703,57);ctx.rotate(.18);ctx.fillStyle='#5e8fa5';ctx.beginPath();
            [[-27,0],[-4,-7],[5,-34],[13,-34],[10,-7],[32,0],[10,7],[12,20],[4,20],[-4,7]].forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();ctx.restore();
        } else if(theme==='celebration') {
            stroke([[114,96],[184,162,167,207,197,260]],'#ceb6bd',2);stroke([[184,80],[252,159,173,204,214,262]],'#b4c4c8',2);
            ellipse(113,79,29,38,'#d8a3b3');ellipse(183,63,27,35,'#9ebfca');
            box(377,208,154,11,'#d3c4c1',5);box(389,133,130,76,'#d9a3ad',8);box(389,133,130,19,'#fff5e8',6);
            for(let n=0;n<3;n++){box(423+n*28,107,5,26,'#739fab',2);ellipse(425+n*28,98,4,7,'#d8b56f');}
            box(669,161,91,78,'#96bcb1',5);box(659,152,111,15,'#719f93',3);box(706,154,12,84,'#eee1b4');
            stroke([[711,153],[659,104,690,112,711,153],[747,96,771,131,711,153]],'#c4ac77',5);
            [[281,152],[590,99],[782,80],[326,83],[556,241]].forEach(([x,y],i)=>{ctx.save();ctx.translate(x,y);ctx.rotate(i+.4);box(0,0,6,15,i%2?'#a0b6bf':'#d6b77c',2);ctx.restore();});
        } else if(theme==='exam') {
            ctx.save();ctx.translate(450,162);ctx.rotate(-.08);
            box(-128,-84,256,180,'#abc6bd',8);box(-119,-80,238,168,'#fffefa',5);
            for(let n=0;n<6;n++)stroke([[-98,-48+n*23],[100,-48+n*23]],'#d6e5e1',2);
            stroke([[66,-76],[66,82]],'#e3b8b6',2);
            for(let n=0;n<5;n++)stroke([[-130,-56+n*29],[-110,-56+n*29]],'#76988e',5);
            ctx.restore();
            ctx.save();ctx.translate(666,187);ctx.rotate(.16);box(-35,-62,70,119,'#6c8c99',8);box(-25,-50,50,26,'#e0ebdf',3);
            for(let y=0;y<3;y++)for(let z=0;z<3;z++)box(-23+z*17,-10+y*17,11,11,'#d5e1de',2);ctx.restore();
            ctx.save();ctx.translate(217,183);ctx.rotate(-.5);box(-8,-79,16,144,'#d5b574',3);box(-8,-79,16,20,'#d5a1a1',3);
            ctx.fillStyle='#ab9373';ctx.beginPath();ctx.moveTo(-8,65);ctx.lineTo(0,85);ctx.lineTo(8,65);ctx.fill();ctx.restore();
        } else if(theme==='military') {
            for(let n=0;n<5;n++)stroke([[-20,160+n*22],[104,80+n*22,148,274+n*14,280,219+n*15]],'#d0deca',2);
            box(375,99,132,159,'#819976',22);stroke([[409,100],[409,80],[469,80],[469,100]],'#627e5c',9);
            box(394,172,94,65,'#a2b18e',9);stroke([[404,186],[478,186]],'#6c8465',3);box(390,123,103,27,'#c0c9a9',6);
            stroke([[649,88],[709,139,627,165,662,212]],'#a8b7b6',3,[3,4]);
            ctx.save();ctx.translate(668,218);ctx.rotate(.2);box(-23,-36,46,65,'#b2c2c1',7);for(let n=0;n<3;n++)stroke([[-12,-17+n*10],[12,-17+n*10]],'#e8eeea',3);ctx.restore();
            stroke([[186,129],[200,141],[214,129]],'#879e77',4);stroke([[186,141],[200,153],[214,141]],'#879e77',4);
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
        .premium-design-demo .theme-btn img {width:100%;height:58px;object-fit:contain;border-radius:3px;}
        .premium-design-demo .theme-btn span {font-size:12px;font-weight:600;line-height:18px;white-space:normal;}
        .premium-design-preview {margin:12px 0 0;min-height:180px;box-sizing:border-box;padding:19px 24px 100px;text-align:center;background-size:100% auto;background-repeat:no-repeat;background-position:bottom;border:1px solid #d8e1db;border-radius:6px;display:flex;flex-direction:column;justify-content:flex-start;gap:8px;}
        .premium-design-preview strong {font-size:18px;color:#29413a;overflow-wrap:anywhere;line-height:1.35;}
        .premium-design-preview time {font-size:13px;color:#64796e;}
        body.premium-design-demo #main-timer-bg[data-special-design]:not(.dino-art-active) {background-image:var(--special-design-image) !important;background-color:var(--special-design-base) !important;background-size:100% auto !important;background-position:center bottom !important;background-repeat:no-repeat !important;padding-bottom:var(--special-design-space,130px) !important;border:1px solid #ccd9d2 !important;box-shadow:0 6px 22px #243c3110 !important;color:#29413a !important;}
        body.premium-design-demo #main-timer-bg[data-special-design]:not(.dino-art-active) .ai-btn {background:#ffffffa8 !important;color:#38594c !important;border:1px solid #c9d8d0 !important;box-shadow:none !important;border-radius:8px !important;}
        body.premium-design-demo #main-timer-bg[data-special-design]:not(.dino-art-active) .ai-btn span {color:#38594c !important;}
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
        preview.style.backgroundColor = designs.find(item => item[0] === key)?.[2] || designs[0][2];
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
        if (found) {timer.dataset.specialDesign = found[0];timer.style.setProperty('--special-design-image', `url("${images[found[0]]}")`);timer.style.setProperty('--special-design-base',found[2]);}
        else {delete timer.dataset.specialDesign;timer.style.removeProperty('--special-design-image');}
    }
    new MutationObserver(updateTimer).observe(timer, {attributes:true,attributeFilter:['class']});
    new ResizeObserver(() => timer.style.setProperty('--special-design-space', Math.round(timer.clientWidth / 3 + 12) + 'px')).observe(timer);
    refresh();updateTimer();
})();
