import re

with open('assets/js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """function animateAbsoluteTimer(diff) {
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
}"""

content = re.sub(r'function animateAbsoluteTimer\(diff\) \{[\s\S]*?absAnimationId = window\.requestAnimationFrame\(step\);\s*\}', replacement, content)

with open('assets/js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement successful.")
