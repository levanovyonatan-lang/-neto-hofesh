import json

with open('holidays_seo.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_titles = {
    'hanukkah': 'מתי חופש חנוכה 2026? לוח חופשות משרד החינוך תשפ\"ז | נטו חופש',
    'taanit-esther': 'מתי חופש תענית אסתר 2027? האם יש לימודים? תשפ\"ז | נטו חופש',
    'purim': 'חופשת פורים 2027: מתי מתחיל החופש? לוח חופשות משרד החינוך | נטו חופש',
    'pesach': 'מתי יוצאים לחופשת פסח 2027? תאריכי חופש תשפ\"ז משרד החינוך | נטו חופש',
    'asru-chag': 'אסרו חג פסח 2027 - מתי חוזרים ללימודים? משרד החינוך | נטו חופש',
    'atzmaut': 'מתי חופש יום העצמאות 2027 בבתי הספר? לוח משרד החינוך | נטו חופש',
    'lag-baomer': 'חופשת ל\"ג בעומר 2027: מתי המדורות ומתי חופש בבתי הספר? | נטו חופש',
    'shavuot': 'מתי חופש שבועות 2027? לוח חופשות תשפ\"ז לתלמידים | נטו חופש',
    'summer': 'מתי מסתיימת שנת הלימודים 2027? תאריכי החופש הגדול יסודי | נטו חופש',
    'summer-high': 'החופש הגדול 2027 בתיכונים וחטיבות: מתי יוצאים לחופש? | נטו חופש'
}

for holiday in data['holidays']:
    slug = holiday['slug']
    if slug in new_titles:
        holiday['title'] = new_titles[slug]

with open('holidays_seo.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print('Titles updated!')
