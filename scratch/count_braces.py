import re
with open('c:/Users/user/נטו חופש/neto-hofesh/assets/js/games/dino-school.js', 'r', encoding='utf-8') as f:
    text = f.read()

# basic removal of strings to avoid counting braces inside them
text = re.sub(r'(["\'])(?:(?=(\\?))\2.)*?\1', '', text)
text = re.sub(r'//.*', '', text)
text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
text = re.sub(r'`[^`]*`', '', text, flags=re.DOTALL)

open_c = text.count('{')
close_c = text.count('}')
print(f"Open: {open_c}, Close: {close_c}")
