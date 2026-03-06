from parser import extract_text_from_pdf
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
from dotenv import load_dotenv
from llm import summarize_document, extract_financials
from scorer import calculate_score
from researcher import research_company
from report_generator import generate_cam_report
from pathlib import Path
import httpx
import asyncio
from contextlib import asynccontextmanager
import os
import gc  # garbage collector

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(keep_alive())
    yield
    # Clean up state on shutdown
    clear_state(app)

def clear_state(app):
    """Free all stored data from memory"""
    for attr in ["extracted_text", "company_name", "summary", "financials", "score_result", "research"]:
        if hasattr(app.state, attr):
            delattr(app.state, attr)
    gc.collect()

async def keep_alive():
    while True:
        await asyncio.sleep(600)  # every 10 minutes — not 30 seconds
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.get("https://intelli-credit.onrender.com")
        except:
            pass

load_dotenv()
app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "Intelli-Credit backend running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDFs supported")

    file_bytes = await file.read()

    # Reject files over 8MB
    if len(file_bytes) > 8_000_000:
        raise HTTPException(status_code=413, detail="File too large. Max 8MB.")

    # Clear any previous session data before loading new one
    clear_state(app)

    text = extract_text_from_pdf(file_bytes)

    # Free the raw bytes immediately after parsing
    del file_bytes
    gc.collect()

    # Store only the text, not the raw PDF
    app.state.extracted_text = text

    return {
        "filename": file.filename,
        "characters_extracted": len(text),
        "preview": text[:500]
    }

@app.post("/analyze")
async def analyze(company_name: str = Form(...)):
    if not hasattr(app.state, "extracted_text"):
        raise HTTPException(status_code=400, detail="No document uploaded yet. Upload a PDF first.")

    summary = summarize_document(app.state.extracted_text, company_name)
    financials = extract_financials(app.state.extracted_text)

    app.state.company_name = company_name
    app.state.summary = summary["analysis"]
    app.state.financials = financials

    # Free raw text after analysis — no longer needed
    del app.state.extracted_text
    gc.collect()

    return {
        "company": company_name,
        "analysis": summary["analysis"],
        "financials": financials,
        "tokens_used": summary["tokens_used"]
    }

@app.post("/score")
async def score():
    if not hasattr(app.state, "summary"):
        raise HTTPException(status_code=400, detail="Run /analyze first")
    result = calculate_score(app.state.financials, app.state.summary)
    app.state.score_result = result
    return result

@app.post("/research")
async def research():
    if not hasattr(app.state, "company_name"):
        raise HTTPException(status_code=400, detail="Run /analyze first")
    result = research_company(app.state.company_name)
    app.state.research = result
    if hasattr(app.state, "score_result"):
        if result["risk_level"] == "CRITICAL":
            app.state.score_result["score"] = max(0, app.state.score_result["score"] - 30)
            app.state.score_result["red_flags"].append("CRITICAL risk found in web research")
        elif result["risk_level"] == "HIGH":
            app.state.score_result["score"] = max(0, app.state.score_result["score"] - 15)
            app.state.score_result["red_flags"].append("HIGH risk found in web research")
    return result

@app.post("/generate-cam")
async def generate_cam():
    if not hasattr(app.state, "research"):
        raise HTTPException(status_code=400, detail="Run /research first")
    filepath = generate_cam_report(
        app.state.company_name,
        app.state.summary,
        app.state.financials,
        app.state.score_result,
        app.state.research
    )
    # Clear all state after CAM is generated — full session done
    response = FileResponse(
        path=filepath,
        filename=Path(filepath).name,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    clear_state(app)
    return response

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)