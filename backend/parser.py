import pdfplumber
import pytesseract
from PIL import Image
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            
            if page_text and len(page_text.strip()) > 50:
                # Clean digital PDF page
                text += page_text + "\n"
            else:
                # Scanned page — use OCR
                img = page.to_image(resolution=300).original
                ocr_text = pytesseract.image_to_string(img)
                text += ocr_text + "\n"
    
    return text.strip()