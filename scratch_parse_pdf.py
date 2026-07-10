import pdfplumber

with pdfplumber.open("נטו חופש- הטיפ היומי- גרסה 2.pdf") as pdf:
    text = ""
    for page in pdf.pages:
        text += page.extract_text() + "\n---PAGE_BREAK---\n"

with open("extracted_tips.txt", "w", encoding="utf-8") as f:
    f.write(text)

print("Extraction complete. See extracted_tips.txt")
