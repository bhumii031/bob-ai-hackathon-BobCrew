/**
 * Signal Detection Engine
 * Implements PRR, ROR, Chi-square (Yates), 95% CI for PRR
 */

/**
 * Build 2×2 contingency table for each (drug, event) pair.
 * a = reports of this event with this drug
 * b = reports of other events with this drug
 * c = reports of this event with other drugs
 * d = reports of other events with other drugs
 */
export function buildContingencyTables(rows) {
  // Count totals
  const N = rows.length

  // drugEventCounts[drug][event] = count
  const drugEventCounts = {}
  // drugTotals[drug] = total reports for this drug
  const drugTotals = {}
  // eventTotals[event] = total reports for this event
  const eventTotals = {}

  for (const row of rows) {
    const drug = row.drug_name
    const event = row.adverse_event

    if (!drugEventCounts[drug]) drugEventCounts[drug] = {}
    drugEventCounts[drug][event] = (drugEventCounts[drug][event] || 0) + 1
    drugTotals[drug] = (drugTotals[drug] || 0) + 1
    eventTotals[event] = (eventTotals[event] || 0) + 1
  }

  const pairs = []

  for (const drug of Object.keys(drugEventCounts)) {
    for (const event of Object.keys(drugEventCounts[drug])) {
      const a = drugEventCounts[drug][event]            // drug+event
      const b = drugTotals[drug] - a                    // drug+other events
      const c = eventTotals[event] - a                  // other drugs+event
      const d = N - a - b - c                           // other drugs+other events

      pairs.push({ drug, event, a, b, c, d, N })
    }
  }

  return pairs
}

/**
 * Compute PRR = (a/(a+b)) / (c/(c+d))
 * Returns Infinity if denominator is 0
 */
export function computePRR(a, b, c, d) {
  const num = a / (a + b)
  const den = c / (c + d)
  if (den === 0) return null
  return num / den
}

/**
 * Compute ROR = (a*d) / (b*c)
 */
export function computeROR(a, b, c, d) {
  if (b === 0 || c === 0) return null
  return (a * d) / (b * c)
}

/**
 * Chi-square with Yates' continuity correction
 * χ² = N * (|ad - bc| - N/2)² / [(a+b)(c+d)(a+c)(b+d)]
 */
export function computeChiSquare(a, b, c, d, N) {
  const num = N * Math.pow(Math.abs(a * d - b * c) - N / 2, 2)
  const den = (a + b) * (c + d) * (a + c) * (b + d)
  if (den === 0) return 0
  return num / den
}

/**
 * 95% CI for PRR using log-normal approximation
 * SE(ln PRR) ≈ sqrt(1/a - 1/(a+b) + 1/c - 1/(c+d))
 * CI = exp(ln(PRR) ± 1.96 * SE)
 */
export function computePRR_CI(prr, a, b, c, d) {
  if (!prr || prr <= 0 || a === 0 || c === 0) return { lower: null, upper: null }
  const se = Math.sqrt(1 / a - 1 / (a + b) + 1 / c - 1 / (c + d))
  const lnPRR = Math.log(prr)
  return {
    lower: Math.exp(lnPRR - 1.96 * se),
    upper: Math.exp(lnPRR + 1.96 * se),
  }
}

/**
 * Severity weighting based on outcome distribution for this (drug, event) pair
 */
export function computeSeverityWeight(rows, drug, event) {
  const relevant = rows.filter(r => r.drug_name === drug && r.adverse_event === event)
  if (relevant.length === 0) return 0
  const deaths = relevant.filter(r => r.outcome === 'death').length
  const serious = relevant.filter(r => r.outcome === 'serious').length
  // Weight: death=3, serious=2, non-serious=1
  const weighted = deaths * 3 + serious * 2 + (relevant.length - deaths - serious) * 1
  return weighted / relevant.length  // avg weight 1-3
}

/**
 * Determine signal status based on thresholds:
 * Signal: PRR ≥ 2 AND Chi-square ≥ 4 AND a ≥ 3
 */
export function determineSignalStatus(prr, chiSquare, a, severityWeight) {
  const prrPass = prr !== null && prr >= 2
  const chiPass = chiSquare >= 4
  const nPass = a >= 3

  if (prrPass && chiPass && nPass) {
    // Check if critical (death-associated or very high PRR)
    if (severityWeight >= 2.5 || prr >= 5) return 'Critical Signal'
    return 'Signal'
  }
  if (prrPass || chiPass) return 'Watch'
  return 'No Signal'
}

/**
 * Generate trend data for a (drug, event) pair grouped by month
 */
export function generateTrendData(rows, drug, event) {
  const relevant = rows.filter(r => r.drug_name === drug && r.adverse_event === event)
  const byMonth = {}
  for (const row of relevant) {
    const d = new Date(row.report_date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    byMonth[key] = (byMonth[key] || 0) + 1
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }))
}

/**
 * Main analysis function — runs full signal detection on a dataset
 */
export function runSignalDetection(rows) {
  const pairs = buildContingencyTables(rows)
  const results = []

  for (const { drug, event, a, b, c, d, N } of pairs) {
    const prr = computePRR(a, b, c, d)
    const ror = computeROR(a, b, c, d)
    const chiSquare = computeChiSquare(a, b, c, d, N)
    const ci = computePRR_CI(prr, a, b, c, d)
    const severityWeight = computeSeverityWeight(rows, drug, event)
    const signalStatus = determineSignalStatus(prr, chiSquare, a, severityWeight)

    // Threshold pass/fail
    const thresholds = {
      prr: prr !== null && prr >= 2,
      chiSquare: chiSquare >= 4,
      n: a >= 3,
    }

    // Outcome breakdown
    const relevant = rows.filter(r => r.drug_name === drug && r.adverse_event === event)
    const deaths = relevant.filter(r => r.outcome === 'death').length
    const serious = relevant.filter(r => r.outcome === 'serious').length
    const nonSerious = relevant.filter(r => r.outcome === 'non-serious').length

    results.push({
      drug,
      event,
      a, b, c, d, N,
      prr: prr !== null ? +prr.toFixed(3) : null,
      ror: ror !== null ? +ror.toFixed(3) : null,
      chiSquare: +chiSquare.toFixed(3),
      ciLower: ci.lower !== null ? +ci.lower.toFixed(3) : null,
      ciUpper: ci.upper !== null ? +ci.upper.toFixed(3) : null,
      severityWeight: +severityWeight.toFixed(2),
      signalStatus,
      thresholds,
      outcomes: { deaths, serious, nonSerious },
    })
  }

  // Sort by signal severity then PRR descending
  const ORDER = { 'Critical Signal': 0, 'Signal': 1, 'Watch': 2, 'No Signal': 3 }
  results.sort((a, b) => {
    if (ORDER[a.signalStatus] !== ORDER[b.signalStatus]) {
      return ORDER[a.signalStatus] - ORDER[b.signalStatus]
    }
    return (b.prr || 0) - (a.prr || 0)
  })

  return results
}
