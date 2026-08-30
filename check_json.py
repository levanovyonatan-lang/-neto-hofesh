import json

transcript_path = r"C:\Users\user\.gemini\antigravity-ide\brain\b7e80f6d-d248-4a19-b0ab-28d8edc70861\.system_generated\logs\transcript_full.jsonl"

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        if '"type":"TOOL_RESPONSE"' in line and '==Start of OCR' in line:
            try:
                data = json.loads(line)
                print("KEYS:", data.keys())
                if 'content' in data:
                    print("Found TOOL_RESPONSE content len:", len(data['content']))
                    with open(r"C:\Users\user\נטו חופש\neto-hofesh\raw_tips.txt", "w", encoding="utf-8") as out:
                        out.write(data['content'])
                    break
            except Exception as e:
                print(e)
