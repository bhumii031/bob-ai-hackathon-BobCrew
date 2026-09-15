import React, { useState, useMemo } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Download,
  Filter,
  ChevronDown,
  ChevronRight,
  Activity,
  Upload,
} from 'lucide-react'
import { generateTrendData } from '../utils/signalDetection.js'

// ─── Badge helpers ────────────────────────────────────────────────────────────
function SignalBadge({ status }) {
  const cls = {
    'Critical Signal': 'badge badge-critical',
    'Signal': 'badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Watch': 'badge bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    'No Signal': 'badge badge-neutral',
  }[status] || 'badge badge-neutral'

  const icons = {
    'Critical Signal': <AlertTriangle className="w-3 h-3" />,
    'Signal': <AlertTriangle className="w-3 h-3" />,
    'Watch': <Eye className="w-3 h-3" />,
    'No Signal': <CheckCircle2 className="w-3 h-3" />,
  }

  return (
    <span className={cls}>
      {icons[status]}
      {status}
    </span>
  )
}

function ThresholdDot({ pass }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full mr-1 ${pass ? 'bg-green-500' : 'bg-red-400'}`} />
  )
}

// ─── Scatter chart tooltip ────────────────────────────────────────────────────
function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 shadow-lg text-xs">
      <div className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
        {d.drug} — {d.event}
      </div>
      <div className="space-y-0.5 text-slate-600 dark:text-slate-400">
        <div>Cases (a): <span className="font-medium text-slate-800 dark:text-slate-200">{d.a}</span></div>
        <div>PRR: <span className="font-medium text-slate-800 dark:text-slate-200">{d.prr}</span></div>
        <div>χ²: <span className="font-medium text-slate-800 dark:text-slate-200">{d.chiSquare}</span></div>
        <div>Status: <span className="font-medium">{d.signalStatus}</span></div>
      </div>
    </div>
  )
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function DetailPanel({ signal, rows, onClose }) {
  const trendData = useMemo(
    () => generateTrendData(rows, signal.drug, signal.event),
    [rows, signal.drug, signal.event]
  )

  const { a, b, c, d, N, prr, ror, chiSquare, ciLower, ciUpper, outcomes, thresholds, severityWeight } = signal

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {signal.drug}
              </h2>
              <span className="text-slate-400">+</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {signal.event}
              </h2>
              <SignalBadge status={signal.signalStatus} />
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Signal calculation breakdown &amp; supporting data
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 2×2 Contingency Table */}
          <div>
            <h3 className="section-title mb-3">2×2 Contingency Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800">
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300 border-b border-r border-slate-200 dark:border-slate-700 w-36"></th>
                    <th className="px-4 py-2.5 text-center font-semibold text-sky-600 dark:text-sky-400 border-b border-r border-slate-200 dark:border-slate-700">
                      {signal.event}
                    </th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-600 dark:text-slate-300 border-b border-r border-slate-200 dark:border-slate-700">
                      Other Events
                    </th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-2.5 font-semibold text-sky-600 dark:text-sky-400 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                      {signal.drug}
                    </td>
                    <td className="px-4 py-2.5 text-center font-bold text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700">
                      <span className="text-sky-600 dark:text-sky-400 font-bold">a</span> = {a}
                    </td>
                    <td className="px-4 py-2.5 text-center text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 font-medium">b</span> = {b}
                    </td>
                    <td className="px-4 py-2.5 text-center font-medium text-slate-700 dark:text-slate-300">
                      {a + b}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                      Other Drugs
                    </td>
                    <td className="px-4 py-2.5 text-center text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 font-medium">c</span> = {c}
                    </td>
                    <td className="px-4 py-2.5 text-center text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 font-medium">d</span> = {d}
                    </td>
                    <td className="px-4 py-2.5 text-center font-medium text-slate-700 dark:text-slate-300">
                      {c + d}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                      Total
                    </td>
                    <td className="px-4 py-2.5 text-center font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                      {a + c}
                    </td>
                    <td className="px-4 py-2.5 text-center font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                      {b + d}
                    </td>
                    <td className="px-4 py-2.5 text-center font-bold text-slate-800 dark:text-slate-100">
                      N = {N}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div>
            <h3 className="section-title mb-3">Calculation Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PRR */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">PRR</span>
                  <ThresholdDot pass={thresholds.prr} />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {prr?.toFixed(2) ?? '—'}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  95% CI: [{ciLower?.toFixed(2) ?? '—'}, {ciUpper?.toFixed(2) ?? '—'}]
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  (a/(a+b)) / (c/(c+d))
                </div>
                <div className={`mt-2 text-xs font-semibold ${thresholds.prr ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {thresholds.prr ? '✓ ≥ 2.0 threshold met' : '✗ < 2.0 threshold'}
                </div>
              </div>

              {/* ROR */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">ROR</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {ror?.toFixed(2) ?? '—'}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  (a×d) / (b×c)
                </div>
              </div>

              {/* Chi-square */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chi-square (Yates)</span>
                  <ThresholdDot pass={thresholds.chiSquare} />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {chiSquare?.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  N·(|ad-bc|-N/2)² / [(a+b)(c+d)(a+c)(b+d)]
                </div>
                <div className={`mt-2 text-xs font-semibold ${thresholds.chiSquare ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {thresholds.chiSquare ? '✓ ≥ 4.0 threshold met' : '✗ < 4.0 threshold'}
                </div>
              </div>

              {/* Case count + severity */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cases &amp; Severity</span>
                  <ThresholdDot pass={thresholds.n} />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{a}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {outcomes.deaths > 0 && <span className="text-red-600 dark:text-red-400 font-semibold">{outcomes.deaths} death{outcomes.deaths !== 1 ? 's' : ''} · </span>}
                  {outcomes.serious} serious · {outcomes.nonSerious} non-serious
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Severity weight: {severityWeight?.toFixed(2)}/3.00
                </div>
                <div className={`mt-2 text-xs font-semibold ${thresholds.n ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {thresholds.n ? '✓ ≥ 3 cases threshold met' : '✗ < 3 cases threshold'}
                </div>
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          {trendData.length > 1 && (
            <div>
              <h3 className="section-title mb-3">Temporal Trend</h3>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Reports"
                      stroke="#0EA5E9"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#0EA5E9' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sortable column header ───────────────────────────────────────────────────
function SortHeader({ label, field, sortField, sortDir, onSort }) {
  const active = sortField === field
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {active ? (
          sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-40" />
        )}
      </div>
    </th>
  )
}

// ─── Main Signal Detection View ───────────────────────────────────────────────
export default function SignalDetection({ results, rows, onFileUpload, uploadError, onClearUploadError }) {
  const [sortField, setSortField] = useState('signalStatus')
  const [sortDir, setSortDir] = useState('asc')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDrug, setFilterDrug] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSignal, setSelectedSignal] = useState(null)
  const [showUpload, setShowUpload] = useState(false)

  const STATUS_ORDER = { 'Critical Signal': 0, 'Signal': 1, 'Watch': 2, 'No Signal': 3 }

  // Summary stats
  const totalReports = rows.length
  const uniquePairs = results.length
  const signals = results.filter(r => r.signalStatus === 'Signal' || r.signalStatus === 'Critical Signal')
  const criticalSignals = results.filter(r => r.signalStatus === 'Critical Signal')
  const watchSignals = results.filter(r => r.signalStatus === 'Watch')

  const drugs = useMemo(() => [...new Set(results.map(r => r.drug))], [results])

  // Filtered & sorted results
  const filtered = useMemo(() => {
    let out = [...results]
    if (filterStatus !== 'all') out = out.filter(r => r.signalStatus === filterStatus)
    if (filterDrug !== 'all') out = out.filter(r => r.drug === filterDrug)
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      out = out.filter(r => r.drug.toLowerCase().includes(q) || r.event.toLowerCase().includes(q))
    }
    out.sort((a, b) => {
      let av = a[sortField]
      let bv = b[sortField]
      if (sortField === 'signalStatus') {
        av = STATUS_ORDER[av]
        bv = STATUS_ORDER[bv]
      }
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv
      return sortDir === 'asc' ? cmp : -cmp
    })
    return out
  }, [results, filterStatus, filterDrug, searchTerm, sortField, sortDir])

  // Scatter chart data — all pairs with valid prr
  const scatterData = useMemo(
    () => results.filter(r => r.prr !== null).map(r => ({
      ...r,
      x: r.a,
      y: r.prr,
      z: Math.max(r.chiSquare * 3, 20),
    })),
    [results]
  )

  function handleSort(field) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const dotColor = (d) => {
    if (d.signalStatus === 'Critical Signal') return '#DC2626'
    if (d.signalStatus === 'Signal') return '#D97706'
    if (d.signalStatus === 'Watch') return '#0EA5E9'
    return '#94A3B8'
  }

  function handleExport() {
    const headers = ['Drug', 'Event', 'Cases (a)', 'PRR', 'ROR', 'Chi-square', 'CI Lower', 'CI Upper', 'Signal Status', 'Deaths', 'Serious']
    const rows2 = filtered.map(r => [
      r.drug, r.event, r.a, r.prr ?? '', r.ror ?? '',
      r.chiSquare, r.ciLower ?? '', r.ciUpper ?? '',
      r.signalStatus, r.outcomes.deaths, r.outcomes.serious
    ])
    const csv = [headers, ...rows2].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'sentinel_signal_report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Signal Detection</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Disproportionality analysis · PRR · ROR · Chi-square (Yates)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="btn-secondary"
            onClick={() => setShowUpload(v => !v)}
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </button>
          <button className="btn-primary" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div className="mx-8 mt-4 p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Upload className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="text-sm font-semibold text-sky-800 dark:text-sky-300">Upload Adverse Events CSV</span>
          </div>
          <p className="text-xs text-sky-600 dark:text-sky-400 mb-3">
            Required columns: drug_name, adverse_event, patient_age, patient_sex, report_date, outcome, reporter_type
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onClearUploadError?.()
                onFileUpload(e.target.files[0])
                setShowUpload(false)
              }
            }}
            className="block text-sm text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500 file:text-white hover:file:bg-sky-600 cursor-pointer"
          />
        </div>
      )}

      {/* Inline upload feedback — error or warning */}
      {uploadError && (
        <div className={`mx-8 mt-3 flex items-start gap-3 p-3 rounded-xl border text-sm ${
          uploadError.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'
            : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400'
        }`}>
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="flex-1">{uploadError.message}</span>
          <button
            onClick={onClearUploadError}
            className="shrink-0 opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="px-8 py-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{totalReports}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Total Reports</div>
          </div>
          <div className="stat-card">
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{uniquePairs}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Drug–Event Pairs</div>
          </div>
          <div className="stat-card">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{signals.length}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Signals Flagged</div>
          </div>
          <div className="stat-card">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{criticalSignals.length}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Critical Signals</div>
          </div>
        </div>

        {/* Scatter Chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title">Signal Landscape</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                X = case count · Y = PRR · dot size ∝ chi-square · color = signal status
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600" /> Critical</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" /> Signal</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-500" /> Watch</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400" /> None</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis
                dataKey="x"
                name="Cases"
                type="number"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Case Count (a)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis
                dataKey="y"
                name="PRR"
                type="number"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'PRR', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                width={45}
              />
              <Tooltip content={<ScatterTooltip />} />
              <ReferenceLine y={2} stroke="#D97706" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'PRR=2', fill: '#D97706', fontSize: 10, position: 'right' }} />
              <Scatter data={scatterData} onClick={(d) => setSelectedSignal(d)}>
                {scatterData.map((entry, i) => (
                  <Cell key={i} fill={dotColor(entry)} fillOpacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Filter className="w-4 h-4" /> Filter:
          </div>
          {/* Status filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="Critical Signal">Critical Signal</option>
              <option value="Signal">Signal</option>
              <option value="Watch">Watch</option>
              <option value="No Signal">No Signal</option>
            </select>
            <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          {/* Drug filter */}
          <div className="relative">
            <select
              value={filterDrug}
              onChange={e => setFilterDrug(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="all">All Drugs</option>
              {drugs.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          {/* Search */}
          <input
            type="text"
            placeholder="Search drug or event…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 min-w-[200px]"
          />
          <span className="text-xs text-slate-500 ml-1">
            {filtered.length} of {results.length} pairs
          </span>
        </div>

        {/* Data Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <SortHeader label="Drug" field="drug" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Adverse Event" field="event" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Cases (a)" field="a" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="PRR" field="prr" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="ROR" field="ror" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="χ²" field="chiSquare" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">95% CI</th>
                  <SortHeader label="Status" field="signalStatus" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const rowBg = r.signalStatus === 'Critical Signal'
                    ? 'bg-red-50/40 dark:bg-red-900/10'
                    : r.signalStatus === 'Signal'
                    ? 'bg-amber-50/40 dark:bg-amber-900/10'
                    : ''
                  return (
                    <tr key={i} className={`${rowBg} border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors`}>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                        {r.drug}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {r.event}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {r.a}
                        {r.outcomes.deaths > 0 && (
                          <span className="ml-1 text-red-500 text-xs" title={`${r.outcomes.deaths} death(s)`}>
                            {r.outcomes.deaths}⚠
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={r.thresholds.prr ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
                          {r.prr?.toFixed(2) ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {r.ror?.toFixed(2) ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={r.thresholds.chiSquare ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
                          {r.chiSquare?.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {r.ciLower != null
                          ? `[${r.ciLower.toFixed(2)}, ${r.ciUpper.toFixed(2)}]`
                          : '—'
                        }
                      </td>
                      <td className="px-4 py-3">
                        <SignalBadge status={r.signalStatus} />
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {r.severityWeight?.toFixed(1)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedSignal(r)}
                          className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              No pairs match the current filters.
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSignal && (
        <DetailPanel
          signal={selectedSignal}
          rows={rows}
          onClose={() => setSelectedSignal(null)}
        />
      )}
    </div>
  )
}
