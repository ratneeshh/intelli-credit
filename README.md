
# Intelli-Credit — AI-Powered Credit Appraisal Engine

<div align="center">

**Upload a company's financial documents. Get a full Credit Appraisal Memo in minutes.**

Built for the **Intelli-Credit Hackathon** — Next-Gen Corporate Credit Appraisal challenge.

### 🌐 [Live Demo → lonedev-ratnesh.vercel.app](https://lonedev-ratnesh.vercel.app)

</div>

---

## The Problem

Banks take 2–3 weeks to manually appraise a loan application. Credit managers drown in PDFs, court records, GST filings, and news articles — all manually stitched together. Bias creeps in. Early warning signals get missed.

**Intelli-Credit does it in under 5 minutes.**

---

## What It Does

| Step | What Happens |
|------|-------------|
| 📄 Upload PDF | Annual reports, bank statements, financials — even scanned docs via OCR |
| 🤖 AI Analysis | Extracts Revenue, Profit, Debt, EBITDA using Groq (Llama 3.3 70B) |
| 📊 Credit Score | Scores company 0–100 across the 5 Cs of Credit, gives Approve/Reject |
| 🌐 Web Research | Auto-searches news, court records, NCLT filings, regulatory alerts |
| 📋 CAM Report | Downloads a professional Credit Appraisal Memo as a Word document |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite — deployed on Vercel |
| Backend | FastAPI (Python) — deployed on Render |
| LLM | Groq API — Llama 3.3 70B (free tier) |
| PDF Parsing | pdfplumber + pytesseract (OCR) |
| Web Research | Tavily API (free tier) |
| Report Export | python-docx |

**100% free to run** — no paid APIs required.

---

## Project Structure
```
intelli-credit/
├── backend/
│   ├── main.py              # FastAPI server + all routes
│   ├── pdf_parser.py        # PDF text extraction (OCR + digital)
│   ├── llm.py               # Groq AI analysis + financial extraction
│   ├── scorer.py            # 5Cs credit scoring engine
│   ├── researcher.py        # Tavily web research agent
│   ├── report_generator.py  # CAM Word document generator
│   └── requirements.txt
└── frontend/
    └── src/
        └── App.jsx          # Full React UI
```

---

## How the Scoring Works

The engine scores companies across the **5 Cs of Credit**:

| Dimension | Weight | What It Checks |
|-----------|--------|----------------|
| Character | 20pts | Promoter background, litigation, fraud signals |
| Capacity | 25pts | DSCR, profit margin, debt-to-revenue ratio |
| Capital | 20pts | Net worth, leverage, GST vs bank reconciliation |
| Collateral | 20pts | Security coverage, asset quality, encumbrance |
| Conditions | 15pts | Sector outlook, regulatory risk, macro signals |

**Decision Table:**

| Score | Grade | Decision | Rate |
|-------|-------|----------|------|
| 80–100 | A | Approve | Base + 0.75% |
| 65–79 | B | Approve with conditions | Base + 1.5% |
| 50–64 | C | Refer to credit committee | Base + 2.5% |
| < 50 | D | Reject | — |

---

## What is a CAM Report?

A **Credit Appraisal Memo** is the official document a bank produces before approving or rejecting a loan. It contains the borrower's background, financial analysis, risk assessment, collateral details, and a final recommendation — written in formal Indian banking language.

In real banks this takes 2–3 weeks manually. Intelli-Credit generates it in under 60 seconds.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload and parse PDF |
| POST | `/analyze` | AI financial analysis |
| POST | `/score` | Calculate credit score |
| POST | `/research` | Web research agent |
| POST | `/generate-cam` | Download CAM Word doc |

---

## India-Specific Intelligence

- GST reconciliation — GSTR-2A vs 3B mismatch detection
- NCLT / IBC insolvency proceedings detection
- CIBIL Commercial score signal awareness
- Indian financial language in reports (Crores, Lakhs, WC limits, SARFAESI)
- Searches Economic Times, Mint, Business Standard for company news

---

## Self Hosting
```bash
# Clone
git clone https://github.com/ratneeshh/intelli-credit.git

# Backend
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Add GROQ_API_KEY and TAVILY_API_KEY to .env
python main.py

# Frontend
cd frontend && npm install
# Set API = "http://localhost:8000" in src/App.jsx
npm run dev
```

Free API keys: [Groq](https://console.groq.com) · [Tavily](https://tavily.com)

---

> *"A credit manager today takes 3 weeks. Intelli-Credit: under 5 minutes."*
