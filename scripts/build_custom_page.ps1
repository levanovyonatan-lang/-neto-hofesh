$ErrorActionPreference = "Stop"
$html = Get-Content index.html -Raw -Encoding UTF8
$html = $html.Replace('href="official-sun-neto-transparent.png', 'href="../official-sun-neto-transparent.png')
$html = $html.Replace('src="official-sun-neto-transparent.png', 'src="../official-sun-neto-transparent.png')
$html = $html.Replace('href="icon-neto-sunglasses-white.png', 'href="../icon-neto-sunglasses-white.png')
$html = $html.Replace('src="icon-neto-sunglasses-white.png', 'src="../icon-neto-sunglasses-white.png')
$html = $html.Replace('href="manifest.json', 'href="../manifest.json')
$html = $html.Replace('href="assets/', 'href="../assets/')
$html = $html.Replace('src="assets/', 'src="../assets/')
$html = $html.Replace('src="tips.js', 'src="../tips.js')
$html = $html.Replace('href="avigail-camp.html"', 'href="../avigail-camp.html"')
$html = $html.Replace('href="fitness.html"', 'href="../fitness.html"')
$html = $html.Replace('id="custom-save-btn" href="index.html"', 'id="custom-save-btn" href="../index.html"')

# fix absolute links
$html = [System.Text.RegularExpressions.Regex]::Replace($html, 'href="(?:\.\./)?(hanukkah|taanit-esther|purim|pesach|asru-chag|atzmaut|lag-baomer|shavuot|summer-high|summer)/"', 'href="../$1/"')

$style = @"
<style>
    #main-screen, #setup-screen, .holiday-switcher-wrapper, .settings-btn, #footer {
        display: none !important;
    }
    body {
        padding: 0 !important;
        margin: 0 !important;
        background: #0f172a !important;
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
        modal.style.display = 'block';
        modal.style.width = '100%';
        modal.style.minHeight = '100vh';
        modal.style.position = 'relative';
        modal.style.background = '#0f172a';
        modal.style.zIndex = '1';
        
        const closeBtn = modal.querySelector('.premium-modal-close');
        if(closeBtn) {
            closeBtn.style.display = 'block';
            closeBtn.onclick = function() {
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = '../index.html';
                }
            };
        }
        
        const content = modal.querySelector('.premium-modal-content');
        if(content) {
            content.style.maxWidth = '100%';
            content.style.width = '100%';
            content.style.minHeight = '100vh';
            content.style.margin = '0';
            content.style.border = 'none';
            content.style.borderRadius = '0';
            content.style.boxShadow = 'none';
            content.style.background = 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)';
            content.style.padding = '22px 16px';
        }
    }


});
</script>
</body>
"@

$html = $html.Replace('</body>', $script)
Set-Content custom\index.html $html -Encoding UTF8
Write-Host "Created custom/index.html"
