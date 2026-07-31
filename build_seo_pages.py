# -*- coding: utf-8 -*-
import os
import re
import json
from datetime import datetime

HOLIDAYS = [
    {
        "slug": "hanukkah",
        "targetId": "hanukkah2026",
        "name": "חנוכה",
        "icon": "🕯️",
        "title": "כמה ימים נטו עד חופשת חנוכה 2026? ספירה לאחור אונליין | נטו חופש",
        "desc": "כמה ימי לימודים נטו נשארו לחופשת חנוכה? מחשבון ספירה לאחור לחופשת חנוכה בניכוי שבתות וחגים. בדקו מתי מתחיל חופש חנוכה לתלמידי יסודי, חטיבה ותיכון!",
        "keywords": "חופשת חנוכה, מתי חופש חנוכה, כמה ימים עד חנוכה, ספירה לאחור לחנוכה, ימי לימודים נטו חנוכה, לוח חופשות משרד החינוך, נטו חופש חנוכה",
        "date": "2026-12-04",
        "faqs": [
            ("מתי מתחילה חופשת חנוכה בבתי הספר?", "חופשת חנוכה בבתי הספר מתחילה ביום שישי, 4 בדצמבר 2026 ונמשכת עד 11 בדצמבר 2026."),
            ("כמה ימי לימוד נטו נשארו לחופשת חנוכה?", "מחשבון נטו חופש מחשב עבורכם את מספר ימי הלימוד המדויק שנשאר עד חנוכה, ללא שבתות וימי חופשה אחרים."),
            ("האם החופשה זהה ליסודי, לחטיבה ולתיכון?", "כן, חופשת חנוכה חלה באותם תאריכים בכל שכבות הגיל במערכת החינוך.")
        ]
    },
    {
        "slug": "taanit-esther",
        "targetId": "purim2027",
        "name": "תענית אסתר",
        "icon": "📜",
        "title": "כמה ימים נטו עד חופשת תענית אסתר ופורים 2027? ספירה לאחור | נטו חופש",
        "desc": "כמה ימי לימודים נטו נשארו עד חופשת תענית אסתר ופורים? מחשבון ספירה לאחור אונליין לתלמידי בתי הספר בניכוי שבתות וחגים. בדקו עכשיו!",
        "keywords": "תענית אסתר חופש, מתי תענית אסתר, חופשת פורים תענית אסתר, כמה ימים עד תענית אסתר, ספירה לאחור פורים, משרד החינוך",
        "date": "2027-03-22",
        "faqs": [
            ("האם יש לימודים בתענית אסתר?", "לפי לוח חופשות משרד החינוך, חופשת פורים מתחילה כבר מיום תענית אסתר."),
            ("מתי יוצאת תענית אסתר בשנת תשפ\"ז 2027?", "תענית אסתר חלה ביום שני, י\"ג באדר ב' תשפ\"ז (22 במרץ 2027)."),
            ("כמה ימי לימוד נטו נשארו עד לחופש?", "ניתן לראות את המספר המדויק במחשבון נטו חופש המפחית שבתות וחגים מראש.")
        ]
    },
    {
        "slug": "purim",
        "targetId": "purim2027",
        "name": "פורים",
        "icon": "🎭",
        "title": "כמה ימים נטו עד חופשת פורים 2027? ספירה לאחור לחופש פורים | נטו חופש",
        "desc": "כמה ימי לימודים נטו נשארו לחופשת פורים 2027? מחשבון ספירה לאחור לחופשת פורים בניכוי שבתות וחגים לתלמידי יסודי, חטיבה ותיכון. בדקו עכשיו!",
        "keywords": "חופשת פורים, מתי חופש פורים, כמה ימים עד פורים, חופשת פורים 2027, ספירה לאחור לפורים, ימי לימודים נטו פורים, לוח חופשות משרד החינוך, נטו חופש פורים",
        "date": "2027-03-22",
        "faqs": [
            ("מתי מתחילה חופשת פורים 2027?", "חופשת פורים תשפ\"ז מתחילה ביום שני, 22 במרץ 2027 ונמשכת עד יום רביעי, 24 במרץ 2027."),
            ("איך מחושבים ימי הלימודים הנטו לפורים?", "מחשבון נטו חופש סופר אך ורק את הימים שבהם באמת לומדים בבית הספר, ללא שבתות וחגים."),
            ("למי מיועד המחשבון?", "המחשבון מותאם לתלמידי בתי הספר היסודיים, חטיבות הביניים והתיכונים בישראל.")
        ]
    },
    {
        "slug": "pesach",
        "targetId": "pesach2027",
        "name": "פסח",
        "icon": "🍷",
        "title": "כמה ימים נטו עד חופשת פסח 2027? ספירה לאחור לחופש הגדול של האביב | נטו חופש",
        "desc": "כמה ימי לימודים נטו נשארו לחופשת פסח? מחשבון ספירה לאחור לחופשת פסח בניכוי שבתות וחגים. בדקו מתי יוצאים לחופש פסח בבתי הספר!",
        "keywords": "חופשת פסח, מתי חופש פסח, כמה ימים עד פסח, ספירה לאחור לפסח, ימי לימודים נטו פסח, חופשת אביב משרד החינוך, נטו חופש פסח",
        "date": "2027-04-14",
        "faqs": [
            ("מתי יוצאים לחופשת פסח בבתי הספר?", "חופשת פסח במערכת החינוך מתחילה ביום רביעי, 14 באפריל 2027 ונמשכת עד אסרו חג."),
            ("כמה זמן נמשכת חופשת פסח?", "חופשת פסח היא הארוכה ביותר במהלך שנת הלימודים ונמשכת מעל שבועיים."),
            ("כמה ימי לימודים נטו נשארו עד לחופש פסח?", "מחשבון נטו חופש מציג ספירה מדויקת ללא ימי שישי-שבת וחגים קודמים.")
        ]
    },
    {
        "slug": "asru-chag",
        "targetId": "pesach2027",
        "name": "אסרו חג פסח",
        "icon": "🌸",
        "title": "מתי חוזרים ללימודים אחרי אסרו חג פסח 2027? ספירה לאחור | נטו חופש",
        "desc": "כמה ימים נשארו לחופשת פסח ואסרו חג? מחשבון ימי לימוד נטו לתלמידים בניכוי שבתות וחגים. בדקו עכשיו בנטו חופש!",
        "keywords": "אסרו חג פסח, מתי חוזרים ללימודים אחרי פסח, חופשת פסח אסרו חג, ספירה לאחור, לוח חופשות משרד החינוך",
        "date": "2027-04-29",
        "faqs": [
            ("האם אסרו חג פסח הוא יום חופש בבתי הספר?", "כן, אסרו חג פסח נכלל בתוך חופשת פסח המלאה של משרד החינוך."),
            ("מתי חוזרים לספסל הלימודים?", "הלימודים מתחדשים מיד לאחר סיום אסרו חג פסח."),
            ("איך בודקים כמה ימי לימוד נשארו?", "מחשבון נטו חופש מתעדכן בזמן אמת ומראה כמה ימים נטו נשארו ללמוד.")
        ]
    },
    {
        "slug": "atzmaut",
        "targetId": "atzmaut2027",
        "name": "יום העצמאות",
        "icon": "🇮🇱",
        "title": "כמה ימים נטו עד חופשת יום העצמאות 2027? ספירה לאחור | נטו חופש",
        "desc": "כמה ימי לימודים נטו נשארו עד לחופש יום העצמאות? בדקו את הספירה לאחור לחופשת יום העצמאות בבתי הספר בניכוי שבתות וחגים!",
        "keywords": "חופשת יום העצמאות, מתי יום העצמאות, חופש יום העצמאות בתי ספר, כמה ימים עד יום העצמאות, ספירה לאחור ליום העצמאות",
        "date": "2027-05-12",
        "faqs": [
            ("מתי חופשת יום העצמאות 2027 בבתי הספר?", "חופשת יום העצמאות חלה ביום רביעי, 12 במאי 2027."),
            ("האם יש לימודים ביום הזיכרון?", "ביום הזיכרון הלימודים מתקיימים במתכונת מקוצרת ומוקדשת לטקסים."),
            ("כמה ימי לימוד נטו נשארו עד יום העצמאות?", "המחשבון מציג בדיוק כמה ימי לימודים פעילים נותרו עד לחג.")
        ]
    },
    {
        "slug": "lag-baomer",
        "targetId": "lagbaomer",
        "name": "ל\"ג בעומר",
        "icon": "🔥",
        "title": "כמה ימים נטו עד חופשת ל''ג בעומר 2027? ספירה לאחור | נטו חופש",
        "desc": "כמה ימי לימודים נטו נשארו עד ל''ג בעומר? מחשבון ספירה לאחור לחופש ל''ג בעומר בבתי הספר בניכוי שבתות וחגים.",
        "keywords": "חופשת ל''ג בעומר, מתי חופש ל''ג בעומר, כמה ימים עד ל''ג בעומר, ספירה לאחור ל''ג בעומר, לוח חופשות משרד החינוך",
        "date": "2027-05-25",
        "faqs": [
            ("האם יש חופש בל\"ג בעומר במערכת החינוך?", "כן, ל\"ג בעומר הוא יום חופשה רשמי במערכת החינוך בישראל."),
            ("מתי חל ל\"ג בעומר בשנת 2027?", "ל\"ג בעומר תשפ\"ז חל ביום שלישי, 25 במאי 2027."),
            ("איך משתפים את הספירה לאחור עם הכיתה?", "בלחיצה על כפתור השיתוף בוואטסאפ באתר תוכלו לשלוח ישירות את מספר הימים הנטו שנשאר.")
        ]
    },
    {
        "slug": "shavuot",
        "targetId": "shavuot2027",
        "name": "שבועות",
        "icon": "🧀",
        "title": "כמה ימים נטו עד חופשת שבועות 2027? ספירה לאחור לחופש שבועות | נטו חופש",
        "desc": "כמה ימי לימודים נטו נשארו לחופשת שבועות? מחשבון ספירה לאחור לחופשת שבועות לתלמידי יסודי, חטיבה ותיכון בניכוי שבתות וחגים!",
        "keywords": "חופשת שבועות, מתי חופש שבועות, כמה ימים עד שבועות, ספירה לאחור לשבועות, ימי לימודים נטו שבועות, לוח חופשות תשפ''ז",
        "date": "2027-06-11",
        "faqs": [
            ("מתי מתחילה חופשת שבועות 2027?", "חופשת שבועות מתחילה ביום שישי, 11 ביוני 2027 ונמשכת עד אסרו חג."),
            ("כמה ימי לימוד נטו נשארו עד שבועות?", "מחשבון נטו חופש מראה את הימים הנטו שנותרו ללמוד, לא כולל שבתות."),
            ("האם חופשת שבועות היא החופשה האחרונה לפני החופש הגדול?", "כן, זו החופשה הרשמית האחרונה לפני היציאה לחופש הגדול של הקיץ.")
        ]
    },
    {
        "slug": "summer-high",
        "targetId": "summerHigh2027",
        "name": "החופש הגדול (תיכון וחטיבה)",
        "icon": "🏖️",
        "title": "כמה ימים נטו עד החופש הגדול לתיכון וחטיבה? ספירה לאחור 2027 | נטו חופש",
        "desc": "כמה ימי לימודים נטו נשארו עד החופש הגדול לתלמידי תיכון וחטיבת ביניים (21 ביוני)? מחשבון ספירה לאחור אמיתי בניכוי שבתות וחגים!",
        "keywords": "מתי החופש הגדול בתיכון, מתי החופש הגדול בחטיבה, ספירה לאחור לחופש הגדול 2027, כמה ימים עד החופש הגדול תיכון, 20 ביוני חופש גדול, נטו חופש",
        "date": "2027-06-21",
        "faqs": [
            ("מתי יוצאים לחופש הגדול בתיכון ובחטיבת הביניים?", "תלמידי החטיבות והתיכונים יוצאים רשמית לחופש הגדול ב-21 ביוני 2027."),
            ("כמה ימי לימודים נטו נשארו עד לחופש הגדול בתיכון?", "המחשבון מנכה את כל ימי השבת, החגים והחופשות שבדרך ומראה ספירה נטו מדוייקת."),
            ("האם המחשבון לוקח בחשבון את חופשת פסח ושבועות?", "בוודאי! המחשבון סופר אך ורק ימי לימוד פעילים שבהם מגיעים לבית הספר.")
        ]
    },
    {
        "slug": "summer",
        "targetId": "summerElem2027",
        "name": "החופש הגדול (יסודי וגנים)",
        "icon": "☀️",
        "title": "כמה ימים נטו עד החופש הגדול ליסודי וגנים? ספירה לאחור 2027 | נטו חופש",
        "desc": "כמה ימי לימודים נטו נשארו עד החופש הגדול לתלמידי יסודי וגני ילדים (1 ביולי)? מחשבון ספירה לאחור אמיתי בניכוי שבתות, שישי וחגים!",
        "keywords": "מתי החופש הגדול ביסודי, מתי החופש הגדול בגנים, ספירה לאחור לחופש הגדול יסודי 2027, כמה ימים עד החופש הגדול, 1 ביולי חופש גדול, נטו חופש יסודי",
        "date": "2027-07-01",
        "faqs": [
            ("מתי מתחיל החופש הגדול בבתי הספר היסודיים ובגנים?", "תלמידי היסודי וגני הילדים יוצאים לחופש הגדול ב-1 ביולי 2027."),
            ("מה ההבדל בספירה בין יסודי לתיכון?", "תלמידי יסודי לומדים עד סוף יוני, בעוד שתלמידי תיכון וחטיבה מסיימים ב-20 ביוני."),
            ("איך משתפים את הספירה לחופש הגדול?", "בלחיצה על כפתור 'שתפו לכיתה' ניתן לשלוח את מספר ימי הלימוד הנטו לחברים בוואטסאפ.")
        ]
    }
]

