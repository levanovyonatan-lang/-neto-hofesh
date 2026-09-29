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
        modal.style.display = 'block';
        modal.style.minHeight = '100vh';
        modal.style.position = 'relative';
        modal.style.background = '#0f172a';
        modal.style.zIndex = '1';
        
        const closeBtn = modal.querySelector('.premium-modal-close');
        if(closeBtn) closeBtn.style.display = 'none';
        
        const content = modal.querySelector('.premium-modal-content');
        if(content) {
            content.style.maxWidth = '600px';
            content.style.width = '100%';
            content.style.minHeight = '100vh';
            content.style.margin = '0 auto';
            content.style.border = 'none';
            content.style.borderRadius = '0';
            content.style.boxShadow = 'none';
            content.style.background = 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)';
            content.style.padding = '40px 20px';
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
