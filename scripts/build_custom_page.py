import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('href="official-sun-neto-transparent.png', 'href="../official-sun-neto-transparent.png')
html = html.replace('src="official-sun-neto-transparent.png', 'src="../official-sun-neto-transparent.png')
html = html.replace('href="icon-neto-sunglasses-white.png', 'href="../icon-neto-sunglasses-white.png')
html = html.replace('src="icon-neto-sunglasses-white.png', 'src="../icon-neto-sunglasses-white.png')
html = html.replace('href="manifest.json', 'href="../manifest.json')
html = html.replace('href="assets/', 'href="../assets/')
html = html.replace('src="assets/', 'src="../assets/')
html = html.replace('src="tips.js"', 'src="../tips.js"')
html = html.replace('href="avigail-camp.html"', 'href="../avigail-camp.html"')
html = html.replace('href="fitness.html"', 'href="../fitness.html"')

# Fix relative links
import re
html = re.sub(r'href="(?:\.\./)?(hanukkah|taanit-esther|purim|pesach|asru-chag|atzmaut|lag-baomer|shavuot|summer-high|summer)/"', r'href="../\1/"', html)

script = """
<script>
document.addEventListener('DOMContentLoaded', () => {
    // Hide main screen and setup screen
    const ms = document.getElementById('main-screen');
    if(ms) ms.style.display = 'none';
    const ss = document.getElementById('setup-screen');
    if(ss) ss.style.display = 'none';

    // Show custom modal full screen
    const modal = document.getElementById('custom-countdown-modal');
    if(modal) {
        modal.style.display = 'flex';
        modal.style.background = 'var(--bg-gradient)';
        modal.style.position = 'relative';
        modal.style.zIndex = '1';
        
        const closeBtn = modal.querySelector('.premium-modal-close');
        if(closeBtn) closeBtn.style.display = 'none';
        
        const content = modal.querySelector('.premium-modal-content');
        if(content) {
            content.style.maxWidth = '600px';
            content.style.width = '100%';
            content.style.height = '100%';
            content.style.border = 'none';
            content.style.borderRadius = '0';
            content.style.boxShadow = 'none';
            content.style.margin = '0';
            content.style.background = 'transparent';
        }
    }

    // Override save to redirect
    const originalSave = window.saveCustomCountdown;
    if (originalSave) {
        window.saveCustomCountdown = function() {
            if (originalSave() === false) return;
            setTimeout(() => {
                window.location.href = '../index.html?modal=custom';
            }, 100);
        };
    }
});
</script>
</body>
"""

html = html.replace('</body>', script)

os.makedirs('custom', exist_ok=True)
with open('custom/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Created custom/index.html")
