$ErrorActionPreference = "Stop"
$html = Get-Content index.html -Raw -Encoding UTF8
$html = $html.Replace('href="official-sun-neto-transparent.png', 'href="../official-sun-neto-transparent.png')
$html = $html.Replace('src="official-sun-neto-transparent.png', 'src="../official-sun-neto-transparent.png')
$html = $html.Replace('href="icon-neto-sunglasses-white.png', 'href="../icon-neto-sunglasses-white.png')
$html = $html.Replace('src="icon-neto-sunglasses-white.png', 'src="../icon-neto-sunglasses-white.png')
$html = $html.Replace('href="manifest.json', 'href="../manifest.json')
$html = $html.Replace('href="assets/', 'href="../assets/')
$html = $html.Replace('src="assets/', 'src="../assets/')
$html = $html.Replace('src="tips.js"', 'src="../tips.js"')
$html = $html.Replace('href="avigail-camp.html"', 'href="../avigail-camp.html"')
$html = $html.Replace('href="fitness.html"', 'href="../fitness.html"')

# fix absolute links
$html = [System.Text.RegularExpressions.Regex]::Replace($html, 'href="(?:\.\./)?(hanukkah|taanit-esther|purim|pesach|asru-chag|atzmaut|lag-baomer|shavuot|summer-high|summer)/"', 'href="../$1/"')

$style = @"
<style>
    #main-screen, #setup-screen, .holiday-switcher-wrapper, .settings-btn, #footer {
        display: none !important;
    }
</style>
"@
$html = $html.Replace('</head>', $style + "`n</head>")

$script = @"
<script>
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('premium-active');


    const modal = document.getElementById('custom-countdown-modal');
    if(modal) {
        modal.style.display = 'flex';
        modal.style.minHeight = '100vh';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.position = 'relative';
        modal.style.background = 'var(--bg-gradient)';
        modal.style.zIndex = '1';
        
        const closeBtn = modal.querySelector('.premium-modal-close');
        if(closeBtn) closeBtn.style.display = 'none';
        
        const content = modal.querySelector('.premium-modal-content');
        if(content) {
            content.style.maxWidth = '600px';
            content.style.width = '90%';
            content.style.margin = '20px auto';
        }
    }

    const originalSave = window.saveCustomCountdown;
    if (originalSave) {
        window.saveCustomCountdown = function() {
            if (originalSave() === false) return;
            setTimeout(() => {
                let intentId = '';
                try {
                    const saved = JSON.parse(localStorage.getItem('neto_customCountdowns'));
                    if(saved && saved.length > 0) {
                        intentId = saved[saved.length - 1].id;
                    }
                } catch(e) {}
                
                let search = window.location.search;
                if(intentId) {
                    search = search ? search + '&targetIntent=' + intentId : '?targetIntent=' + intentId;
                }
                window.location.href = '../index.html' + search;
            }, 100);
        };
    }
});
</script>
</body>
"@

$html = $html.Replace('</body>', $script)
Set-Content custom\index.html $html -Encoding UTF8
Write-Host "Created custom/index.html"
