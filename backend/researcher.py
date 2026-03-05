from tavily import TavilyClient
import os
from dotenv import load_dotenv
from pathlib import Path
from groq import Groq

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def research_company(company_name: str) -> dict:
    queries = [
        f"{company_name} fraud OR scam OR cheating",
        f"{company_name} court case OR litigation OR lawsuit",
        f"{company_name} NPA OR default OR insolvency OR NCLT",
        f"{company_name} news 2024 2025",
    ]

    all_results = []

    for query in queries:
        try:
            result = tavily.search(query=query, max_results=3)
            for r in result.get("results", []):
                all_results.append({
                    "query": query,
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "content": r.get("content", "")[:500]
                })
        except Exception as e:
            all_results.append({"query": query, "error": str(e)})

    # Now ask Groq to summarize all findings
    findings_text = "\n\n".join([
        f"Query: {r.get('query')}\nTitle: {r.get('title')}\nContent: {r.get('content', 'N/A')}"
        for r in all_results if "error" not in r
    ])

    if not findings_text:
        return {
            "raw_results": all_results,
            "summary": "No web results found.",
            "risk_level": "UNKNOWN",
            "key_findings": []
        }

    prompt = f"""
You are a credit risk analyst. Based on these web search results about {company_name}, provide:

1. RISK LEVEL: (LOW / MEDIUM / HIGH / CRITICAL)
2. KEY FINDINGS: List the most important findings (max 5 bullet points)
3. SUMMARY: 2-3 sentence overall assessment

Search Results:
{findings_text[:5000]}

Be factual. Only report what is actually found in the results.
"""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )

    analysis = response.choices[0].message.content

    # Extract risk level
    risk_level = "UNKNOWN"
    for level in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
        if level in analysis.upper():
            risk_level = level
            break

    return {
        "raw_results": all_results,
        "summary": analysis,
        "risk_level": risk_level,
        "sources": [r.get("url") for r in all_results if r.get("url")]
    }