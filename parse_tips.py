import re
import json

HEB_MONTHS = {
    "בספטמבר": "09", "באוקטובר": "10", "בנובמבר": "11", "בדצמבר": "12",
    "בינואר": "01", "בפברואר": "02", "במרץ": "03", "באפריל": "04",
    "במאי": "05", "ביוני": "06", "ביולי": "07", "באוגוסט": "08"
}

with open('pypdf_text.txt', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('\n', ' ')
text = re.sub(r'\s+', ' ', text)

# Add newline before 📅 to easily iterate lines, but we can also just split by 📅
chunks = text.split('📅')

daily_tips = {}

for chunk in chunks[1:]:
    date_match = re.match(r'\s*(\d{1,2})\s+(ב[א-ת]+)', chunk)
    if not date_match:
        # Check if it's the August 31 tip at the end
        if '31 באוגוסט' in chunk or 'סיום החופש' in chunk:
            date_key = "08-30" 
            day_text = chunk
        else:
            continue
    else:
        day = date_match.group(1).zfill(2)
        month = HEB_MONTHS.get(date_match.group(2))
        if not month: continue
        date_key = f"{month}-{day}"
        day_text = chunk[date_match.end():]
        
    day_obj = {}
    
    # Let's find "1." and "2." 
    # The text usually goes like:
    # 1. Title ... * ]** לחטיבה ... * ]** ליסודי ... 2. Title ...
    # We will split by \b1\s*\. and \b2\s*\.
    
    # Also handle the end of summer tips which might not have 1. and 2. perfectly
    
    # First split by \b1\s*\.
    parts_1 = re.split(r'(?:^|\s)\*?\s*1\s*\.\s*', day_text, maxsplit=1)
    if len(parts_1) > 1:
        rest_after_1 = parts_1[1]
        parts_2 = re.split(r'(?:^|\s)\*?\s*2\s*\.\s*', rest_after_1, maxsplit=1)
        
        tip1_text = parts_2[0]
        tip2_text = parts_2[1] if len(parts_2) > 1 else ""
    else:
        # No '1.' found, maybe just bullet points?
        bullets = re.split(r'\*', day_text)
        bullets = [b.strip() for b in bullets if len(b.strip()) > 10]
        tip1_text = bullets[0] if len(bullets) > 0 else ""
        tip2_text = bullets[1] if len(bullets) > 1 else ""

    def parse_tip_block(block_text):
        res = {}
        # Remove headers like 🎯 **משימה יומית:** or 💡 **טיפ החופש הגדול:**
        clean_text = re.sub(r'🎯\s*\*\*משימה יומית:?\*\*', '', block_text)
        clean_text = re.sub(r'💡\s*\*\*טיפ החופש הגדול:?\*\*', '', clean_text)
        clean_text = re.sub(r'🎯\s*\*\*משימה יומית של החג:?\*\*', '', clean_text)
        clean_text = re.sub(r'🎯\s*\*\*משימה יומית של סיום החופש:?\*\*', '', clean_text)
        
        # Split by * or just look for the tags
        # Find 'לחטיבה ותיכון'
        high_match = re.search(r'\]\*\*\s*לחטיבה ותיכון(.*?)(\* \]|\Z|###)', clean_text)
        elem_match = re.search(r'\]\*\*\s*ליסודי(.*?)(\* \]|\Z|###)', clean_text)
        
        if not high_match and not elem_match:
            # Maybe it's ] לחטיבה ותיכון without **?
            high_match = re.search(r'\]\s*לחטיבה ותיכון(.*?)(\* \]|\Z|###)', clean_text)
            elem_match = re.search(r'\]\s*ליסודי(.*?)(\* \]|\Z|###)', clean_text)
            
        if not high_match and not elem_match:
            # Maybe it's ]** לעל-יסודי ?
            high_match = re.search(r'\]\*\*\s*לעל-יסודי(.*?)(\* \]|\Z|###)', clean_text)
            
        if high_match or elem_match:
            if high_match: res['High'] = high_match.group(1).strip()
            if elem_match: res['Elem'] = elem_match.group(1).strip()
        else:
            # No split, general tip
            res['Gen'] = clean_text.replace('###', '').strip()
        return res
        
    t1 = parse_tip_block(tip1_text)
    if 'Gen' in t1: day_obj['tip1'] = t1['Gen']
    if 'High' in t1: day_obj['tip1High'] = t1['High']
    if 'Elem' in t1: day_obj['tip1Elem'] = t1['Elem']
    
    t2 = parse_tip_block(tip2_text)
    if 'Gen' in t2: day_obj['tip2'] = t2['Gen']
    if 'High' in t2: day_obj['tip2High'] = t2['High']
    if 'Elem' in t2: day_obj['tip2Elem'] = t2['Elem']

    # Edge case: If it's August 31, let's keep it as is (which the script naturally parses as 08-31)

    # Clean up empty strings or artifacts like (סיום שנת הלימודים) etc.
    for k, v in list(day_obj.items()):
        v = re.sub(r'^\).*?\(', '', v).strip()
        v = re.sub(r'^[12]\s*\.\s*', '', v).strip()
        v = re.sub(r'^\*\s*', '', v).strip()
        if not v:
            del day_obj[k]
        else:
            day_obj[k] = v

    daily_tips[date_key] = day_obj

with open('assets/data/daily-tips.json', 'w', encoding='utf-8') as f:
    json.dump(daily_tips, f, ensure_ascii=False, indent=2)

print(f"Generated tips for {len(daily_tips)} days!")
