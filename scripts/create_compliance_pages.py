import os

privacy_html = """<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>מדיניות פרטיות | נטו חופש</title>
    <link rel="icon" type="image/png" href="official-sun-neto-transparent.png?v=288">
    <link rel="apple-touch-icon" href="icon-neto-sunglasses-white.png?v=288">
    <meta name="theme-color" content="#ffffff">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Rubik', sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 0; }
        .page-container { max-width: 800px; margin: 40px auto; padding: 30px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); text-align: right; line-height: 1.6; }
        h1 { color: #0f172a; text-align: center; margin-bottom: 30px; }
        h2 { color: #3b82f6; margin-top: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        p, ul { color: #475569; font-size: 1.05rem; }
        .back-btn { display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 10px; font-weight: bold; margin-bottom: 20px; transition: 0.3s; }
        .back-btn:hover { background: #2563eb; }
    </style>
</head>
<body>
    <div class="page-container">
        <a href="/" class="back-btn">← חזרה לעמוד הראשי</a>
        <h1>מדיניות פרטיות</h1>
        <p>תאריך עדכון אחרון: אוגוסט 2026</p>
        
        <h2>1. מבוא</h2>
        <p>ברוכים הבאים לאתר "נטו חופש". הפרטיות שלכם חשובה לנו. מדיניות זו מסבירה איזה מידע אנחנו אוספים, כיצד אנו משתמשים בו, ואיך אתם יכולים לשלוט בו.</p>
        
        <h2>2. איסוף מידע ושימוש בקובצי Cookie</h2>
        <p>האתר שלנו עושה שימוש בקובצי עוגיות (Cookies) ובטכנולוגיות מעקב דומות כדי לשפר את חווית הגלישה, לנתח את התנועה באתר, ולהתאים אישית תוכן ופרסומות.</p>
        
        <h2>3. פרסומות של צד שלישי (Google AdSense)</h2>
        <p>אנו משתמשים בחברות פרסום של צד שלישי, כגון Google, כדי להציג מודעות כאשר אתם מבקרים באתר שלנו.</p>
        <ul>
            <li>ספקי צד שלישי, כולל Google, משתמשים בקובצי Cookie כדי להציג מודעות בהתבסס על הביקורים הקודמים של המשתמש באתר שלנו או באתרים אחרים.</li>
            <li>השימוש של גוגל בקובצי Cookie של פרסום (כגון DoubleClick) מאפשר לה ולשותפיה להציג מודעות למשתמשים בהתבסס על הביקור שלהם באתרים שלנו ו/או באתרים אחרים באינטרנט.</li>
            <li>משתמשים יכולים לבטל את הסכמתם לשימוש בקובצי Cookie של פרסום מותאם אישית על ידי ביקור ב<a href="https://myadcenter.google.com/" target="_blank">הגדרות המודעות של גוגל</a>. (לחלופין, באפשרותכם לבקר בכתובת <a href="https://www.aboutads.info/choices/" target="_blank">www.aboutads.info</a> כדי לבטל את הסכמתכם לשימוש של ספקי צד שלישי בקובצי Cookie עבור פרסום מותאם אישית).</li>
        </ul>
        
        <h2>4. המידע הנשמר בחשבון המשתמש</h2>
        <p>אם בחרתם להירשם לאתר באמצעות Google (Firebase Auth), אנו שומרים את כתובת הדוא"ל שלכם, שמכם, והיעדים האישיים שיצרתם. המידע נשמר באופן מאובטח ואינו מועבר לשום גורם צד שלישי למטרות שיווק.</p>
        
        <h2>5. אבטחת מידע</h2>
        <p>אנו נוקטים באמצעי אבטחה סבירים כדי להגן על המידע האישי שלכם, אך זכרו ששום שידור נתונים באינטרנט אינו מאובטח ב-100%.</p>
        
        <h2>6. יצירת קשר</h2>
        <p>אם יש לכם שאלות לגבי מדיניות הפרטיות שלנו, אתם מוזמנים לפנות אלינו בעמוד "צור קשר".</p>
    </div>
</body>
</html>"""

