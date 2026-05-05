import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove user-scalable=no
content = content.replace(', maximum-scale=1.0, user-scalable=no', '')

# Remove accessibility button and menu (Regex)
pattern = re.compile(r'<!-- כפתור ותפריט נגישות \(Accessibility Widget\) -->.*?</div>\s*<!-- חלונית משפטית \(אוניברסלית לכל הדפים\) -->', re.DOTALL)
content = re.sub(pattern, '<!-- חלונית משפטית (אוניברסלית לכל הדפים) -->', content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("index.html cleaned up.")
