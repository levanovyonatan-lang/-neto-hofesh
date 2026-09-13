$content = Get-Content -Path .\index.html -Raw -Encoding UTF8
$content = $content.Replace('"text": "התאריכים מבוססים על לוח החופשות לשנת תשפז שפורסם באתר mako, ומומלץ לבדוק גם הודעות של בית הספר."', '"text": "התאריכים מבוססים על לוחות החופשות שפורסמו, ומומלץ לבדוק גם הודעות של בית הספר."')
$content = $content.Replace('<p style="font-size:14px;line-height:1.7">מקור התאריכים: <a href="https://www.mako.co.il/home-family-kids/Article-df5ebe37893f281026.htm" target="_blank" rel="noopener">לוח החופשות של mako לשנת תשפ״ז</a>. נבדק ב-13.9.2026. נטו חופש הוא אתר עצמאי ואינו אתר משרד החינוך. ייתכנו הבדלים בין מסגרות; יש לבדוק גם הודעות מבית הספר.</p>', '<p style="font-size:14px;line-height:1.7">נטו חופש הוא אתר עצמאי ואינו אתר משרד החינוך. ייתכנו הבדלים בין מסגרות; יש לבדוק גם הודעות מבית הספר.</p>')
Set-Content -Path .\index.html -Value $content -Encoding UTF8 -NoNewline
Write-Host "Done!"
