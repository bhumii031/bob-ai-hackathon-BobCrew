/**
 * CTD Gap Checker
 * Fuzzy-matches a user's dossier TOC against the ICH M4 reference structure,
 * computes completeness scores per module and overall, and assigns gap severities.
 */

import { CTD_REFERENCE } from '../data/sampleData.js'

/**
 * Simple fuzzy similarity — normalised Levenshtein ratio
 */
function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
      }
    }
  }
  return dp[m][n]
}

function similarity(a, b) {
  const dist = levenshtein(a.toLowerCase(), b.toLowerCase())
  const maxLen = Math.max(a.length, b.length)
  return maxLen === 0 ? 1 : 1 - dist / maxLen
}

/**
 * Score a reference item against all lines in the dossier TOC.
 * Returns { status: 'Present'|'Partial'|'Missing', matchScore, matchedLine }
 */
function matchItem(refLabel, tocLines) {
  let bestScore = 0
  let bestLine = ''

  for (const line of tocLines) {
    const s = similarity(refLabel, line)
    if (s > bestScore) {
      bestScore = s
      bestLine = line
    }
  }

  let status
  if (bestScore >= 0.72) {
    status = 'Present'
  } else if (bestScore >= 0.48) {
    status = 'Partial'
  } else {
    status = 'Missing'
  }

  return { status, matchScore: +bestScore.toFixed(3), matchedLine: bestLine }
}

/**
 * Parse a TOC string into non-empty, trimmed lines
 */
export function parseTOC(tocText) {
  return tocText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2 && !l.startsWith('Module'))
}

/**
 * Run the CTD gap check against a dossier TOC string.
 * Returns structured results per module with completeness scores.
 */
export function runCTDCheck(tocText) {
  const tocLines = parseTOC(tocText)
  const moduleResults = []

  for (const mod of CTD_REFERENCE) {
    const itemResults = []

    for (const item of mod.items) {
      const match = matchItem(item.label, tocLines)
      itemResults.push({
        id: item.id,
        label: item.label,
        severity: item.severity,
        status: match.status,
        matchScore: match.matchScore,
        matchedLine: match.matchedLine,
      })
    }

    const total = itemResults.length
    const present = itemResults.filter(i => i.status === 'Present').length
    const partial = itemResults.filter(i => i.status === 'Partial').length
    const missing = itemResults.filter(i => i.status === 'Missing').length

    // Completeness: present=1, partial=0.5, missing=0
    const score = total > 0
      ? Math.round(((present + partial * 0.5) / total) * 100)
      : 0

    const criticalGaps = itemResults.filter(i => i.status !== 'Present' && i.severity === 'Critical').length
    const highGaps = itemResults.filter(i => i.status !== 'Present' && i.severity === 'High').length

    moduleResults.push({
      module: mod.module,
      title: mod.title,
      items: itemResults,
      score,
      total,
      present,
      partial,
      missing,
      criticalGaps,
      highGaps,
    })
  }

  // Overall completeness
  const allItems = moduleResults.flatMap(m => m.items)
  const totalItems = allItems.length
  const totalPresent = allItems.filter(i => i.status === 'Present').length
  const totalPartial = allItems.filter(i => i.status === 'Partial').length
  const overallScore = Math.round(((totalPresent + totalPartial * 0.5) / totalItems) * 100)

  const allGaps = allItems.filter(i => i.status !== 'Present')
  const criticalGaps = allGaps.filter(i => i.severity === 'Critical')
  const highGaps = allGaps.filter(i => i.severity === 'High')
  const mediumGaps = allGaps.filter(i => i.severity === 'Medium')

  // Submission risk
  let riskLevel = 'Low'
  let riskReason = 'Dossier appears substantially complete.'
  if (criticalGaps.length > 0) {
    riskLevel = 'High'
    riskReason = `${criticalGaps.length} critical gap(s) detected — submission likely to receive a Major Objection.`
  } else if (highGaps.length >= 2) {
    riskLevel = 'Medium'
    riskReason = `${highGaps.length} high-severity gap(s) — submission may receive Other Concerns.`
  } else if (highGaps.length === 1 || overallScore < 85) {
    riskLevel = 'Medium'
    riskReason = 'Minor gaps may require List of Questions responses.'
  }

  return {
    moduleResults,
    overallScore,
    totalItems,
    totalPresent,
    totalPartial,
    totalMissing: allItems.filter(i => i.status === 'Missing').length,
    gaps: {
      all: allGaps,
      critical: criticalGaps,
      high: highGaps,
      medium: mediumGaps,
    },
    riskLevel,
    riskReason,
  }
}
