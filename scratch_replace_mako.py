import io
import sys

file_path = r'c:\Users\user\נטו חופש\neto-hofesh\index.html'
try:
    with io.open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
except UnicodeDecodeError:
    with io.open(file_path, 'r', encoding='windows-1255') as f:
        content = f.read()

content = content.replace(
    '"text": "התאריכים מבוססים על לוח החופשות לשנת תשפז שפורסם באתר mako, ומומלץ לבדוק גם הודעות של בית הספר."',
    '"text": "התאריכים מבוססים על לוחות החופשות שפורסמו, ומומלץ לבדוק גם הודעות של בית הספר."'
)
content = content.replace(
    '<p style="font-size:14px;line-height:1.7">מקור התאריכים: <a href="https://www.mako.co.il/home-family-kids/Article-df5ebe37893f281026.htm" target="_blank" rel="noopener">לוח החופשות של mako לשנת תשפ״ז</a>. נבדק ב-13.9.2026. נטו חופש הוא אתר עצמאי ואינו אתר משרד החינוך. ייתכנו הבדלים בין מסגרות; יש לבדוק גם הודעות מבית הספר.</p>',
    '<p style="font-size:14px;line-height:1.7">נטו חופש הוא אתר עצמאי ואינו אתר משרד החינוך. ייתכנו הבדלים בין מסגרות; יש לבדוק גם הודעות מבית הספר.</p>'
)

with io.open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
