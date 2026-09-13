import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'<div style="text-align: right; margin-bottom: 25px;">.*?<input type="hidden" id="custom-emoji" value="[^"]+">\s*</div>', re.DOTALL)
content = pattern.sub('<input type="hidden" id="custom-emoji" value="🎯">', content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