def generate_seo_page(base_html, holiday):
    html = base_html
    
    # 1. Update Title & Meta
    html = re.sub(r'<title>.*?</title>', f"<title>{holiday['title']}</title>", html, flags=re.DOTALL)
    html = re.sub(r'<meta name="description"\s+content=".*?">', f'<meta name="description"\n        content="{holiday["desc"]}">', html, flags=re.DOTALL)
    html = re.sub(r'<meta name="keywords"\s+content=".*?">', f'<meta name="keywords"\n        content="{holiday["keywords"]}">', html, flags=re.DOTALL)
    html = re.sub(r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="https://www.neto-hofesh.co.il/{holiday["slug"]}/">', html)
    
    # 2. Add OpenGraph, Twitter Cards & window.NETO_ACTIVE_HOLIDAY in <head>
    og_and_script = f'''
    <!-- Open Graph & Social Cards -->
    <meta property="og:title" content="{holiday['title']}">
    <meta property="og:description" content="{holiday['desc']}">
    <meta property="og:url" content="https://www.neto-hofesh.co.il/{holiday['slug']}/">
    <meta property="og:image" content="https://www.neto-hofesh.co.il/icon-neto-sunglasses-white.png">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="he_IL">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{holiday['title']}">
    <meta name="twitter:description" content="{holiday['desc']}">
    <meta name="twitter:image" content="https://www.neto-hofesh.co.il/icon-neto-sunglasses-white.png">

    <!-- Preselect Active Holiday in JS -->
    <script>
        window.NETO_ACTIVE_HOLIDAY = "{holiday['targetId']}";
        window.NETO_ACTIVE_HOLIDAY_SLUG = "{holiday['slug']}";
        window.NETO_HOLIDAY_NAME = "{holiday['name']}";
    </script>
'''
    html = html.replace('</head>', og_and_script + '\n</head>')
    
    # 3. Build JSON-LD FAQPage Schema & Event Schema
    faq_items = []
    for q, a in holiday['faqs']:
        faq_items.append({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": a
            }
        })
    
    json_ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "FAQPage",
                "mainEntity": faq_items
            },
            {
                "@type": "Event",
                "name": f"חופשת {holiday['name']} בבתי הספר בישראל",
                "startDate": holiday['date'],
                "location": {
                    "@type": "Place",
                    "name": "מערכת החינוך בישראל",
                    "address": {
                        "@type": "PostalAddress",
                        "addressCountry": "IL"
                    }
                },
                "description": holiday['desc']
            }
        ]
    }
    
    schema_script = f'''
    <!-- JSON-LD FAQPage & Event Schema for Rich Snippets -->
    <script type="application/ld+json">
    {json.dumps(json_ld, ensure_ascii=False, indent=4)}
    </script>
'''
    html = html.replace('</head>', schema_script + '\n</head>')
    
    # 4. Convert relative asset URLs to ../ so they work inside /slug/index.html
    html = html.replace('href="official-sun-neto-transparent.png', 'href="../official-sun-neto-transparent.png')
    html = html.replace('href="icon-neto-sunglasses-white.png', 'href="../icon-neto-sunglasses-white.png')
    html = html.replace('href="manifest.json', 'href="../manifest.json')
    html = html.replace('href="assets/', 'href="../assets/')
    html = html.replace('src="assets/', 'src="../assets/')
    html = html.replace('src="tips.js"', 'src="../tips.js"')
    html = html.replace('src="avigail-camp.html"', 'src="../avigail-camp.html"')
    
    return html

