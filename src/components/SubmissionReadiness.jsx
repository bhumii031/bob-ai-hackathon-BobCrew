import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
  CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronRight,
  Download, Upload, Filter, AlertTriangle, ShieldAlert, Info,
  FileCheck2,
} from 'lucide-react'

// ─── Gauge SVG ────────────────────────────────────────────────────────────────
function Gauge({ score }) {
  const radius = 80
  const cx = 100, cy = 100
  const circumference = Math.PI * radius  // half circle arc
  const offset = circumference * (1 - score / 100)

  const color = score >= 80 ? '#16A34A' : score >= 60 ? '#D97706' : '#DC2626'

  return (
    <svg viewBox="0 0 200 120" className="w-full max-w-xs mx-auto">
      {/* Track */}
      <path
        d={`M ${cx - radius},${cy} A ${radius},${radius} 0 0,1 ${cx + radius},${cy}`}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="16"
        strokeLinecap="round"
        className="dark:stroke-slate-700"
      />
      {/* Fill */}
      <path
        d={`M ${cx - radius},${cy} A ${radius},${radius} 0 0,1 ${cx + radius},${cy}`}
        fill="none"
        stroke={color}
        strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
      />
      {/* Score text */}
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-slate-800 dark:fill-slate-100" fontSize="28" fontWeight="700" fill="#1e293b">
        {score}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#94a3b8">
        Readiness Score
      </text>
    </svg>
  )
}

// ─── Status icon ──────────────────────────────────────────────────────────────
function StatusIcon({ status }) {
  if (status === 'Present') return <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
  if (status === 'Partial') return <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
  return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
}

// ─── Severity badge ───────────────────────────────────────────────────────────
function SeverityBadge({ severity }) {
  const cls = {
    Critical: 'badge badge-critical',
    High: 'badge bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    Medium: 'badge badge-warning',
    Low: 'badge badge-neutral',
  }[severity] || 'badge badge-neutral'
  return <span className={cls}>{severity}</span>
}

