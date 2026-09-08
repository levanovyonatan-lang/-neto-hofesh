const fs = require('fs');

let content = fs.readFileSync('assets/js/app.js', 'utf-8');

const replacement = `function animateAbsoluteTimer(diff) {
    if (absAnimationId) { cancelAnimationFrame(absAnimationId); absAnimationId = null; }
    isAnimatingAbs = false;
    if (diff <= 0) return;
    
    const finalDays = Math.floor(diff / 86400000);
    const finalHours = Math.floor((diff % 86400000) / 3600000);
    const finalMins = Math.floor((diff % 3600000) / 60000);
    const finalSecs = Math.floor((diff % 60000) / 1000);
    
    setDomText('abs-days', finalDays);
    setDomText('abs-hours', String(finalHours).padStart(2, '0'));
    setDomText('abs-mins', String(finalMins).padStart(2, '0'));
    setDomText('abs-secs', String(finalSecs).padStart(2, '0'));
}`;

content = content.replace(/function animateAbsoluteTimer\(diff\) \{[\s\S]*?absAnimationId = window\.requestAnimationFrame\(step\);\s*\}/, replacement);

fs.writeFileSync('assets/js/app.js', content, 'utf-8');

console.log("Replacement successful.");
