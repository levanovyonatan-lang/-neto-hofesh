import os

file_path = r'c:\Users\user\נטו חופש\neto-hofesh\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove boss-pinata script
content = content.replace('<script src="assets/js/games/boss-pinata.js" defer></script>', '')

# 2. Update Safari instructions
old_step = '<span>בתחתית המסך (בדפדפן ספארי), לחצו על <b>כפתור השיתוף</b> (מרובע עם חץ <span style="font-size:calc(18px * var(--text-scale, 1));" aria-hidden="true">⍐</span>).</span>'
new_step = '<span>בתחתית המסך (בדפדפן ספארי), לחצו על <b>שלוש הנקודות</b> ולאחר מכן על <b>כפתור השיתוף</b> (מרובע עם חץ <span style="font-size:calc(18px * var(--text-scale, 1));" aria-hidden="true">⍐</span>).</span>'

if old_step in content:
    content = content.replace(old_step, new_step)
    print("Safari step updated successfully.")
else:
    print("Could not find Safari step. Trying alternative match.")
    # Try a more flexible match if needed
    import re
    pattern = re.escape('בתחתית המסך (בדפדפן ספארי), לחצו על ') + '<b>' + re.escape('כפתור השיתוף') + '</b>'
    content = re.sub(pattern, 'בתחתית המסך (בדפדפן ספארי), לחצו על <b>שלוש הנקודות</b> ולאחר מכן על <b>כפתור השיתוף</b>', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done.")
