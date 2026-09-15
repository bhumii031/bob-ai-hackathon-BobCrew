// Synthetic adverse event reports dataset (~220 rows)
// Engineered so that:
//   - Vexarinib + Hepatotoxicity => clear signal (PRR≥2, chi2≥4, n≥3)
//   - Doracetinib + QT Prolongation => clear signal
//   - Lumafenib + Rhabdomyolysis => death-associated signal
//   - Other combinations are noise / below threshold

const DRUGS = ['Vexarinib', 'Doracetinib', 'Lumafenib', 'Perindazel', 'Clinovast']

const ADVERSE_EVENTS = [
  'Hepatotoxicity',
  'QT Prolongation',
  'Rhabdomyolysis',
  'Nausea',
  'Headache',
  'Fatigue',
  'Dizziness',
  'Hypertension',
  'Neutropenia',
  'Thrombocytopenia',
  'Peripheral Neuropathy',
  'Insomnia',
  'Myalgia',
  'Alopecia',
  'Constipation',
]

const REPORTER_TYPES = ['Physician', 'Pharmacist', 'Patient', 'Nurse', 'Other HCP']
const OUTCOMES = ['non-serious', 'serious', 'death']
const SEXES = ['M', 'F']

function rng(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function randInt(r, min, max) {
  return Math.floor(r() * (max - min + 1)) + min
}

function randChoice(r, arr) {
  return arr[Math.floor(r() * arr.length)]
}

function formatDate(r, year = 2022) {
  const month = randInt(r, 1, 12)
  const day = randInt(r, 1, 28)
  const y = year + (r() > 0.5 ? 1 : 0)
  return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function generateSampleAEData() {
  const r = rng(42)
  const rows = []
  let id = 1

  function addRow(drug, ae, outcome, n = 1, yearOpts) {
    for (let i = 0; i < n; i++) {
      rows.push({
        id: id++,
        drug_name: drug,
        adverse_event: ae,
        patient_age: randInt(r, 28, 78),
        patient_sex: randChoice(r, SEXES),
        report_date: formatDate(r, yearOpts || 2022),
        outcome,
        reporter_type: randChoice(r, REPORTER_TYPES),
      })
    }
  }

  // ── SIGNAL 1: Vexarinib + Hepatotoxicity (PRR should be ~4-5) ──────────────
  // Vexarinib total events: hepatotox = 22, others = 30
  addRow('Vexarinib', 'Hepatotoxicity', 'serious', 8, 2022)
  addRow('Vexarinib', 'Hepatotoxicity', 'serious', 7, 2023)
  addRow('Vexarinib', 'Hepatotoxicity', 'non-serious', 4, 2022)
  addRow('Vexarinib', 'Hepatotoxicity', 'non-serious', 3, 2023)
  // Vexarinib background events
  addRow('Vexarinib', 'Nausea', 'non-serious', 8)
  addRow('Vexarinib', 'Fatigue', 'non-serious', 7)
  addRow('Vexarinib', 'Headache', 'non-serious', 5)
  addRow('Vexarinib', 'Dizziness', 'non-serious', 4)
  addRow('Vexarinib', 'Insomnia', 'non-serious', 3)
  addRow('Vexarinib', 'Myalgia', 'non-serious', 3)
  // Background hepatotox from other drugs (low)
  addRow('Doracetinib', 'Hepatotoxicity', 'non-serious', 2)
  addRow('Lumafenib', 'Hepatotoxicity', 'non-serious', 2)
  addRow('Perindazel', 'Hepatotoxicity', 'non-serious', 1)
  addRow('Clinovast', 'Hepatotoxicity', 'non-serious', 1)

  // ── SIGNAL 2: Doracetinib + QT Prolongation ───────────────────────────────
  addRow('Doracetinib', 'QT Prolongation', 'serious', 9, 2022)
  addRow('Doracetinib', 'QT Prolongation', 'serious', 8, 2023)
  addRow('Doracetinib', 'QT Prolongation', 'non-serious', 3, 2022)
  // Doracetinib background
  addRow('Doracetinib', 'Nausea', 'non-serious', 9)
  addRow('Doracetinib', 'Fatigue', 'non-serious', 8)
  addRow('Doracetinib', 'Headache', 'non-serious', 6)
  addRow('Doracetinib', 'Hypertension', 'serious', 4)
  addRow('Doracetinib', 'Constipation', 'non-serious', 4)
  addRow('Doracetinib', 'Neutropenia', 'serious', 3)
  // Background QT from others (low)
  addRow('Vexarinib', 'QT Prolongation', 'non-serious', 2)
  addRow('Lumafenib', 'QT Prolongation', 'non-serious', 2)
  addRow('Perindazel', 'QT Prolongation', 'non-serious', 1)
  addRow('Clinovast', 'QT Prolongation', 'non-serious', 1)

  // ── SIGNAL 3: Lumafenib + Rhabdomyolysis (death-associated) ───────────────
  addRow('Lumafenib', 'Rhabdomyolysis', 'death', 5, 2022)
  addRow('Lumafenib', 'Rhabdomyolysis', 'death', 4, 2023)
  addRow('Lumafenib', 'Rhabdomyolysis', 'serious', 6, 2022)
  addRow('Lumafenib', 'Rhabdomyolysis', 'serious', 3, 2023)
  // Lumafenib background
  addRow('Lumafenib', 'Myalgia', 'non-serious', 7)
  addRow('Lumafenib', 'Nausea', 'non-serious', 8)
  addRow('Lumafenib', 'Fatigue', 'non-serious', 6)
  addRow('Lumafenib', 'Peripheral Neuropathy', 'serious', 4)
  addRow('Lumafenib', 'Thrombocytopenia', 'serious', 3)
  addRow('Lumafenib', 'Alopecia', 'non-serious', 3)
  // Background rhabdomyolysis from others (very low)
  addRow('Vexarinib', 'Rhabdomyolysis', 'non-serious', 1)
  addRow('Doracetinib', 'Rhabdomyolysis', 'non-serious', 1)
  addRow('Perindazel', 'Rhabdomyolysis', 'serious', 1)
  addRow('Clinovast', 'Rhabdomyolysis', 'non-serious', 1)

  // ── Perindazel background noise ────────────────────────────────────────────
  addRow('Perindazel', 'Nausea', 'non-serious', 10)
  addRow('Perindazel', 'Headache', 'non-serious', 9)
  addRow('Perindazel', 'Fatigue', 'non-serious', 8)
  addRow('Perindazel', 'Dizziness', 'non-serious', 6)
  addRow('Perindazel', 'Hypertension', 'serious', 5)
  addRow('Perindazel', 'Insomnia', 'non-serious', 4)
  addRow('Perindazel', 'Neutropenia', 'serious', 3)
  addRow('Perindazel', 'Myalgia', 'non-serious', 3)

  // ── Clinovast background noise ─────────────────────────────────────────────
  addRow('Clinovast', 'Nausea', 'non-serious', 9)
  addRow('Clinovast', 'Headache', 'non-serious', 8)
  addRow('Clinovast', 'Fatigue', 'non-serious', 7)
  addRow('Clinovast', 'Alopecia', 'non-serious', 5)
  addRow('Clinovast', 'Constipation', 'non-serious', 5)
  addRow('Clinovast', 'Peripheral Neuropathy', 'serious', 4)
  addRow('Clinovast', 'Thrombocytopenia', 'serious', 3)
  addRow('Clinovast', 'Dizziness', 'non-serious', 4)

  return rows
}

// CTD Reference Structure (ICH M4)
export const CTD_REFERENCE = [
  {
    module: 1,
    title: 'Module 1 – Administrative Information',
    items: [
      { id: 'm1.0', label: 'Cover Letter', severity: 'High' },
      { id: 'm1.1', label: 'Comprehensive Table of Contents', severity: 'High' },
      { id: 'm1.2', label: 'Application Form', severity: 'High' },
      { id: 'm1.3.1', label: 'SPC / Label / Package Leaflet', severity: 'High' },
      { id: 'm1.3.2', label: 'Mock-up and Specimen of Proposed Labeling', severity: 'Medium' },
      { id: 'm1.4', label: 'Information About the Experts', severity: 'Medium' },
      { id: 'm1.5', label: 'Specific Requirements for Different Types of Applications', severity: 'High' },
      { id: 'm1.6', label: 'Environmental Risk Assessment', severity: 'Medium' },
    ],
  },
  {
    module: 2,
    title: 'Module 2 – Common Technical Document Summaries',
    items: [
      { id: 'm2.1', label: 'CTD Table of Contents (Modules 2–5)', severity: 'High' },
      { id: 'm2.2', label: 'Introduction', severity: 'Medium' },
      { id: 'm2.3', label: 'Quality Overall Summary (QOS)', severity: 'High' },
      { id: 'm2.4', label: 'Nonclinical Overview', severity: 'High' },
      { id: 'm2.5', label: 'Clinical Overview', severity: 'High' },
      { id: 'm2.6', label: 'Nonclinical Written and Tabulated Summaries', severity: 'Medium' },
      { id: 'm2.7.1', label: 'Summary of Biopharmaceutic Studies', severity: 'Medium' },
      { id: 'm2.7.2', label: 'Summary of Clinical Pharmacology Studies', severity: 'Medium' },
      { id: 'm2.7.3', label: 'Summary of Clinical Efficacy', severity: 'High' },
      { id: 'm2.7.4', label: 'Summary of Clinical Safety', severity: 'High' },
      { id: 'm2.7.6', label: 'Synopses of Individual Studies', severity: 'Medium' },
    ],
  },
  {
    module: 3,
    title: 'Module 3 – Quality',
    items: [
      { id: 'm3.1', label: 'Table of Contents Module 3', severity: 'Medium' },
      { id: 'm3.2.s.1', label: 'Drug Substance – General Information', severity: 'Critical' },
      { id: 'm3.2.s.2', label: 'Drug Substance – Manufacture', severity: 'Critical' },
      { id: 'm3.2.s.3', label: 'Drug Substance – Characterisation', severity: 'Critical' },
      { id: 'm3.2.s.4', label: 'Drug Substance – Control of Drug Substance', severity: 'Critical' },
      { id: 'm3.2.s.5', label: 'Drug Substance – Reference Standards', severity: 'High' },
      { id: 'm3.2.s.6', label: 'Drug Substance – Container Closure System', severity: 'High' },
      { id: 'm3.2.s.7', label: 'Drug Substance – Stability', severity: 'Critical' },
      { id: 'm3.2.p.1', label: 'Drug Product – Description and Composition', severity: 'Critical' },
      { id: 'm3.2.p.2', label: 'Drug Product – Pharmaceutical Development', severity: 'High' },
      { id: 'm3.2.p.3', label: 'Drug Product – Manufacture', severity: 'Critical' },
      { id: 'm3.2.p.4', label: 'Drug Product – Control of Excipients', severity: 'High' },
      { id: 'm3.2.p.5', label: 'Drug Product – Control of Drug Product', severity: 'Critical' },
      { id: 'm3.2.p.6', label: 'Drug Product – Reference Standards', severity: 'Medium' },
      { id: 'm3.2.p.7', label: 'Drug Product – Container Closure System', severity: 'High' },
      { id: 'm3.2.p.8', label: 'Drug Product – Stability', severity: 'Critical' },
      { id: 'm3.2.a', label: 'Appendices (Facilities, Adventitious Agents)', severity: 'Medium' },
      { id: 'm3.3', label: 'Literature References (Quality)', severity: 'Medium' },
    ],
  },
  {
    module: 4,
    title: 'Module 4 – Nonclinical Study Reports',
    items: [
      { id: 'm4.1', label: 'Table of Contents Module 4', severity: 'Medium' },
      { id: 'm4.2.1', label: 'Pharmacology – Primary Pharmacodynamics', severity: 'High' },
      { id: 'm4.2.2', label: 'Pharmacology – Secondary Pharmacodynamics', severity: 'Medium' },
      { id: 'm4.2.3', label: 'Pharmacology – Safety Pharmacology', severity: 'High' },
      { id: 'm4.2.4', label: 'Pharmacology – Pharmacodynamic Drug Interactions', severity: 'Medium' },
      { id: 'm4.2.5', label: 'Pharmacokinetics', severity: 'High' },
      { id: 'm4.2.6', label: 'Toxicology – Single-Dose', severity: 'High' },
      { id: 'm4.2.7', label: 'Toxicology – Repeat-Dose', severity: 'High' },
      { id: 'm4.2.8', label: 'Toxicology – Genotoxicity', severity: 'High' },
      { id: 'm4.2.9', label: 'Toxicology – Carcinogenicity', severity: 'Medium' },
      { id: 'm4.2.10', label: 'Toxicology – Reproductive & Developmental', severity: 'High' },
      { id: 'm4.3', label: 'Literature References (Nonclinical)', severity: 'Medium' },
    ],
  },
  {
    module: 5,
    title: 'Module 5 – Clinical Study Reports',
    items: [
      { id: 'm5.1', label: 'Table of Contents Module 5', severity: 'Medium' },
      { id: 'm5.2', label: 'Tabular Listing of All Clinical Studies', severity: 'High' },
      { id: 'm5.3.1', label: 'Biopharmaceutic Study Reports', severity: 'High' },
      { id: 'm5.3.2', label: 'Clinical Pharmacology Study Reports', severity: 'High' },
      { id: 'm5.3.3.1', label: 'Phase I Study Reports', severity: 'High' },
      { id: 'm5.3.3.2', label: 'Phase II Study Reports', severity: 'High' },
      { id: 'm5.3.3.3', label: 'Phase III Study Reports', severity: 'Critical' },
      { id: 'm5.3.4', label: 'Reports of Studies Relevant to Safety', severity: 'Critical' },
      { id: 'm5.3.5', label: 'Reports of Post-Marketing Experience', severity: 'Medium' },
      { id: 'm5.3.6', label: 'Reference List', severity: 'Medium' },
      { id: 'm5.4', label: 'Literature References (Clinical)', severity: 'Medium' },
    ],
  },
]

// Sample dossier TOC (~75% complete)
// Missing: m3.2.s.7 (Drug Substance Stability - Critical), m5.3.3.3 (Phase III - Critical),
//          m1.6, m2.7.6, m3.2.a, m3.3, m4.2.9, m4.2.4 (partial matches)
export const SAMPLE_DOSSIER_TOC = `Module 1 – Administrative Information
Cover Letter
Comprehensive Table of Contents
Application Form
SPC / Label / Package Leaflet
Mock-up and Specimen of Proposed Labeling
Information About the Experts
Specific Requirements for Different Types of Applications

Module 2 – CTD Summaries
CTD Table of Contents (Modules 2-5)
Introduction to the Dossier
Quality Overall Summary
Nonclinical Overview
Clinical Overview
Nonclinical Written and Tabulated Summaries
Summary of Biopharmaceutic Studies and Related Bioanalytical Methods
Summary of Clinical Pharmacology Studies
Summary of Clinical Efficacy
Summary of Clinical Safety

Module 3 – Quality
Table of Contents Module 3
Drug Substance – General Information and Properties
Drug Substance – Manufacture and Process Controls
Drug Substance – Characterisation
Drug Substance – Control of Drug Substance
Drug Substance – Reference Standards and Materials
Drug Substance – Container Closure System
Drug Product – Description and Composition
Drug Product – Pharmaceutical Development Report
Drug Product – Manufacture
Drug Product – Control of Excipients
Drug Product – Control of Drug Product
Drug Product – Reference Standards
Drug Product – Container Closure System
Drug Product – Stability Data

Module 4 – Nonclinical Study Reports
Table of Contents Module 4
Pharmacology – Primary Pharmacodynamics
Pharmacology – Secondary Pharmacodynamics
Pharmacology – Safety Pharmacology
Pharmacokinetics Studies
Toxicology – Single-Dose
Toxicology – Repeat-Dose Studies
Toxicology – Genotoxicity
Toxicology – Reproductive and Developmental Toxicology
Literature References (Nonclinical)

Module 5 – Clinical Study Reports
Table of Contents Module 5
Tabular Listing of All Clinical Studies
Biopharmaceutic Study Reports
Clinical Pharmacology Study Reports
Phase I Study Reports
Phase II Study Reports
Reports of Studies Relevant to Safety
Reports of Post-Marketing Experience
Reference List
Literature References (Clinical)
`
