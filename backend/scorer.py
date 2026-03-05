def calculate_score(financials: dict, summary: str) -> dict:
    score = 100
    reasons = []
    positives = []

    # ── CAPACITY (based on financials) ──
    try:
        revenue = float(str(financials.get("Revenue", "0")).replace(",", "").replace("Crore", "").strip())
        debt = float(str(financials.get("Total Debt", "0")).replace(",", "").replace("Crore", "").strip())
        profit = float(str(financials.get("Profit", "0")).replace(",", "").replace("Crore", "").strip())

        if debt > 0 and revenue > 0:
            debt_ratio = debt / revenue
            if debt_ratio > 0.6:
                score -= 20
                reasons.append(f"High debt-to-revenue ratio: {round(debt_ratio, 2)}x (threshold: 0.6x)")
            elif debt_ratio > 0.4:
                score -= 10
                reasons.append(f"Moderate debt-to-revenue ratio: {round(debt_ratio, 2)}x")
            else:
                positives.append(f"Healthy debt-to-revenue ratio: {round(debt_ratio, 2)}x")

        if profit > 0 and revenue > 0:
            margin = (profit / revenue) * 100
            if margin < 5:
                score -= 15
                reasons.append(f"Low profit margin: {round(margin, 1)}% (below 5%)")
            elif margin < 10:
                score -= 5
                reasons.append(f"Thin profit margin: {round(margin, 1)}%")
            else:
                positives.append(f"Strong profit margin: {round(margin, 1)}%")

        if profit <= 0:
            score -= 25
            reasons.append("Company is loss-making")

    except Exception:
        score -= 10
        reasons.append("Could not parse financial figures clearly")

    # ── CHARACTER (based on text signals) ──
    summary_lower = summary.lower()

    negative_keywords = [
        ("fraud", 25, "Fraud mentioned in documents"),
        ("nclt", 25, "NCLT/Insolvency proceedings found"),
        ("litigation", 15, "Litigation risk detected"),
        ("default", 20, "Default history mentioned"),
        ("npa", 20, "NPA classification found"),
        ("money laundering", 30, "Money laundering reference found"),
        ("circular trading", 20, "Circular trading suspected"),
        ("investigation", 15, "Under investigation"),
        ("overdue", 10, "Overdue payments mentioned"),
        ("penalty", 10, "Penalties mentioned"),
    ]

    for keyword, deduction, reason in negative_keywords:
        if keyword in summary_lower:
            score -= deduction
            reasons.append(reason)

    positive_keywords = [
        ("growth", "Revenue/business growth mentioned"),
        ("export", "Export activity — positive forex signal"),
        ("profit", "Profitability confirmed"),
        ("surplus", "Cash surplus mentioned"),
        ("expansion", "Business expansion planned"),
    ]

    for keyword, reason in positive_keywords:
        if keyword in summary_lower:
            positives.append(reason)

    # ── FINAL SCORE & GRADE ──
    score = max(0, min(100, score))

    if score >= 80:
        grade = "A"
        decision = "APPROVE"
        rate = "Base + 0.75%"
        color = "green"
    elif score >= 65:
        grade = "B"
        decision = "APPROVE WITH CONDITIONS"
        rate = "Base + 1.5%"
        color = "yellow"
    elif score >= 50:
        grade = "C"
        decision = "REFER TO CREDIT COMMITTEE"
        rate = "Base + 2.5%"
        color = "orange"
    else:
        grade = "D"
        decision = "REJECT"
        rate = "N/A"
        color = "red"

    # Suggested loan amount = 2x annual profit or 30% of revenue (whichever is lower)
    try:
        suggested_limit = min(profit * 2, revenue * 0.3)
        suggested_limit = max(0, round(suggested_limit, 2))
    except Exception:
        suggested_limit = 0

    return {
        "score": score,
        "grade": grade,
        "decision": decision,
        "interest_rate": rate,
        "suggested_loan_limit_crore": suggested_limit,
        "red_flags": reasons,
        "positive_signals": positives,
        "explanation": f"Score: {score}/100. Decision: {decision}. " +
                       (f"Rejected due to: {', '.join(reasons[:2])}" if decision == "REJECT"
                        else f"Key strengths: {', '.join(positives[:2]) if positives else 'Adequate financials'}")
    }