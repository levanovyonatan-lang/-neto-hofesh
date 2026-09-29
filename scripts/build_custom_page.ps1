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

    const originalSave = window.saveCustomCountdown;
    if (originalSave) {
        window.saveCustomCountdown = function() {
            originalSave();
            setTimeout(() => {
                window.location.href = '../index.html?modal=custom';
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
