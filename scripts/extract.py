import pypdf
reader = pypdf.PdfReader("נטו חופש- הטיפ היומי- גרסה 3.pdf")
with open("new_tips_v3.txt", "w", encoding="utf-8") as f:
    for p in reader.pages:
        f.write(p.extract_text() + "\n")
