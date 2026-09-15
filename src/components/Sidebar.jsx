import React from 'react'
import {
  LayoutDashboard,
  Activity,
  FileCheck2,
  Moon,
  Sun,
  Shield,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'signal', label: 'Signal Detection', icon: Activity },
  { id: 'ctd', label: 'Submission Readiness', icon: FileCheck2 },
]

export default function Sidebar({ activeView, onNavigate, darkMode, onToggleDark, lastUpdated }) {
  return (
    <aside className="flex flex-col w-64 min-h-screen bg-[#0F1B2D] text-white flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-teal-600 shadow-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-[15px] font-bold tracking-tight leading-tight">Sentinel</div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest leading-tight mt-0.5">
            PV &amp; Regulatory
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Modules
          </span>
        </div>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full sidebar-link ${
              activeView === id ? 'sidebar-link-active' : 'sidebar-link-inactive'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            {activeView === id && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10 space-y-3">
        {/* Last updated */}
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <RefreshCw className="w-3 h-3" />
          <span>Updated {lastUpdated}</span>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150 text-sm font-medium"
        >
          {darkMode ? (
            <>
              <Sun className="w-4 h-4" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Version badge */}
        <div className="text-center">
          <span className="text-[10px] text-slate-600 font-mono">v1.0.0 · ICH M4 Compliant</span>
        </div>
      </div>
    </aside>
  )
}
