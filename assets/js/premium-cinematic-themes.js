/**
 * Premium Cinematic Themes Engine
 * High-performance Canvas 2D background animations for the custom countdown cards.
 */

(function() {
    // Only run if the demo flag is on
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('show_demo') !== 'true' && urlParams.get('demo_premium') !== '1') return;
    const celebrationStyle = document.createElement('style');
    celebrationStyle.textContent = `
        .main-timer-card.theme-celebration::before {background:rgba(10,22,26,.08);backdrop-filter:none;-webkit-backdrop-filter:none;}
        #main-timer-bg[data-personal-countdown] {--personal-ink:#fffaf0;padding:30px 22px !important;min-height:310px;box-sizing:border-box;isolation:isolate;}
        #main-timer-bg[data-personal-countdown]::before {z-index:1;background:rgba(9,17,25,.52) !important;backdrop-filter:none !important;-webkit-backdrop-filter:none !important;}
        #main-timer-bg[data-personal-countdown] > :not(canvas) {position:relative;z-index:2;}
        #main-timer-bg[data-personal-countdown]:not([class*="theme-"]) {--personal-ink:#243e35;background:#f3f7f4 !important;}
        #main-timer-bg[data-personal-countdown] #main-target-title {font-size:24px !important;line-height:1.4;margin:8px 0 10px !important;overflow-wrap:anywhere;}
        #personal-event-date {display:block;font-size:14px;line-height:1.7;margin:0 auto 20px;max-width:100%;}
        #personal-countdown-label {display:block;font-size:13px;font-weight:500;line-height:1.5;margin-bottom:12px;}
        #main-timer-bg[data-personal-countdown] :is(#main-target-title,#personal-event-date,#personal-countdown-label,.time-val,.time-lbl) {color:var(--personal-ink) !important;-webkit-text-fill-color:var(--personal-ink) !important;background:none !important;filter:none !important;text-shadow:none !important;letter-spacing:0 !important;}
        #main-timer-bg[data-personal-countdown] :is(.net-days-container,.ai-tools,.tip-box,#excluding-label,#vacation-length-box,#total-days-label) {display:none !important;}
        #main-timer-bg[data-personal-countdown] #absolute-timer-container {width:100%;margin:0 auto 12px !important;padding:16px 0 !important;max-width:370px;box-sizing:border-box;display:grid !important;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 4px;background:transparent !important;border:0 !important;border-top:1px solid #9caeac55 !important;box-shadow:none !important;border-radius:0 !important;}
        #main-timer-bg[data-personal-countdown] .time-box {display:flex !important;flex-direction:column;gap:7px;min-width:0;box-sizing:border-box;padding:0 2px;background:transparent !important;border:0 !important;box-shadow:none !important;}
        #main-timer-bg[data-personal-countdown] .time-box:first-child {grid-column:1 / -1;padding-bottom:12px;border-bottom:1px solid #9caeac44 !important;}
        #main-timer-bg[data-personal-countdown] .time-val {font-size:28px !important;line-height:1.2;font-weight:700;font-variant-numeric:tabular-nums;min-height:34px;}
        #main-timer-bg[data-personal-countdown] .time-box:first-child .time-val {font-size:72px !important;line-height:1;font-weight:900;min-height:72px;}
        #main-timer-bg[data-personal-countdown] .time-lbl {font-size:12px !important;font-weight:400;line-height:1.4;}
        #main-timer-bg[data-personal-countdown] .time-box:first-child .time-lbl {font-size:18px !important;font-weight:700;}
        @media(max-width:380px) {#main-timer-bg[data-personal-countdown] .time-val {font-size:24px !important;}#main-timer-bg[data-personal-countdown] .time-box:first-child .time-val {font-size:56px !important;min-height:56px;}#main-timer-bg[data-personal-countdown] #main-target-title {font-size:22px !important;}}
    `;
    document.head.appendChild(celebrationStyle);

    let canvas = null;
    let ctx = null;
    let animationId = null;
    let width = 0;
    let height = 0;
    
    // Scene State
    let currentTheme = null;
    let time = 0;
    let particles = [];
    
    function init() {
        const container = document.getElementById('main-timer-bg');
        if (!container) return;
        
        // Ensure container can hold absolute children safely
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        
        // Create canvas
        canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.display = 'none';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '0';
        canvas.style.pointerEvents = 'none'; // Click through to the UI
        container.insertBefore(canvas, container.firstChild);
        
        ctx = canvas.getContext('2d', { alpha: false });
        
        // Handle Resize
        const resizeObserver = new ResizeObserver(() => {
            width = container.clientWidth;
            height = container.clientHeight;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            
            // Re-init particles on resize to fit new dimensions
            initScene(currentTheme);
        });
        resizeObserver.observe(container);
        
        // Monitor class changes to detect theme change
        const mutationObserver = new MutationObserver(() => {
            const newTheme = getThemeFromClass(container.className);
            if (newTheme !== currentTheme) {
                currentTheme = newTheme;
                initScene(currentTheme);
            }
        });
        mutationObserver.observe(container, { attributes: true, attributeFilter: ['class'] });
        
        currentTheme = getThemeFromClass(container.className);
        initScene(currentTheme);
        
        requestAnimationFrame(renderLoop);
    }
    
    function getThemeFromClass(className) {
        if (className.includes('theme-license')) return 'license';
        if (className.includes('theme-vacation')) return 'vacation';
        if (className.includes('theme-celebration')) return 'celebration';
        if (className.includes('theme-exam')) return 'exam';
        if (className.includes('theme-military')) return 'military';
        return null;
    }
    
    function initScene(theme) {
        // An opaque canvas must not cover ordinary holiday countdowns.
        canvas.style.display = theme ? 'block' : 'none';
        particles = [];
        time = 0;
        
        if (theme === 'license') {
            // Stars for sky
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * (height * 0.4), // Only top half
                    size: Math.random() * 1.5,
                    blinkSpeed: Math.random() * 0.05 + 0.01
                });
            }
        } else if (theme === 'vacation') {
            // Clouds
            for (let i = 0; i < 4; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * (height * 0.6),
                    speed: (Math.random() * 0.2 + 0.1),
                    scale: Math.random() * 0.5 + 0.5
                });
            }
        } else if (theme === 'exam') {
            // Grid Nodes
            for (let i = 0; i < 20; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5
                });
            }
        } else if (theme === 'military') {
            // Radar blips
            for(let i=0; i<3; i++) {
                particles.push({
                    angle: Math.random() * Math.PI * 2,
                    dist: Math.random() * Math.min(width, height) * 0.4,
                    life: 0
                });
            }
        } else if (theme === 'celebration') {
            const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6'];
            // Confetti
            for (let i = 0; i < 40; i++) {
                particles.push({
                    type: 'confetti',
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 6 + 4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    speedY: Math.random() * 1.5 + 0.8,
                    speedX: (Math.random() - 0.5) * 1.5,
                    angle: Math.random() * Math.PI * 2,
                    spin: (Math.random() - 0.5) * 0.25
                });
            }
            // Glowing Orbs (Bokeh)
            for (let i = 0; i < 12; i++) {
                particles.push({
                    type: 'orb',
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 25 + 10,
                    speedY: -(Math.random() * 0.6 + 0.2),
                    alpha: Math.random() * 0.3 + 0.1
                });
            }
        }
    }
    
    // ----------- SCENE RENDERERS -----------
    
    function drawLicense() {
        // Deep night sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.5);
        skyGrad.addColorStop(0, '#020617'); // Very dark blue/black
        skyGrad.addColorStop(1, '#1e1b4b'); // Deep indigo
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height * 0.5);
        
        // Stars
        ctx.fillStyle = '#fff';
        particles.forEach(p => {
            const a = (Math.sin(time * p.blinkSpeed) + 1) / 2;
            ctx.globalAlpha = a * 0.8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
        
        // Ground (Asphalt)
        const groundGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
        groundGrad.addColorStop(0, '#09090b');
        groundGrad.addColorStop(1, '#18181b');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, height * 0.5, width, height * 0.5);
        
        // Horizon glow (City lights)
        const horizonGrad = ctx.createLinearGradient(0, height * 0.4, 0, height * 0.55);
        horizonGrad.addColorStop(0, 'transparent');
        horizonGrad.addColorStop(0.8, 'rgba(139, 92, 246, 0.3)'); // Purple glow
        horizonGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = horizonGrad;
        ctx.fillRect(0, height * 0.4, width, height * 0.15);
        
        // 3D Road
        const horizonY = height * 0.5;
        const roadWidthBottom = width * 0.8;
        const roadWidthTop = width * 0.1;
        
        ctx.fillStyle = '#0f0f11'; // Darker asphalt for the road itself
        ctx.beginPath();
        ctx.moveTo(width / 2 - roadWidthTop / 2, horizonY);
        ctx.lineTo(width / 2 + roadWidthTop / 2, horizonY);
        ctx.lineTo(width / 2 + roadWidthBottom / 2, height);
        ctx.lineTo(width / 2 - roadWidthBottom / 2, height);
        ctx.fill();
        
        // Moving dashed lines
        ctx.fillStyle = 'rgba(250, 204, 21, 0.8)'; // Yellow
        const speed = 4;
        const segmentLength = 40;
        const gapLength = 40;
        const totalLen = segmentLength + gapLength;
        const offset = (time * speed) % totalLen;
        
        for (let y = height; y > horizonY; y -= 5) {
            // Perspective math
            const distFromHorizon = y - horizonY;
            const totalDist = height - horizonY;
            const perspective = distFromHorizon / totalDist; // 0 at horizon, 1 at bottom
            
            // Map real world Y to screen Y using perspective depth
            // We fake depth by accelerating the offset as it gets closer
            const worldY = (1 / perspective) * 100 - offset;
            
            if (worldY % totalLen < segmentLength) {
                const lineWidth = 2 + (perspective * 12); // Wider at bottom
                const rectHeight = 2 + (perspective * 15);
                ctx.fillRect(width / 2 - lineWidth / 2, y, lineWidth, rectHeight);
            }
        }
    }
    
    function drawVacation() {
        // Deep vibrant gradient sky
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#0f172a'); // Very dark blue at top
        grad.addColorStop(0.5, '#312e81'); // Purple-blue
        grad.addColorStop(1, '#be185d'); // Pink-red sunset at horizon
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        
        // Huge glowing sun
        const sunY = height * 0.4;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(width * 0.5, sunY, 120, 0, Math.PI * 2);
        ctx.shadowBlur = 80;
        ctx.shadowColor = '#facc15';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
        
        // Stars/particles slowly drifting
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        particles.forEach((p, i) => {
            if (i < 30) { // use subset of particles for stars
                p.x += p.speed * 0.5;
                if (p.x > width + 10) p.x = -10;
                ctx.beginPath();
                ctx.arc(p.x, p.y * 0.5, p.scale * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // 3 Overlapping sine waves for ocean
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(0, height);
            
            let amplitude = 20 + i * 15;
            let frequency = 0.002 + i * 0.001;
            let phase = time * (0.01 + i * 0.005);
            let yOffset = height - 40 - (i * 20);
            
            for (let x = 0; x <= width; x += 20) {
                let y = yOffset + Math.sin(x * frequency + phase) * amplitude;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            
            // Neon ocean colors
            let colors = ['rgba(14, 165, 233, 0.4)', 'rgba(56, 189, 248, 0.5)', 'rgba(2, 132, 199, 0.6)'];
            ctx.fillStyle = colors[i];
            ctx.fill();
        }
    }
    
    function drawCelebration() {
        // Deep party gradient background
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#0f172a'); // Very dark blue
        grad.addColorStop(0.5, '#3b0764'); // Deep rich purple
        grad.addColorStop(1, '#831843'); // Dark pink/magenta at bottom
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Subtle stage light glow from bottom
        const glow = ctx.createRadialGradient(width/2, height, 0, width/2, height, width);
        glow.addColorStop(0, 'rgba(244, 63, 94, 0.3)'); // Vibrant rose glow
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
        
        // Draw Particles (Orbs and Confetti)
        particles.forEach(p => {
            if (p.type === 'orb') {
                p.y += p.speedY;
                if (p.y + p.size < 0) {
                    p.y = height + p.size;
                    p.x = Math.random() * width;
                }
                
                // Pulsing alpha for bokeh
                const currentAlpha = p.alpha + Math.sin(time * 0.02 + p.x) * 0.15;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, currentAlpha)})`;
                ctx.fill();
            } else if (p.type === 'confetti') {
                p.y += p.speedY;
                p.x += Math.sin(time * 0.01 + p.size) * 0.5 + p.speedX; // sway sideways
                p.angle += p.spin;
                
                if (p.y > height + 20) {
                    p.y = -20;
                    p.x = Math.random() * width;
                }
                
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                // Pseudo 3D flip effect
                ctx.scale(Math.sin(time * 0.06 + p.size), 1);
                
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size/2, -p.size, p.size, p.size * 2);
                ctx.restore();
            }
        });

        // Periodic fireworks bursts in background
        const burstPeriod = 180;
        const burstTime = time % burstPeriod;
        if (burstTime < 70) {
            // Fixed position for the burst per cycle
            const cycle = Math.floor(time / burstPeriod);
            const bx = ((cycle * 137) % (width * 0.8)) + width * 0.1;
            const by = ((cycle * 251) % (height * 0.5)) + height * 0.1;
            
            const progress = burstTime / 70; // 0 to 1
            const radius = progress * 90;
            const alpha = 1 - progress; // Fade out
            
            ctx.save();
            ctx.translate(bx, by);
            ctx.globalAlpha = alpha;
            
            for(let i=0; i<12; i++) {
                const angle = (i / 12) * Math.PI * 2 + (progress * 0.5);
                const rayLen = radius * 0.8;
                
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * (radius * 0.2), Math.sin(angle) * (radius * 0.2));
                ctx.lineTo(Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
                
                const hue = (cycle * 73 + i * 15) % 360;
                ctx.strokeStyle = `hsl(${hue}, 100%, 70%)`;
                ctx.lineWidth = 3 * (1 - progress);
                ctx.lineCap = 'round';
                ctx.stroke();
            }
            
            ctx.restore();
        }
    }
    
    function drawExam() {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.2)';
        ctx.lineWidth = 1;
        
        // Draw connected nodes (Constellation effect)
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            
            if (p.x < 0 || p.x > width) p.speedX *= -1;
            if (p.y < 0 || p.y > height) p.speedY *= -1;
            
            ctx.fillStyle = 'rgba(14, 165, 233, 0.5)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 150) {
                    ctx.globalAlpha = 1 - (dist / 150);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1.0;
        
        // Overlay a slow-moving grid
        const gridSize = 40;
        const offset = (time * 0.5) % gridSize;
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.05)';
        ctx.beginPath();
        for (let x = 0; x < width; x += gridSize) {
            ctx.moveTo(x, 0); ctx.lineTo(x, height);
        }
        for (let y = offset - gridSize; y < height; y += gridSize) {
            ctx.moveTo(0, y); ctx.lineTo(width, y);
        }
        ctx.stroke();
    }
    
    function drawMilitary() {
        ctx.fillStyle = '#052e16'; // Dark green
        ctx.fillRect(0, 0, width, height);
        
        const cx = width / 2;
        const cy = height / 2;
        const maxDist = Math.min(width, height) * 0.6;
        
        // Grid rings
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
            ctx.beginPath();
            ctx.arc(cx, cy, (maxDist / 4) * i, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
        ctx.moveTo(0, cy); ctx.lineTo(width, cy);
        ctx.stroke();
        
        // Radar sweep
        const sweepAngle = (time * 0.02) % (Math.PI * 2);
        
        // Draw wedge
        ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxDist, sweepAngle - 0.5, sweepAngle, false);
        ctx.closePath();
        ctx.fill();
        
        // Draw leading line
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sweepAngle) * maxDist, cy + Math.sin(sweepAngle) * maxDist);
        ctx.stroke();
        
        // Blips
        particles.forEach(p => {
            // Check if sweep passed this angle recently
            let angDiff = sweepAngle - p.angle;
            if (angDiff < 0) angDiff += Math.PI * 2;
            
            if (angDiff > 0 && angDiff < 0.1) {
                p.life = 1.0; // Trigger blip
            }
            
            if (p.life > 0) {
                ctx.fillStyle = `rgba(134, 239, 172, ${p.life})`;
                ctx.beginPath();
                ctx.arc(cx + Math.cos(p.angle) * p.dist, cy + Math.sin(p.angle) * p.dist, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // Ring ripple
                ctx.strokeStyle = `rgba(134, 239, 172, ${p.life * 0.5})`;
                ctx.beginPath();
                ctx.arc(cx + Math.cos(p.angle) * p.dist, cy + Math.sin(p.angle) * p.dist, 10 - (p.life * 6), 0, Math.PI * 2);
                ctx.stroke();
                
                p.life -= 0.01;
            }
        });
    }
    
    function renderLoop() {
        if (width > 0 && height > 0) {
            time++;
            
            if (currentTheme === 'license') drawLicense();
            else if (currentTheme === 'vacation') drawVacation();
            else if (currentTheme === 'celebration') drawCelebration();
            else if (currentTheme === 'exam') drawExam();
            else if (currentTheme === 'military') drawMilitary();
            else {
                // Default fallback if no theme
                ctx.clearRect(0, 0, width, height);
            }
        }
        
        animationId = requestAnimationFrame(renderLoop);
    }
    
    // Inject automatically after a slight delay to ensure DOM is ready
    setTimeout(init, 100);

})();
