import re

def fix_line(line):
    line = line.strip()
    # Find emojis at the start of the reversed line (which were at the end of the original line)
    # Actually, in extracted_tips.txt, emojis are often at the start or end.
    # Let's just reverse the whole string and see what it looks like.
    return line[::-1]

with open("extracted_tips.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(20):
    print(fix_line(lines[i]))
