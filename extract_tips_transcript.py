import json
import re

def extract_from_transcript():
    transcript_path = r"C:\Users\user\.gemini\antigravity-ide\brain\b7e80f6d-d248-4a19-b0ab-28d8edc70861\.system_generated\logs\transcript_full.jsonl"
    
    full_text = ""
    with open(transcript_path, 'r', encoding='utf-8') as f:
        for line in f:
            if '==Start of OCR for page 1==' in line:
                try:
                    data = json.loads(line)
                    if 'tool_calls' in data:
                        for tc in data['tool_calls']:
                            if tc.get('name') == 'view_file' and '==Start of OCR' in tc.get('output', ''):
                                full_text = tc['output']
                                break
                except Exception as e:
                    pass

    if not full_text:
        print("Could not find OCR text in transcript.")
        return

    months = {
        "ספטמבר": "09", "אוקטובר": "10", "נובמבר": "11", "דצמבר": "12",
        "בינואר": "01", "ינואר": "01", "בפברואר": "02", "פברואר": "02",
        "במרץ": "03", "מרץ": "03", "מרס": "03", "באפריל": "04", "אפריל": "04",
        "במאי": "05", "מאי": "05", "ביוני": "06", "יוני": "06", "ביולי": "07",
        "יולי": "07", "באוגוסט": "08", "אוגוסט": "08"
    }
    
    daily_tips = {}
    lines = full_text.split('\n')
    current_date_key = None
    current_block = []
    
    def process_block(date_key, block_lines):
        if not date_key: return
        text = "\n".join(block_lines)
        
        # Clean up stray numbers like .5 at the end
        text = re.sub(r'\n\.?[345798]\s*$', '', text).strip()
        
        if "משימה יומית" in text or "אופציה לחטיבה" in text:
            mission_high = ""
            mission_elem = ""
            tip = ""
            
            m_high = re.search(r'\[אופציה לחטיבה ותיכון\]:(.*?)(?=\[אופציה ליסודי\]|טיפ החג|טיפ סיום|טיפ החופש|\Z)', text, re.DOTALL)
            if m_high: mission_high = m_high.group(1).strip()
            
            m_elem = re.search(r'\[אופציה ליסודי\]:(.*?)(?=טיפ החג|טיפ סיום|טיפ החופש|\Z)', text, re.DOTALL)
            if m_elem: mission_elem = m_elem.group(1).strip()
            
            m_tip = re.search(r'טיפ (?:החג|החופש הגדול|סיום שנה לחטיבה ותיכון|החופש):?(.*?)\Z', text, re.DOTALL)
            if m_tip: tip = m_tip.group(1).strip()
            
            # fallback if standard regex didn't catch things fully
            if not mission_high and not mission_elem and "משימה יומית של החג:" in text:
                m_general_mission = re.search(r'משימה יומית.*?:(.*?)(?=טיפ החג|טיפ החופש|\Z)', text, re.DOTALL)
                if m_general_mission:
                    mission_high = m_general_mission.group(1).strip()
                    mission_elem = mission_high

            mission_high = re.sub(r'^\.?\d+\s+', '', mission_high).strip().replace('\n', ' ')
            mission_elem = re.sub(r'^\.?\d+\s+', '', mission_elem).strip().replace('\n', ' ')
            tip = re.sub(r'^\.?\d+\s+', '', tip).strip().replace('\n', ' ')
            
            daily_tips[date_key] = {
                "type": "holiday",
                "missionHigh": mission_high,
                "missionElem": mission_elem,
                "tip": tip
            }
        else:
            parts = re.split(r'\n\.\d+\s+', text)
            valid_parts = [p.strip().replace('\n', ' ') for p in parts if len(p.strip()) > 10]
            if len(valid_parts) >= 2:
                daily_tips[date_key] = {
                    "type": "regular",
                    "tip1": valid_parts[0],
                    "tip2": valid_parts[1]
                }
            elif len(valid_parts) == 1:
                daily_tips[date_key] = {
                    "type": "regular",
                    "tip1": valid_parts[0],
                    "tip2": valid_parts[0]
                }

    for line in lines:
        line = line.strip()
        m = re.search(r'^(?:\*\s*)?(?:##\s*|###\s*)?(\d{1,2})\s+(ב?ספטמבר|אוקטובר|ב?נובמבר|ב?דצמבר|ב?ינואר|ב?פברואר|ב?מרץ|ב?מרס|ב?אפריל|ב?מאי|ב?יוני|ב?יולי|ב?אוגוסט)', line)
        if m and "–" not in line.split(')')[0] and "-" not in line.split(')')[0]:
            day = m.group(1).zfill(2)
            month = months.get(m.group(2).replace('ב','',1) if m.group(2).startswith('ב') and m.group(2) not in ["במאי"] else m.group(2), "00")
            if month == "00":
                month = months.get(m.group(2), "00")
                
            new_date_key = f"{month}-{day}"
            
            process_block(current_date_key, current_block)
            current_date_key = new_date_key
            current_block = []
        else:
            current_block.append(line)
            
    process_block(current_date_key, current_block)
    
    js_content = "const dailyTips = " + json.dumps(daily_tips, ensure_ascii=False, indent=2) + ";\n"
    with open(r"C:\Users\user\נטו חופש\neto-hofesh\assets\js\daily-tips.js", "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print(f"Extracted {len(daily_tips)} days of tips.")

if __name__ == "__main__":
    extract_from_transcript()
