# Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                  │
│                                                     │
│  ┌──────────┐   ┌──────────────────────────────┐   │
│  │ Sidebar  │   │         App.jsx (State)        │   │
│  │ (Nav +   │◄──│  aeRows, signalResults,        │   │
│  │  Dark    │   │  ctdResults, activeView        │   │
│  │  Mode)   │   └──────────────┬───────────────┘   │
│  └──────────┘                  │                    │
│                    ┌───────────┼───────────┐        │
│                    ▼           ▼           ▼        │
│             ┌──────────┐ ┌─────────┐ ┌─────────┐  │
│             │Dashboard │ │ Signal  │ │   CTD   │  │
│             │  .jsx    │ │Detection│ │ Checker │  │
│             └──────────┘ └────┬────┘ └────┬────┘  │
│                               │           │        │
│                    ┌──────────┘           │        │
│                    ▼                      ▼        │
│          ┌──────────────────┐  ┌──────────────────┐│
│          │ signalDetection  │  │   ctdChecker.js  ││
│          │     .js          │  │  (Levenshtein    ││
│          │ PRR/ROR/Chi-sq   │  │   fuzzy match)   ││
│          └──────────────────┘  └──────────────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │              sampleData.js                   │   │
│  │  221 synthetic AE rows + CTD reference (60)  │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Component Tree

```
App.jsx
├── Sidebar.jsx
├── Dashboard.jsx
├── SignalDetection.jsx
│   └── (Recharts: ScatterChart, LineChart, BarChart)
└── SubmissionReadiness.jsx
    └── (Recharts: BarChart + custom SVG Gauge)
```

## Data Flow

```
CSV Upload → PapaParse → App.jsx state
                                │
                                ▼
                     signalDetection.js
                     buildContingencyTables()
                     computePRR() / computeROR()
                     computeChiSquare()
                     computePRR_CI()
                     computeSeverityWeight()
                     determineSignalStatus()
                                │
                                ▼
                     SignalDetection.jsx
                     (renders table + charts)
```

## Key Files

| File | Responsibility |
|------|---------------|
| `src/App.jsx` | Root state, CSV/TOC upload handlers, view routing |
| `src/utils/signalDetection.js` | All PV statistical algorithms |
| `src/utils/ctdChecker.js` | Levenshtein fuzzy matcher + CTD gap logic |
| `src/data/sampleData.js` | Synthetic AE dataset + ICH M4 CTD reference structure |
| `src/components/Dashboard.jsx` | Overview stats + navigation cards |
| `src/components/SignalDetection.jsx` | Signal table, charts, detail panel |
| `src/components/SubmissionReadiness.jsx` | Gauge, module scores, gap table |
| `src/index.css` | Tailwind layers + custom component tokens |
