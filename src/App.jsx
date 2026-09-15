import React, { useState, useMemo, useCallback, useEffect } from 'react'
import Papa from 'papaparse'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import SignalDetection from './components/SignalDetection.jsx'
import SubmissionReadiness from './components/SubmissionReadiness.jsx'
import { generateSampleAEData, SAMPLE_DOSSIER_TOC } from './data/sampleData.js'
import { runSignalDetection } from './utils/signalDetection.js'
import { runCTDCheck } from './utils/ctdChecker.js'

// Pre-load sample data at module level (fast, avoids recompute on re-render)
const SAMPLE_ROWS = generateSampleAEData()
const SAMPLE_SIGNAL_RESULTS = runSignalDetection(SAMPLE_ROWS)
const SAMPLE_CTD_RESULTS = runCTDCheck(SAMPLE_DOSSIER_TOC)

// Required CSV columns — defined at module level so they are not recreated on every render
const REQUIRED_AE_COLUMNS = [
  'drug_name', 'adverse_event', 'patient_age',
  'patient_sex', 'report_date', 'outcome', 'reporter_type',
]

const MAX_AE_ROWS = 50_000

function formatLastUpdated() {
  return new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(formatLastUpdated())

  // Signal Detection state
  const [aeRows, setAERows] = useState(SAMPLE_ROWS)
  const [signalResults, setSignalResults] = useState(SAMPLE_SIGNAL_RESULTS)
  const [uploadError, setUploadError] = useState(null)   // null | { type: 'error'|'warning', message: string }

  // CTD state
  const [ctdResults, setCtdResults] = useState(SAMPLE_CTD_RESULTS)

  // Apply dark mode class to <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // ── Signal Detection file upload ──────────────────────────────────────────
  const handleAEUpload = useCallback((file) => {
    setUploadError(null)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parsed) => {
        const presentColumns = parsed.meta?.fields || []
        const missingColumns = REQUIRED_AE_COLUMNS.filter(col => !presentColumns.includes(col))

        if (missingColumns.length > 0) {
          setUploadError({
            type: 'error',
            message: `Missing required column(s): ${missingColumns.join(', ')}. Required: ${REQUIRED_AE_COLUMNS.join(', ')}`,
          })
          return
        }

        const totalParsed = parsed.data.length
        const rows = parsed.data
          .slice(0, MAX_AE_ROWS)
          .map((row, i) => ({
            id: i + 1,
            drug_name: row.drug_name.trim(),
            adverse_event: row.adverse_event.trim(),
            patient_age: parseInt(row.patient_age) || 0,
            patient_sex: row.patient_sex.trim(),
            report_date: row.report_date.trim(),
            outcome: (row.outcome.trim() || 'non-serious').toLowerCase(),
            reporter_type: row.reporter_type.trim(),
          }))
          .filter(r => r.drug_name && r.adverse_event)

        if (rows.length === 0) {
          setUploadError({
            type: 'error',
            message: 'No valid rows found. Every row must have a non-empty drug_name and adverse_event.',
          })
          return
        }

        if (totalParsed > MAX_AE_ROWS) {
          setUploadError({
            type: 'warning',
            message: `File has ${totalParsed.toLocaleString()} rows — only the first ${MAX_AE_ROWS.toLocaleString()} were loaded to keep the browser responsive.`,
          })
        }

        const results = runSignalDetection(rows)
        setAERows(rows)
        setSignalResults(results)
        setLastUpdated(formatLastUpdated())
      },
      error: (err) => {
        console.error('CSV parse error:', err)
        setUploadError({ type: 'error', message: 'Failed to parse CSV. Please check the file format.' })
      },
    })
  }, [])

  // ── CTD file upload (plain text TOC) ────────────────────────────────────
  const handleCTDUpload = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      if (text?.trim()) {
        const results = runCTDCheck(text)
        setCtdResults(results)
        setLastUpdated(formatLastUpdated())
      }
    }
    reader.readAsText(file)
  }, [])

  // ── CTD paste input ────────────────────────────────────────────────────
  const handleCTDTextInput = useCallback((text) => {
    if (text?.trim()) {
      const results = runCTDCheck(text)
      setCtdResults(results)
      setLastUpdated(formatLastUpdated())
    }
  }, [])

  // Summary stats for dashboard
  const signalStats = useMemo(() => ({
    totalReports: aeRows.length,
    uniquePairs: signalResults.length,
    signalsFlagged: signalResults.filter(r =>
      r.signalStatus === 'Signal' || r.signalStatus === 'Critical Signal'
    ).length,
    criticalSignals: signalResults.filter(r => r.signalStatus === 'Critical Signal').length,
  }), [aeRows, signalResults])

  const ctdStats = useMemo(() => ({
    overallScore: ctdResults.overallScore,
    riskLevel: ctdResults.riskLevel,
    totalMissing: ctdResults.totalMissing,
  }), [ctdResults])

  return (
    <div className={`flex min-h-screen bg-slate-50 dark:bg-slate-950`}>
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(v => !v)}
        lastUpdated={lastUpdated}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900">
        {activeView === 'dashboard' && (
          <Dashboard
            onNavigate={setActiveView}
            signalStats={signalStats}
            ctdStats={ctdStats}
          />
        )}
        {activeView === 'signal' && (
          <SignalDetection
            results={signalResults}
            rows={aeRows}
            onFileUpload={handleAEUpload}
            uploadError={uploadError}
            onClearUploadError={() => setUploadError(null)}
          />
        )}
        {activeView === 'ctd' && (
          <SubmissionReadiness
            ctdResults={ctdResults}
            onFileUpload={handleCTDUpload}
            onTOCInput={handleCTDTextInput}
          />
        )}
      </main>
    </div>
  )
}
