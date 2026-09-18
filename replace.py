import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('placeholder="הכנס שם כאן..."', 'placeholder="הכנס שם כאן... (מומלץ עם אימוג\'י)"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced successfully")
