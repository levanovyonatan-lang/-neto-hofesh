import sys
import pypdfium2 as pdfium

pdf = pdfium.PdfDocument("נטו חופש- הטיפ היומי- גרסה 2.pdf")
new_pdf = pdfium.PdfDocument.new()

# Save pages 18 to end
for i in range(17, len(pdf)):
    new_pdf.import_pages(pdf, [i])

new_pdf.save("pdf_part2.pdf")
print("Saved pdf_part2.pdf")
