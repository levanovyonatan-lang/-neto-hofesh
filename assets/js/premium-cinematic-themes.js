/**
 * Premium Cinematic Themes Engine
 * High-performance Canvas 2D background animations for the custom countdown cards.
 */

(function() {
    // Only run if the demo flag is on
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('show_demo') !== 'true' && urlParams.get('demo_premium') !== '1') return;

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
        } else if (theme === 'celebration') {
            // Bokeh Orbs
            for (let i = 0; i < 30; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 30 + 10,
                    speedY: -(Math.random() * 0.5 + 0.2),
                    hue: Math.random() > 0.5 ? 320 : 40, // Pink or Gold
                    opacity: Math.random() * 0.3 + 0.1
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
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#38bdf8'); // Sky blue
        grad.addColorStop(0.6, '#818cf8');
        grad.addColorStop(1, '#f472b6'); // Pinkish sunset
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        
        // Sun
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(width * 0.8, height * 0.7, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#fef08a';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
        
        // Clouds
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        particles.forEach(p => {
            p.x += p.speed;
            if (p.x > width + 100) p.x = -100;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.scale(p.scale, p.scale);
            
            // Draw simple puffy cloud
            ctx.beginPath();
            ctx.arc(0, 0, 30, 0, Math.PI * 2);
            ctx.arc(25, -15, 35, 0, Math.PI * 2);
            ctx.arc(55, 0, 25, 0, Math.PI * 2);
            ctx.arc(30, 10, 25, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }
    
    function drawCelebration() {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#2e1065'); // Deep purple
        grad.addColorStop(1, '#831843'); // Deep pink
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        
        particles.forEach(p => {
            p.y += p.speedY;
            if (p.y < -p.radius) {
                p.y = height + p.radius;
                p.x = Math.random() * width;
            }
            
            // Pulsing effect
            const alpha = p.opacity + (Math.sin(time * 0.05 + p.x) * 0.1);
            
            ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${Math.max(0, alpha)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });
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
