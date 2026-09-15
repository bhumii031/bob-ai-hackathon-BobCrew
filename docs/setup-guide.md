# Setup Guide — Sentinel

Complete instructions to clone, configure, and run the Sentinel app locally.

---

## Prerequisites

| Requirement | Minimum Version | Check |
|-------------|----------------|-------|
| Node.js | 18.x or higher | `node --version` |
| npm | 9.x or higher | `npm --version` |
| Git | Any recent version | `git --version` |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/bhumii031/bob-ai-hackathon-BobCrew.git
cd bob-ai-hackathon-BobCrew
```

---

## Step 2 — Install Dependencies

```bash
npm install
```

This installs all packages listed in `package.json` including React, Vite, Tailwind CSS, Recharts, and PapaParse.

> **Note:** Do NOT commit the `node_modules/` folder. It is excluded by `.gitignore`.

---

## Step 3 — Configure Environment

**No `.env` file is needed.**

Sentinel is a fully client-side application. All computation runs in the browser using built-in sample data. There are no API keys, no server endpoints, and no external services to configure.

---

## Step 4 — Run the Project

### Development Mode (recommended)
```bash
npm run dev
```
- Opens automatically at **http://localhost:5173**
- Hot-reload enabled — changes reflect instantly
- Sample data (221 AE reports + CTD dossier) is pre-loaded

### Production Build
```bash
npm run build
```
- Outputs optimised static files to `dist/`
- Bundle: ~644 KB JS + ~35 KB CSS

### Preview Production Build
```bash
npm run preview
```
- Serves the `dist/` folder locally at **http://localhost:4173**

---

## Using the App

### Signal Detection (Mode 1)

1. Click **Signal Detection** in the left sidebar
2. The app loads with 221 pre-built synthetic AE reports — results appear immediately
3. To use your own data, click **Upload CSV** and provide a file with these columns:

```
drug_name, adverse_event, patient_age, patient_sex, report_date, outcome, reporter_type
```

4. Use the **filter bar** to search by drug or AE term
5. Click any row in the results table to open the **detail panel** (2×2 table, trend chart, threshold breakdown)
6. Click **Export CSV** to download the full signal results

### Submission Readiness — CTD Checker (Mode 2)

1. Click **Submission Readiness** in the left sidebar
2. The app loads with a sample dossier (~75% complete) — results appear immediately
3. To check your own dossier, either:
   - **Upload a `.txt` file** containing your TOC (one section per line), or
   - **Paste your TOC** directly into the text area and click **Run Check**
4. Review the module-by-module completeness scores and the gap table
5. Click **Export Gap Report** to download a CSV of all missing/partial items

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `npm install` fails | Ensure Node.js 18+ is installed: `node --version` |
| Port 5173 already in use | Edit `vite.config.js` and change `port: 5173` to any free port |
| CSV upload rejected | Check that all 7 required column headers are present and spelled correctly (case-sensitive) |
| Blank page after `npm run dev` | Clear browser cache or try a private/incognito window |
| `npm` not recognised | Use the full path: `& "C:\Program Files\nodejs\node.exe" node_modules\vite\bin\vite.js` |

---

## Project Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Start Vite dev server with HMR |
| Build | `npm run build` | Production bundle to `dist/` |
| Preview | `npm run preview` | Serve production build locally |

---

*For more detail on the algorithms and architecture, see [`architecture.md`](architecture.md) and [`solution-overview.md`](solution-overview.md).*
