import pdfplumber

pdf_path = r"C:\Users\user\נטו חופש\neto-hofesh\# 📚 לוח חופשות, חגים ותוכן שנתי לתלמידים (כרונולוגי מלא).pdf"
with pdfplumber.open(pdf_path) as pdf:
    text = ""
    for page in pdf.pages[:3]:
        text += page.extract_text() + "\n"

with open(r"C:\Users\user\נטו חופש\neto-hofesh\test_plumber.txt", "w", encoding="utf-8") as f:
    f.write(text)
