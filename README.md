#  Intelli-Credit — AI-Powered Credit Appraisal Engine

<div align="center">

> Upload a company's financial documents. Get a full Credit Appraisal Memo in minutes.

Built for the **Intelli-Credit Hackathon** — Next-Gen Corporate Credit Appraisal challenge.

---

## 🌐 Live Deployment

**Access the deployed application here:**

**https://lonedev-ratnesh.vercel.app**

---

</div>

---

## What It Does

Banks take 2–3 weeks to manually appraise a loan application. Intelli-Credit does it in under 5 minutes.

| Step | What Happens |
|------|-------------|
| 📄 Upload PDF | Annual reports, bank statements, financials — even scanned docs |
| 🤖 AI Analysis | Extracts Revenue, Profit, Debt, EBITDA using Groq (Llama 3.3 70B) |
| 📊 Credit Score | Scores company 0–100 across 5 dimensions, gives Approve/Reject |
| 🌐 Web Research | Auto-searches news, court records, NCLT filings, regulatory alerts |
| 📋 CAM Report | Generates a professional Credit Appraisal Memo as a Word document |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| LLM | Groq API — Llama 3.3 70B |
| PDF Parsing | pdfplumber + pytesseract |
| Web Research | Tavily API |
| Report Export | python-docx |

**100% free to run** — no paid APIs required beyond free tiers.

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

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/intelli-credit.git
cd intelli-credit
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in `/backend`:
```
GROQ_API_KEY=your_groq_key_here
TAVILY_API_KEY=your_tavily_key_here
```

Get your free keys:
- Groq: https://console.groq.com
- Tavily: https://tavily.com

Start the backend:
```bash
python main.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## How the Scoring Works

The engine scores companies across the **5 Cs of Credit**:

| Dimension | Weight | What It Checks |
|-----------|--------|----------------|
| Character | 20pts | Promoter background, litigation, fraud signals |
| Capacity | 25pts | DSCR, profit margin, debt-to-revenue ratio |
| Capital | 20pts | Net worth, leverage, GST vs bank match |
| Collateral | 20pts | Security coverage, asset quality |
| Conditions | 15pts | Sector outlook, regulatory risk |

**Decision Table:**

| Score | Grade | Decision |
|-------|-------|----------|
| 80–100 | A | Approve — Base + 0.75% |
| 65–79 | B | Approve with conditions |
| 50–64 | C | Refer to credit committee |
| < 50 | D | Reject |

---

## What is a CAM Report?

A **Credit Appraisal Memo** is the official document a bank produces before approving or rejecting a loan. It contains the borrower's background, financial analysis, risk assessment, collateral details, and the final recommendation.

In real banks, this takes 2–3 weeks to prepare manually. Intelli-Credit generates it automatically in under 60 seconds.

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

## India-Specific Features

- GST reconciliation logic (GSTR-2A vs 3B mismatch detection)
- NCLT / IBC insolvency signal detection
- CIBIL Commercial score awareness
- Indian financial language in generated reports (Crores, Lakhs, WC limits)
- Searches Economic Times, Mint, Business Standard for company news

---