contact_html = """<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>צור קשר | נטו חופש</title>
    <link rel="icon" type="image/png" href="official-sun-neto-transparent.png?v=288">
    <link rel="apple-touch-icon" href="icon-neto-sunglasses-white.png?v=288">
    <meta name="theme-color" content="#ffffff">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Rubik', sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 0; }
        .page-container { max-width: 600px; margin: 40px auto; padding: 30px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); text-align: center; line-height: 1.6; }
        h1 { color: #0f172a; margin-bottom: 20px; }
        p { color: #475569; font-size: 1.1rem; }
        .back-btn { display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 10px; font-weight: bold; margin-bottom: 20px; transition: 0.3s; }
        .back-btn:hover { background: #2563eb; }
        .email-link { display: inline-block; font-size: 1.3rem; font-weight: bold; color: #10b981; text-decoration: none; margin-top: 20px; padding: 15px 30px; border: 2px solid #10b981; border-radius: 15px; transition: 0.3s; }
        .email-link:hover { background: #10b981; color: white; }
    </style>
</head>
<body>
    <div class="page-container">
        <a href="/" class="back-btn" style="float: right;">← חזרה לעמוד הראשי</a>
        <div style="clear: both;"></div>
        <h1>צור קשר 📬</h1>
        <p>נשמח לשמוע מכם! להצעות, בקשות, דיווח על תקלות או סתם לומר שלום, ניתן לשלוח לנו אימייל לכתובת:</p>
        <a href="mailto:levanov.yonatan@gmail.com" class="email-link">levanov.yonatan@gmail.com</a>
    </div>
</body>
</html>"""

about_html = """<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>אודות | נטו חופש</title>
    <link rel="icon" type="image/png" href="official-sun-neto-transparent.png?v=288">
    <link rel="apple-touch-icon" href="icon-neto-sunglasses-white.png?v=288">
    <meta name="theme-color" content="#ffffff">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Rubik', sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 0; }
        .page-container { max-width: 800px; margin: 40px auto; padding: 30px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); text-align: right; line-height: 1.6; }
        h1 { color: #0f172a; text-align: center; margin-bottom: 30px; }
        p { color: #475569; font-size: 1.1rem; }
        .back-btn { display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 10px; font-weight: bold; margin-bottom: 20px; transition: 0.3s; }
        .back-btn:hover { background: #2563eb; }
    </style>
</head>
<body>
    <div class="page-container">
        <a href="/" class="back-btn">← חזרה לעמוד הראשי</a>
        <h1>אודות נטו חופש 🏖️</h1>
        <p>ברוכים הבאים ל"נטו חופש" - האתר המוביל לספירה לאחור לחופשות של תלמידי ישראל!</p>
        <p>הקמנו את האתר במטרה אחת פשוטה: לעזור לכם, התלמידים, לדעת בדיוק מתי מגיע החופש הבא, עד לרמת השנייה. האתר מספק ספירה לאחור מעוצבת, מדויקת וכיפית לכל חגי ישראל ולחופשות משרד החינוך.</p>
        <p>בנוסף לטיימרים המובנים, האתר מאפשר לכם לפתוח אזור אישי ולהוסיף ספירות לאחור משלכם - לטיסה לחו"ל, רישיון, תאריך גיוס או סתם אירוע שאתם מחכים לו.</p>
        <p>מאחלים לכם המון חופש נעים!</p>
    </div>
</body>
</html>"""

with open('privacy.html', 'w', encoding='utf-8') as f:
    f.write(privacy_html)
with open('contact.html', 'w', encoding='utf-8') as f:
    f.write(contact_html)
with open('about.html', 'w', encoding='utf-8') as f:
    f.write(about_html)

print("Pages created successfully.")
