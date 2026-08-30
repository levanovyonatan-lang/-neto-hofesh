import fitz

pdf_path = r"C:\Users\user\נטו חופש\neto-hofesh\# 📚 לוח חופשות, חגים ותוכן שנתי לתלמידים (כרונולוגי מלא).pdf"
doc = fitz.open(pdf_path)
full_text = ""
for page in doc:
    full_text += page.get_text("text")

with open(r"C:\Users\user\נטו חופש\neto-hofesh\test_pymupdf.txt", "w", encoding="utf-8") as f:
    f.write(full_text)
