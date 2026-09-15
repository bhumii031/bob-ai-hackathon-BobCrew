import React from 'react'
import { Activity, FileCheck2, AlertTriangle, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react'

export default function Dashboard({ onNavigate, signalStats, ctdStats }) {
  const { totalReports, uniquePairs, signalsFlagged, criticalSignals } = signalStats
  const { overallScore, riskLevel, totalMissing } = ctdStats

  const riskColors = {
    High: 'text-red-600 dark:text-red-400',
    Medium: 'text-amber-600 dark:text-amber-500',
    Low: 'text-green-600 dark:text-green-500',
  }

  const riskBadges = {
    High: 'badge-critical',
    Medium: 'badge-warning',
    Low: 'badge-pass',
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-8 py-7 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Intelligence Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Pharmacovigilance signal monitoring and regulatory submission readiness at a glance.
        </p>
      </div>

      <div className="px-8 py-6 space-y-8">
        {/* Mode Selector Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Signal Detection Card */}
          <div
            className="card p-6 cursor-pointer hover:shadow-card-hover transition-shadow duration-200 group"
            onClick={() => onNavigate('signal')}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 shadow-md">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Signal Detection
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    PRR · ROR · Chi-square
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all duration-150 mt-1" />
            </div>

            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Automated disproportionality analysis on adverse event spontaneous reports.
              Flags drug–event signals using PRR ≥ 2, χ² ≥ 4, and case count ≥ 3 criteria.
            </p>

            {/* Mini stats */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{totalReports}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Reports</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="text-xl font-bold text-red-600 dark:text-red-400">{criticalSignals}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Critical Signals</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{signalsFlagged}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Signals</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{uniquePairs}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Drug–Event Pairs</div>
              </div>
            </div>

            <button
              className="mt-5 w-full btn-primary justify-center"
              onClick={(e) => { e.stopPropagation(); onNavigate('signal') }}
            >
              <Activity className="w-4 h-4" />
              Open Signal Detection
            </button>
          </div>

          {/* Submission Readiness Card */}
          <div
            className="card p-6 cursor-pointer hover:shadow-card-hover transition-shadow duration-200 group"
            onClick={() => onNavigate('ctd')}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-md">
                  <FileCheck2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Submission Readiness
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    ICH M4 CTD Gap Analysis
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all duration-150 mt-1" />
            </div>

            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Automated dossier gap analysis against the ICH M4 CTD reference structure.
              Identifies missing or incomplete sections across all 5 modules.
            </p>

            {/* Mini stats */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{overallScore}%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Overall Readiness</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className={`text-xl font-bold ${riskColors[riskLevel]}`}>{riskLevel}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Submission Risk</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="text-xl font-bold text-red-600 dark:text-red-400">{totalMissing}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Missing Items</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">5</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Modules Checked</div>
              </div>
            </div>

            <button
              className="mt-5 w-full btn-primary justify-center bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800"
              onClick={(e) => { e.stopPropagation(); onNavigate('ctd') }}
            >
              <FileCheck2 className="w-4 h-4" />
              Open CTD Checker
            </button>
          </div>
        </div>

        {/* Status Overview */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Current Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Signal alert */}
            <div className="card p-4 flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {criticalSignals} Critical Signal{criticalSignals !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Require immediate review
                </div>
              </div>
            </div>

            {/* Readiness */}
            <div className="card p-4 flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {overallScore}% Dossier Complete
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {totalMissing} missing CTD items
                </div>
              </div>
            </div>

            {/* Compliance */}
            <div className="card p-4 flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  ICH M4 Framework
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Reference structure active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
