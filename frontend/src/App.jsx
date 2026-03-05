import { useState } from "react";
import axios from "axios";

const API = "https://intelli-credit.onrender.com";

export default function App() {
  const [page, setPage] = useState("home");
  const [file, setFile] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [results, setResults] = useState({});

  const post = async (url, data) => {
    setError(""); setLoading(true);
    try {
      const res = await axios.post(API + url, data);
      return res.data;
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
      return null;
    } finally { setLoading(false); setLoadingMsg(""); }
  };

  const handleUpload = async () => {
    if (!file) return setError("Select a PDF first");
    setLoadingMsg("Reading PDF...");
    const form = new FormData();
    form.append("file", file);
    const data = await post("/upload", form);
    if (data) { setResults(r => ({ ...r, upload: data })); setStep(1); }
  };

  const handleAnalyze = async () => {
    if (!companyName.trim()) return setError("Enter company name");
    setLoadingMsg("AI is analyzing the document...");
    const form = new FormData();
    form.append("company_name", companyName);
    const data = await post("/analyze", form);
    if (data) { setResults(r => ({ ...r, analyze: data })); setStep(2); }
  };

  const handleScore = async () => {
    setLoadingMsg("Calculating credit score...");
    const data = await post("/score", {});
    if (data) { setResults(r => ({ ...r, score: data })); setStep(3); }
  };

  const handleResearch = async () => {
    setLoadingMsg("Searching web for company intel...");
    const data = await post("/research", {});
    if (data) { setResults(r => ({ ...r, research: data })); setStep(4); }
  };

  const handleDownload = async () => {
    setLoading(true); setLoadingMsg("Generating Word document..."); setError("");
    try {
      const res = await axios.post(API + "/generate-cam", {}, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url; a.download = `CAM_${companyName}.docx`; a.click();
    } catch { setError("Download failed"); }
    finally { setLoading(false); setLoadingMsg(""); }
  };

  const decisionColor = d => d === "APPROVE" ? "#16a34a" : d?.includes("CONDITION") || d?.includes("REFER") ? "#d97706" : "#dc2626";
  const riskColor = r => ({ LOW: "#16a34a", MEDIUM: "#d97706", HIGH: "#dc2626", CRITICAL: "#991b1b" }[r] || "#6b7280");

  // HOME PAGE
  if (page === "home") return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>

      {/* NAV */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #1f2937" }}>
        <span style={{ fontSize: "20px", fontWeight: "800", background: "linear-gradient(to right, #60a5fa, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Intelli-Credit
        </span>
        <button onClick={() => setPage("app")} style={{ padding: "10px 24px", fontSize: "14px", fontWeight: "700", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          Launch App →
        </button>
      </div>

      {/* HERO */}
      <div style={{ textAlign: "center", padding: "80px 24px 60px" }}>
        <div style={{ display: "inline-block", padding: "6px 16px", background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: "20px", fontSize: "13px", color: "#60a5fa", marginBottom: "24px" }}>
          🤖 Powered by Groq · Llama 3.3 70B · Tavily
        </div>
        <h1 style={{ fontSize: "clamp(36px, 7vw, 68px)", fontWeight: "800", lineHeight: 1.1, marginBottom: "24px", maxWidth: "800px", margin: "0 auto 24px" }}>
          <span style={{ background: "linear-gradient(to right, #60a5fa, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Credit Appraisal.<br />Done in Minutes.
          </span>
        </h1>
        <p style={{ fontSize: "18px", color: "#9ca3af", maxWidth: "560px", lineHeight: "1.7", margin: "0 auto 40px" }}>
          Upload a company's financial documents. Get a full bank-grade Credit Appraisal Memo — with AI analysis, credit score, and web research — in under 5 minutes.
        </p>
        <button onClick={() => setPage("app")} style={{ padding: "16px 40px", fontSize: "18px", fontWeight: "700", background: "#fff", color: "#000", border: "none", borderRadius: "12px", cursor: "pointer" }}>
          Enter Platform →
        </button>
        <div style={{ fontSize: "13px", color: "#4b5563", marginTop: "12px" }}>Free · No login required · Works on Indian financial documents</div>
      </div>

      {/* STATS */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 72px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          {[
            { stat: "< 5 min", label: "Full appraisal turnaround", sub: "vs 3 weeks manually" },
            { stat: "5Cs", label: "Explainable scoring model", sub: "Character · Capacity · Capital · Collateral · Conditions" },
            { stat: "12+", label: "Web sources researched", sub: "News, NCLT, court records" },
            { stat: "100%", label: "Free infrastructure", sub: "Groq + Tavily free tier" },
          ].map(({ stat, label, sub }) => (
            <div key={stat} style={{ background: "#0a0a0a", border: "1px solid #1f2937", borderRadius: "12px", padding: "24px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "36px", fontWeight: "800", background: "linear-gradient(to right, #60a5fa, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "8px" }}>{stat}</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#e5e7eb", marginBottom: "6px" }}>{label}</div>
              <div style={{ fontSize: "12px", color: "#4b5563", lineHeight: "1.5" }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: "8px" }}>How it works</h2>
        <p style={{ fontSize: "15px", color: "#6b7280", textAlign: "center", marginBottom: "48px" }}>Five steps. No expertise required.</p>

        <div style={{ position: "relative" }}>
          {[
            { num: "01", icon: "📄", title: "Upload a PDF", desc: "Annual report, bank statement, ITR, or any financial document. Works with both digital and scanned PDFs via OCR." },
            { num: "02", icon: "🤖", title: "AI extracts financials", desc: "Groq's Llama 3.3 70B reads the document and pulls out Revenue, EBITDA, Debt, Profit, and 15+ other key metrics automatically." },
            { num: "03", icon: "📊", title: "Credit score calculated", desc: "The 5Cs engine scores the company from 0–100 across Character, Capacity, Capital, Collateral, and Conditions — with full reasoning." },
            { num: "04", icon: "🌐", title: "Web research agent runs", desc: "Tavily searches news, NCLT filings, court records, and regulatory alerts — building a risk profile from 12+ live sources." },
            { num: "05", icon: "📋", title: "Download your CAM", desc: "A full Credit Appraisal Memo is generated as a Word document in formal Indian banking language, ready for submission." },
          ].map(({ num, icon, title, desc }, i) => (
            <div key={num} style={{ display: "flex", gap: "20px", marginBottom: "32px", alignItems: "flex-start" }}>
              {/* Left: number + connector */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#0f172a", border: "2px solid #2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800", color: "#60a5fa" }}>{num}</div>
                {i < 4 && <div style={{ width: "2px", height: "40px", background: "#1f2937", margin: "4px 0" }} />}
              </div>
              {/* Right: content */}
              <div style={{ background: "#0a0a0a", border: "1px solid #1f2937", borderRadius: "10px", padding: "20px", flex: 1 }}>
                <div style={{ fontSize: "22px", marginBottom: "8px" }}>{icon}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "6px" }}>{title}</div>
                <div style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.7" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <button onClick={() => setPage("app")} style={{ padding: "16px 40px", fontSize: "17px", fontWeight: "700", background: "linear-gradient(to right, #2563eb, #4f46e5)", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer" }}>
            Try it now — it's free →
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid #1f2937", padding: "24px", textAlign: "center", fontSize: "13px", color: "#374151" }}>
        Built with FastAPI · React · Groq · Tavily · python-docx &nbsp;|&nbsp; github.com/ratneeshh/intelli-credit
      </div>

    </div>
  );

  // APP PAGE — unchanged
  return (
    <div style={{ minHeight: "100vh", background: "#000", padding: "40px 24px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "26px", fontWeight: "800", background: "linear-gradient(to right, #60a5fa, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Intelli-Credit
          </h2>
          <button onClick={() => setPage("home")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "15px" }}>
            ← Back
          </button>
        </div>

        {/* Steps */}
        {[
          {
            num: 1, title: "Upload Document", active: step === 0, done: step > 0,
            content: (
              <div>
                <label style={{ display: "block", border: "2px dashed #374151", borderRadius: "10px", padding: "28px", textAlign: "center", cursor: "pointer", marginBottom: "16px", background: file ? "#111827" : "transparent" }}>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>📁</div>
                  <div style={{ fontSize: "16px", color: "#d1d5db" }}>{file ? `✓ ${file.name}` : "Click to select a PDF"}</div>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Annual reports, bank statements, financials</div>
                  <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{ display: "none" }} />
                </label>
                {step === 0 && <Btn onClick={handleUpload} disabled={loading}>Upload PDF</Btn>}
                {results.upload && <Done>{results.upload.characters_extracted.toLocaleString()} characters extracted</Done>}
              </div>
            )
          },
          {
            num: 2, title: "AI Analysis", active: step === 1, done: step > 1,
            content: (
              <div>
                <input type="text" placeholder="Company name (e.g. Tata Motors Ltd)"
                  value={companyName} onChange={e => setCompanyName(e.target.value)}
                  style={{ width: "100%", padding: "14px 16px", fontSize: "16px", background: "#111827", border: "1px solid #374151", borderRadius: "8px", color: "#fff", marginBottom: "16px", outline: "none", boxSizing: "border-box" }} />
                {step === 1 && <Btn onClick={handleAnalyze} disabled={loading}>Run AI Analysis</Btn>}
                {results.analyze && (
                  <div>
                    <Done>Financials extracted successfully</Done>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginTop: "12px" }}>
                      {Object.entries(results.analyze.financials).map(([k, v]) => (
                        <div key={k} style={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px", padding: "12px" }}>
                          <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", marginBottom: "4px" }}>{k}</div>
                          <div style={{ fontSize: "17px", fontWeight: "700", color: v === "null" ? "#374151" : "#60a5fa" }}>{v === "null" ? "—" : v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          },
          {
            num: 3, title: "Credit Score", active: step === 2, done: step > 2,
            content: (
              <div>
                {step === 2 && <Btn onClick={handleScore} disabled={loading}>Calculate Score</Btn>}
                {results.score && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "28px", margin: "20px 0" }}>
                      <div style={{ textAlign: "center", minWidth: "100px" }}>
                        <div style={{ fontSize: "64px", fontWeight: "800", lineHeight: 1, color: "#fff" }}>{results.score.score}</div>
                        <div style={{ fontSize: "14px", color: "#6b7280" }}>/ 100</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "26px", fontWeight: "800", color: decisionColor(results.score.decision), marginBottom: "10px" }}>{results.score.decision}</div>
                        <div style={{ fontSize: "15px", color: "#d1d5db", marginBottom: "4px" }}>Grade: <strong>{results.score.grade}</strong></div>
                        <div style={{ fontSize: "15px", color: "#d1d5db", marginBottom: "4px" }}>Rate: <strong>{results.score.interest_rate}</strong></div>
                        <div style={{ fontSize: "15px", color: "#d1d5db" }}>Limit: <strong>₹{results.score.suggested_loan_limit_crore} Crore</strong></div>
                      </div>
                    </div>
                    {results.score.red_flags?.length > 0 && (
                      <div style={{ background: "#1c0a0a", border: "1px solid #7f1d1d", borderRadius: "8px", padding: "14px", marginBottom: "10px" }}>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#f87171", marginBottom: "8px" }}>⚠ Red Flags</div>
                        {results.score.red_flags.map((f, i) => <div key={i} style={{ fontSize: "14px", color: "#fca5a5", marginBottom: "4px" }}>• {f}</div>)}
                      </div>
                    )}
                    {results.score.positive_signals?.length > 0 && (
                      <div style={{ background: "#052e16", border: "1px solid #166534", borderRadius: "8px", padding: "14px" }}>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#4ade80", marginBottom: "8px" }}>✓ Positive Signals</div>
                        {results.score.positive_signals.map((f, i) => <div key={i} style={{ fontSize: "14px", color: "#86efac", marginBottom: "4px" }}>• {f}</div>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          },
          {
            num: 4, title: "Web Research", active: step === 3, done: step > 3,
            content: (
              <div>
                <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "16px" }}>Searches news, court records, and regulatory filings automatically.</p>
                {step === 3 && <Btn onClick={handleResearch} disabled={loading}>Run Research Agent</Btn>}
                {results.research && (
                  <div>
                    <div style={{ display: "inline-block", padding: "8px 20px", borderRadius: "6px", fontWeight: "800", fontSize: "18px", color: riskColor(results.research.risk_level), border: `1px solid ${riskColor(results.research.risk_level)}`, marginBottom: "14px" }}>
                      Risk: {results.research.risk_level}
                    </div>
                    <p style={{ fontSize: "15px", color: "#d1d5db", lineHeight: "1.8", whiteSpace: "pre-line" }}>{results.research.summary}</p>
                    <p style={{ fontSize: "13px", color: "#4b5563", marginTop: "8px" }}>{results.research.sources?.length} sources analyzed</p>
                  </div>
                )}
              </div>
            )
          },
          {
            num: 5, title: "Download CAM Report", active: step === 4, done: false,
            content: (
              <div>
                <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "16px" }}>Generates a full Credit Appraisal Memo as a Word document.</p>
                <Btn onClick={handleDownload} disabled={loading || step !== 4} blue>
                  {loading && loadingMsg.includes("Word") ? "Generating..." : "⬇ Download CAM Report (.docx)"}
                </Btn>
              </div>
            )
          }
        ].map(({ num, title, active, done, content }) => (
          <div key={num} style={{
            border: `1px solid ${active ? "#2563eb" : done ? "#166534" : "#1f2937"}`,
            borderRadius: "12px", padding: "24px", marginBottom: "16px",
            background: active ? "#0f172a" : "#0a0a0a",
            opacity: (!active && !done) ? 0.45 : 1,
            transition: "all 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "15px", flexShrink: 0,
                background: done ? "#166534" : active ? "#2563eb" : "#1f2937",
                color: (done || active) ? "#fff" : "#4b5563",
              }}>{done ? "✓" : num}</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>{title}</div>
            </div>
            {(active || done) && content}
          </div>
        ))}

        {error && <div style={{ background: "#1c0a0a", border: "1px solid #7f1d1d", borderRadius: "8px", padding: "14px", fontSize: "15px", color: "#f87171", marginTop: "8px" }}>⚠ {error}</div>}
        {loading && <div style={{ textAlign: "center", padding: "16px", fontSize: "16px", color: "#60a5fa" }}>⏳ {loadingMsg}</div>}
      </div>
    </div>
  );
}

function Btn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "14px 28px", fontSize: "16px", fontWeight: "700",
      background: disabled ? "#1f2937" : "#2563eb",
      color: disabled ? "#4b5563" : "#fff",
      border: "none", borderRadius: "8px", cursor: disabled ? "not-allowed" : "pointer",
    }}>{children}</button>
  );
}

function Done({ children }) {
  return <div style={{ fontSize: "14px", color: "#4ade80", fontWeight: "600", marginTop: "4px", marginBottom: "8px" }}>✓ {children}</div>;
}