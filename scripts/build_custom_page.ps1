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
    #main-screen, #setup-screen, .holiday-switcher-wrapper, .settings-btn, #footer, #neto-splash, #fitness-banner, #jobs-banner {
        display: none !important;
    }
    html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #0f172a !important;
        min-height: 100% !important;
        overflow-x: hidden !important;
    }
    #custom-countdown-modal {
        display: flex !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: #0f172a !important;
        z-index: 10000 !important;
        align-items: center !important;
        justify-content: center !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
        padding: 16px 12px !important;
        box-sizing: border-box !important;
    }
    #custom-countdown-modal .premium-modal-content {
        margin: auto !important;
        max-width: 440px !important;
        width: 100% !important;
        border-radius: 22px !important;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.12) !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        background: linear-gradient(150deg, #1e293b 0%, #0f172a 100%) !important;
        padding: 22px 18px 18px !important;
        box-sizing: border-box !important;
    }
</style>
"@
$html = $html.Replace('</head>', $style + "`n</head>")

$script = @'
<script>
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.remove('splash-active');
    document.body.classList.add('premium-active');

    const splash = document.getElementById('neto-splash');
    if (splash) splash.remove();

    // Pre-populate date if empty
    const dateInput = document.getElementById('custom-date');
    if (dateInput && !dateInput.value) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
        const today = new Date();
        dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }

    const modal = document.getElementById('custom-countdown-modal');
    if(modal) {
        modal.style.display = 'flex';
        
        const closeBtn = modal.querySelector('.premium-modal-close');
        if(closeBtn) {
            closeBtn.style.display = 'block';
            closeBtn.onclick = function(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                closeCustomModal();
            };
        }
    }
});
</script>
</body>
'@

$html = $html.Replace('</body>', $script)
Set-Content custom\index.html $html -Encoding UTF8
Write-Host "Created custom/index.html"
