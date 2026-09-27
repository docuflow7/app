export const SAMPLE_MARKDOWN = `# Quarterly Business Review — Q3 2026

> Prepared for the executive team · Confidential

## Executive Summary

Revenue grew **14.2% quarter-over-quarter** to $4.8M, driven by enterprise expansion and improved net retention (*118%*, up from 112%). Churn remains below target at **1.9%**.

Key highlights:

- Net-new ARR: **$920k** (vs. $750k plan)
- Gross margin: **82%** — record high
- NPS: **64** (+6 pts)
- Hiring: 12 roles closed, attrition at 6%

## Financial Performance

| Metric | Q2 2026 | Q3 2026 | Δ |
|---|---:|---:|---:|
| Revenue | $4.21M | $4.81M | +14.2% |
| Gross margin | 79% | 82% | +3pp |
| Burn multiple | 1.8 | 1.4 | −0.4 |
| Runway | 22 mo | 28 mo | +6 mo |

### What worked

1. **Land-and-expand motion** — 34 accounts expanded > $25k.
2. **Pricing guardrails** — discount rate fell from 18% to 11%.
3. **Support automation** — median first response down to *4 minutes*.

### Risks & mitigations

- *Hiring lag in Data* → contracted two senior engineers.
- *Single-region infra* → EU failover ships in October.
- *Long deals slipping* → split procurement into two-stage pilots.

## Customer Voice

> “DocuFlow cut our board-deck prep from two days to twenty minutes. The PDFs look like a design team made them.”
> — VP Finance, Acme Corp

\`\`\`
# reproducibility note
retention = [1.12, 1.15, 1.18]
assert retention[-1] > 1.10
\`\`\`

---

**Next steps:** approve EU expansion budget, freeze discount policy, and publish the Q4 hiring plan by Oct 10.
`;
