from parser import extract_text_from_pdf
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
from dotenv import load_dotenv
from llm import summarize_document, extract_financials
from scorer import calculate_score
from researcher import research_company
from report_generator import generate_cam_report
from pathlib import Path
import os

load_dotenv()

app = FastAPI()

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
    file_bytes = await file.read()
    
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDFs supported"}
    
    text = extract_text_from_pdf(file_bytes)
    
    # Store in memory for now (we'll improve this later)
    app.state.extracted_text = text
    
    return {
        "filename": file.filename,
        "characters_extracted": len(text),
        "preview": text[:500]  # first 500 chars as preview
    }

@app.post("/analyze")
async def analyze(company_name: str = Form(...)):
    if not hasattr(app.state, "extracted_text"):
        return {"error": "No document uploaded yet. Upload a PDF first."}
    
    summary = summarize_document(app.state.extracted_text, company_name)
    financials = extract_financials(app.state.extracted_text)
    
    app.state.company_name = company_name
    app.state.summary = summary["analysis"]
    app.state.financials = financials
    
    return {
        "company": company_name,
        "analysis": summary["analysis"],
        "financials": financials,
        "tokens_used": summary["tokens_used"]
    }

@app.post("/score")
async def score():
    if not hasattr(app.state, "summary"):
        return {"error": "Run /analyze first"}

    result = calculate_score(app.state.financials, app.state.summary)
    app.state.score_result = result
    return result

@app.post("/research")
async def research():
    if not hasattr(app.state, "company_name"):
        return {"error": "Run /analyze first"}

    result = research_company(app.state.company_name)
    app.state.research = result

    # Adjust score based on research risk
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
        return {"error": "Run /research first"}

    filepath = generate_cam_report(
        app.state.company_name,
        app.state.summary,
        app.state.financials,
        app.state.score_result,
        app.state.research
    )

    return FileResponse(
        path=filepath,
        filename=Path(filepath).name,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)