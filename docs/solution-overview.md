# Solution Overview

## What We Built

**Sentinel** is a fully client-side pharmacovigilance and regulatory intelligence web application.

## How It Works

### Signal Detection Engine
1. User uploads a CSV of adverse event spontaneous reports (or uses built-in sample data)
2. The engine builds 2×2 contingency tables for every drug–event pair
3. For each pair it computes:
   - **PRR** (Proportional Reporting Ratio)
   - **ROR** (Reporting Odds Ratio)
   - **Chi-square** with Yates continuity correction
   - **95% Confidence Interval** for PRR (log-normal approximation)
   - **Severity weight** based on outcome distribution (death=3, serious=2, non-serious=1)
4. Signal status is assigned: `Critical Signal` | `Signal` | `Watch` | `No Signal`
5. Results are surfaced in a sortable/filterable table with scatter chart and trend charts

**Signal thresholds (Evans criteria):**
- PRR ≥ 2 AND Chi-square ≥ 4 AND case count ≥ 3 → **Signal**
- PRR ≥ 5 or severity weight ≥ 2.5 → escalated to **Critical Signal**

### CTD Gap Checker
1. User uploads or pastes their dossier table of contents
2. Each line is fuzzy-matched against 60 reference items across all 5 ICH M4 CTD modules
3. Match scoring uses normalised Levenshtein similarity:
   - ≥ 0.72 → **Present**
   - 0.48–0.72 → **Partial**
   - < 0.48 → **Missing**
4. Per-module completeness scores and an overall readiness percentage are computed
5. Submission risk is assessed: `High` | `Medium` | `Low`

## Why Client-Side Only?

- **Data privacy** — pharmaceutical AE data is highly sensitive; it never leaves the user''s browser
- **No infrastructure costs** — zero server, zero database, zero API
- **Instant deployment** — static files, deployable to GitHub Pages / Netlify / Vercel
- **Offline capable** — works without internet after first load
