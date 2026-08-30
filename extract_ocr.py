import re
transcript_path = r"C:\Users\user\.gemini\antigravity-ide\brain\b7e80f6d-d248-4a19-b0ab-28d8edc70861\.system_generated\logs\transcript_full.jsonl"
with open(transcript_path, 'r', encoding='utf-8') as f:
    text = f.read()

matches = re.finditer(r'==Start of OCR for page 1==(.*?)(?:==End of OCR for page 71==|==Screenshot for page)', text, re.DOTALL)
for m in matches:
    extracted = m.group(1)
    extracted = extracted.replace('\\n', '\n').replace('\\"', '"').replace('\\/', '/')
    if len(extracted) > 20000:
        with open(r"C:\Users\user\נטו חופש\neto-hofesh\raw_tips.txt", "w", encoding="utf-8") as out:
            out.write("==Start of OCR for page 1==\n" + extracted)
        print("SUCCESS! Length:", len(extracted))
        break
else:
    print("Not found any match > 20000 chars")
