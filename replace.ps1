$path = "assets\js\app.js"
$content = Get-Content $path -Raw
$newFunction = @"
function animateAbsoluteTimer(diff) {
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
}
"@
$content = $content -replace '(?s)function animateAbsoluteTimer\(diff\) \{.*?\r?\n\}', $newFunction
Set-Content -Path $path -Value $content -Encoding UTF8