// ─── Module row in checklist ──────────────────────────────────────────────────
function ModuleTree({ mod, gapFilter }) {
  const [expanded, setExpanded] = useState(true)

  const visibleItems = gapFilter === 'all'
    ? mod.items
    : gapFilter === 'gaps'
    ? mod.items.filter(i => i.status !== 'Present')
    : mod.items.filter(i => i.status !== 'Present' && i.severity === gapFilter)

  const scoreColor = mod.score >= 80
    ? 'text-green-600 dark:text-green-400'
    : mod.score >= 60
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-600 dark:text-red-400'

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {/* Module header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors text-left"
        onClick={() => setExpanded(v => !v)}
      >
        {expanded
          ? <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
        }
        <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex-1">
          {mod.title}
        </span>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-green-600 dark:text-green-400 font-medium">{mod.present}✓</span>
          {mod.partial > 0 && <span className="text-amber-500 font-medium">{mod.partial}~</span>}
          {mod.missing > 0 && <span className="text-red-500 font-medium">{mod.missing}✗</span>}
          <span className={`font-bold text-sm ${scoreColor}`}>{mod.score}%</span>
        </div>
      </button>

      {/* Items */}
      {expanded && visibleItems.length > 0 && (
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {visibleItems.map(item => (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
                item.status === 'Missing' ? 'bg-red-50/30 dark:bg-red-900/5' :
                item.status === 'Partial' ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''
              }`}
            >
              <StatusIcon status={item.status} />
              <span className={`flex-1 ${item.status === 'Missing' ? 'text-slate-600 dark:text-slate-400 line-through decoration-red-300' : 'text-slate-700 dark:text-slate-300'}`}>
                {item.label}
              </span>
              <span className="text-xs text-slate-400 font-mono mr-2">{item.id}</span>
              <SeverityBadge severity={item.severity} />
              <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded ${
                item.status === 'Present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                item.status === 'Partial' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
      {expanded && visibleItems.length === 0 && (
        <div className="px-4 py-3 text-sm text-slate-400 italic">
          No items match the current filter.
        </div>
      )}
    </div>
  )
}

// ─── Main Submission Readiness View ──────────────────────────────────────────
export default function SubmissionReadiness({ ctdResults, onFileUpload, onTOCInput }) {
  const [gapFilter, setGapFilter] = useState('all')
  const [showUpload, setShowUpload] = useState(false)
  const [tocText, setTocText] = useState('')
  const [showTOCInput, setShowTOCInput] = useState(false)

  const { moduleResults, overallScore, totalItems, totalPresent, totalPartial, totalMissing, gaps, riskLevel, riskReason } = ctdResults

  const riskConfig = {
    High: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" /> },
    Medium: { color: 'text-amber-600 dark:text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: <AlertTriangle className="w-5 h-5 text-amber-500" /> },
    Low: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', icon: <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" /> },
  }
  const risk = riskConfig[riskLevel]

  // Bar chart data
  const barData = moduleResults.map(m => ({
    name: `M${m.module}`,
    fullTitle: m.title,
    score: m.score,
    fill: m.score >= 80 ? '#16A34A' : m.score >= 60 ? '#D97706' : '#DC2626',
  }))

  function handleExport() {
    const lines = [
      'CTD Gap Report — Sentinel',
      `Overall Readiness: ${overallScore}%`,
      `Submission Risk: ${riskLevel}`,
      `${riskReason}`,
      '',
      'Module,Item ID,Label,Severity,Status,Match Score',
    ]
    for (const mod of moduleResults) {
      for (const item of mod.items) {
        lines.push(`"${mod.title}","${item.id}","${item.label}","${item.severity}","${item.status}","${item.matchScore}"`)
      }
    }
    const csv = lines.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'sentinel_ctd_gap_report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Submission Readiness</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            ICH M4 CTD gap analysis — automated completeness scoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={() => setShowUpload(v => !v)}>
            <Upload className="w-4 h-4" />
            Upload TOC
          </button>
          <button className="btn-secondary" onClick={() => setShowTOCInput(v => !v)}>
            <FileCheck2 className="w-4 h-4" />
            Paste TOC
          </button>
          <button className="btn-primary" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export Gap Report
          </button>
        </div>
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div className="mx-8 mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-semibold text-teal-800 dark:text-teal-300">Upload Dossier TOC (plain text)</span>
          </div>
          <p className="text-xs text-teal-600 dark:text-teal-400 mb-3">
            Upload a plain .txt file containing your CTD table of contents, one item per line.
          </p>
          <input
            type="file"
            accept=".txt,.csv"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onFileUpload(e.target.files[0])
                setShowUpload(false)
              }
            }}
            className="block text-sm text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer"
          />
        </div>
      )}

      {/* TOC Paste panel */}
      {showTOCInput && (
        <div className="mx-8 mt-4 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <FileCheck2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Paste Dossier TOC</span>
          </div>
          <textarea
            rows={8}
            value={tocText}
            onChange={e => setTocText(e.target.value)}
            placeholder="Paste your dossier table of contents here, one item per line…"
            className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg p-3 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none font-mono"
          />
          <div className="flex gap-3 mt-3">
            <button
              className="btn-primary bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800"
              onClick={() => { onTOCInput(tocText); setShowTOCInput(false) }}
              disabled={!tocText.trim()}
            >
              <FileCheck2 className="w-4 h-4" />
              Analyse TOC
            </button>
            <button className="btn-secondary" onClick={() => setShowTOCInput(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="px-8 py-6 space-y-6">
        {/* Top row: Gauge + Bar chart + Risk card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gauge */}
          <div className="card p-5 flex flex-col items-center">
            <h3 className="section-title mb-3 self-start">Overall Readiness</h3>
            <Gauge score={overallScore} />
            <div className="mt-3 w-full grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                <div className="font-bold text-green-700 dark:text-green-400 text-lg">{totalPresent}</div>
                <div className="text-slate-500 dark:text-slate-400">Present</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                <div className="font-bold text-amber-600 dark:text-amber-400 text-lg">{totalPartial}</div>
                <div className="text-slate-500 dark:text-slate-400">Partial</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                <div className="font-bold text-red-600 dark:text-red-400 text-lg">{totalMissing}</div>
                <div className="text-slate-500 dark:text-slate-400">Missing</div>
              </div>
            </div>
          </div>

          {/* Per-module bar chart */}
          <div className="card p-5">
            <h3 className="section-title mb-4">Completeness by Module</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip
                  formatter={(v, n, p) => [`${v}%`, p.payload.fullTitle]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk summary */}
          <div className="card p-5">
            <h3 className="section-title mb-4">Submission Risk Summary</h3>
            <div className={`${risk.bg} ${risk.border} border rounded-xl p-4 mb-4`}>
              <div className="flex items-center gap-3 mb-2">
                {risk.icon}
                <span className={`text-lg font-bold ${risk.color}`}>{riskLevel} Risk</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{riskReason}</p>
            </div>

            {/* Gap summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                  Critical gaps
                </span>
                <span className="font-bold text-red-600 dark:text-red-400">{gaps.critical.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" />
                  High-severity gaps
                </span>
                <span className="font-bold text-orange-600 dark:text-orange-400">{gaps.high.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                  Medium-severity gaps
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{gaps.medium.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <span className="text-slate-500 dark:text-slate-400">Total checklist items</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{totalItems}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checklist Tree */}
        <div>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <h3 className="section-title">CTD Checklist</h3>
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-slate-400" />
              <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 text-xs font-medium">
                {[
                  { v: 'all', label: 'All Items' },
                  { v: 'gaps', label: 'Gaps Only' },
                  { v: 'Critical', label: 'Critical' },
                  { v: 'High', label: 'High' },
                ].map(({ v, label }) => (
                  <button
                    key={v}
                    onClick={() => setGapFilter(v)}
                    className={`px-3 py-1.5 transition-colors ${
                      gapFilter === v
                        ? 'bg-sky-500 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {moduleResults.map(mod => (
              <ModuleTree key={mod.module} mod={mod} gapFilter={gapFilter} />
            ))}
          </div>
        </div>

        {/* Gap Report Panel */}
        {gaps.all.length > 0 && (
          <div className="card">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="section-title">Gap Report</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {gaps.all.length} items require attention before submission
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Module</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Item ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Required Section</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {gaps.all
                    .sort((a, b) => {
                      const sev = { Critical: 0, High: 1, Medium: 2, Low: 3 }
                      return (sev[a.severity] ?? 4) - (sev[b.severity] ?? 4)
                    })
                    .map((item, i) => {
                      // Find module name
                      const mod = ctdResults.moduleResults.find(m =>
                        m.items.some(it => it.id === item.id)
                      )
                      return (
                        <tr key={i} className={`border-b border-slate-100 dark:border-slate-700 ${
                          item.severity === 'Critical' ? 'bg-red-50/30 dark:bg-red-900/10' :
                          item.severity === 'High' ? 'bg-orange-50/20 dark:bg-orange-900/5' : ''
                        }`}>
                          <td className="px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            M{mod?.module}
                          </td>
                          <td className="px-4 py-2.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                            {item.id}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300">
                            {item.label}
                          </td>
                          <td className="px-4 py-2.5">
                            <SeverityBadge severity={item.severity} />
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <StatusIcon status={item.status} />
                              <span className={`text-xs font-semibold ${
                                item.status === 'Partial' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
