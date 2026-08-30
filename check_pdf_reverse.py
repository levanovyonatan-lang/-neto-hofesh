with open(r"C:\Users\user\נטו חופש\neto-hofesh\test_pymupdf.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

with open(r"C:\Users\user\נטו חופש\neto-hofesh\test_reversed.txt", "w", encoding="utf-8") as f:
    for line in lines[:20]:
        f.write(line.strip()[::-1] + "\n")