def build_all():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(base_dir, "index.html")
    
    with open(index_path, "r", encoding="utf-8") as f:
        base_html = f.read()
        
    print("Building 10 SEO Holiday Landing Pages...")
    for holiday in HOLIDAYS:
        slug_dir = os.path.join(base_dir, holiday["slug"])
        os.makedirs(slug_dir, exist_ok=True)
        
        page_html = generate_seo_page(base_html, holiday)
        page_path = os.path.join(slug_dir, "index.html")
        with open(page_path, "w", encoding="utf-8") as f:
            f.write(page_html)
        print(f" -> Created: /{holiday['slug']}/index.html ({holiday['name']})")
        
    # Generate sitemap.xml
    sitemap_path = os.path.join(base_dir, "sitemap.xml")
    today = datetime.now().strftime("%Y-%m-%d")
    
    xml_urls = [
        f'''    <url>
        <loc>https://www.neto-hofesh.co.il/</loc>
        <lastmod>{today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>'''
    ]
    
    for holiday in HOLIDAYS:
        xml_urls.append(f'''    <url>
        <loc>https://www.neto-hofesh.co.il/{holiday['slug']}/</loc>
        <lastmod>{today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>''')
        
    sitemap_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(xml_urls)}
</urlset>
'''
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write(sitemap_content)
    print(" -> Created: /sitemap.xml (11 URLs)")
    print("SEO Pages & Sitemap build completed successfully!")

if __name__ == "__main__":
    build_all()
