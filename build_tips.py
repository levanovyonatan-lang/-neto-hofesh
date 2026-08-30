import json
import re

months_hebrew = {
    "ינואר": "01",
    "פברואר": "02",
    "מרץ": "03",
    "אפריל": "04",
    "מאי": "05",
    "יוני": "06",
    "יולי": "07",
    "אוגוסט": "08",
    "ספטמבר": "09",
    "אוקטובר": "10",
    "נובמבר": "11",
    "דצמבר": "12"
}

# Merge all parts
all_text = ""
for part in ["raw_tips1.txt", "raw_tips2.txt", "raw_tips3.txt"]:
    with open(part, "r", encoding="utf-8") as f:
        all_text += f.read() + "\n"

# Split text by lines
lines = all_text.split('\n')

daily_tips = {}
current_date_key = None
current_tips = []

# Match <number> <optional chars like ב> <month>
date_regex = re.compile(r"^\s*(\d{1,2})\s+ב?([א-ת]+)(.*)")
tip_marker_regex = re.compile(r"^\s*(?:\.\d+|\* \.\d+|\*|●)\s*(.*)")

for line in lines:
    line = line.strip()
    if not line:
        continue
    
    # Check if it's a date line
    m = date_regex.match(line)
    if m:
        day = m.group(1).zfill(2)
        month_word = m.group(2)
        
        # Strip leading 'ב' if the remainder is a month
        if month_word not in months_hebrew and month_word.startswith("ב") and month_word[1:] in months_hebrew:
            month_word = month_word[1:]
            
        if month_word in months_hebrew:
            # Save previous day
            if current_date_key and current_tips:
                daily_tips[current_date_key] = current_tips
            
            month = months_hebrew[month_word]
            current_date_key = f"{month}-{day}"
            current_tips = []
            continue
    
    if current_date_key:
        tip_m = tip_marker_regex.match(line)
        if tip_m:
            tip_text = tip_m.group(1).strip()
            if tip_text:
                current_tips.append(tip_text)
        else:
            if not line.startswith("===") and "–" not in line and "-" not in line:
                # Append to last tip if it's a continuation
                if current_tips and not (line.startswith("]אופציה") or line.startswith("משימה יומית")):
                    current_tips[-1] += " " + line

if current_date_key and current_tips:
    daily_tips[current_date_key] = current_tips

final_json = {}

for date, tips in daily_tips.items():
    # Filter out empty or meta tips
    clean_tips = []
    for t in tips:
        # Check if the line has the markers inline (like in some formats)
        t = re.sub(r"\]אופציה לחטיבה ותיכון\[:?", "", t)
        t = re.sub(r"\]אופציה ליסודי\[:?", "", t)
        t = re.sub(r"\]אופציה לחטיבה ותיכון - .*\[:?", "", t)
        t = re.sub(r"\]אופציה ליסודי וחט\"ב - .*\[:?", "", t)
        t = t.replace("משימה יומית של החג:", "").replace("משימה יומית:", "")
        t = t.replace("טיפ החג:", "").strip()
        if t:
            clean_tips.append(t)
            
    is_holiday = False
    
    if len(clean_tips) >= 3 and ("משימה" in "".join(tips) or "טיפ החג" in "".join(tips)):
        is_holiday = True
    elif "משימה יומית של החג" in "".join(tips):
        is_holiday = True
    
    day_obj = {}
    if is_holiday:
        day_obj["type"] = "holiday"
        day_obj["missionHigh"] = clean_tips[0] if len(clean_tips) > 0 else ""
        day_obj["missionElem"] = clean_tips[1] if len(clean_tips) > 1 else ""
        day_obj["tip"] = clean_tips[2] if len(clean_tips) > 2 else ""
    else:
        day_obj["type"] = "regular"
        day_obj["tipHigh"] = clean_tips[0] if len(clean_tips) > 0 else ""
        day_obj["tipElem"] = clean_tips[1] if len(clean_tips) > 1 else clean_tips[0] if clean_tips else ""
        
    final_json[date] = day_obj

print(f"Parsed {len(final_json)} days.")

with open(r"C:\Users\user\נטו חופש\neto-hofesh\assets\js\daily-tips.js", "w", encoding="utf-8") as f:
    f.write("window.dailyTips = " + json.dumps(final_json, ensure_ascii=False, indent=2) + ";\n")

print("Created daily-tips.js!")
