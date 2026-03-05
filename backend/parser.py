import pdfplumber
import pytesseract
from PIL import Image
import io

MAX_PAGES = 15  # Limit to first 10 pages to avoid memory crash on Render free tier

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        pages = pdf.pages[:MAX_PAGES]
        total = len(pdf.pages)
        
        if total > MAX_PAGES:
            text += f"[Note: Document has {total} pages. Analyzing first {MAX_PAGES} pages only.]\n\n"
        
        for page in pages:
            page_text = page.extract_text()
            
            if page_text and len(page_text.strip()) > 50:
                text += page_text + "\n"
            else:
                # Scanned page — use OCR
                img = page.to_image(resolution=150).original  # lowered from 300 to save memory
                ocr_text = pytesseract.image_to_string(img)
                text += ocr_text + "\n"
    
    return text.strip()
