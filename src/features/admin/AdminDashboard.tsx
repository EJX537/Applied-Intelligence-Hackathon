import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

/* ── Types ───────────────────────────────────────────────────── */

interface CheckpointScores {
  labs: number
  steps: number
  diet: number
  oral: number
}

interface PatientCheckpoint extends CheckpointScores {
  labNote: string
  stepsNote: string
  dietNote: string
  oralNote: string
}

type CheckpointKey = 'baseline' | '3mo' | '6mo'

interface Patient {
  id: string
  name: string
  age: number
  sex: 'M' | 'F'
  color: string
  dx: string
  checkpoints: Record<CheckpointKey, PatientCheckpoint>
}

/* ── Constants ────────────────────────────────────────────────── */

const W = { labs: 0.35, steps: 0.25, diet: 0.25, oral: 0.15 } as const

const METRIC_META: Record<
  keyof CheckpointScores,
  { label: string; icon: string; color: string; weight: string }
> = {
  labs:  { label: 'Lab Results',       icon: '🔬', color: '#007AFF', weight: '35%' },
  steps: { label: 'Daily Step Count',  icon: '👣', color: '#34C759', weight: '25%' },
  diet:  { label: 'Diet & Food Habits', icon: '🥗', color: '#AF52DE', weight: '25%' },
  oral:  { label: 'Oral Hygiene',      icon: '🦷', color: '#FF9500', weight: '15%' },
}

const NOTE_KEYS: Record<keyof CheckpointScores, keyof PatientCheckpoint> = {
  labs: 'labNote',
  steps: 'stepsNote',
  diet: 'dietNote',
  oral: 'oralNote',
}

const CHECKPOINT_FULL: Record<CheckpointKey, string> = {
  baseline: 'Baseline',
  '3mo': '3 Months',
  '6mo': '6 Months',
}

const CP_KEYS: CheckpointKey[] = ['baseline', '3mo', '6mo']

/* ── Patient Data ─────────────────────────────────────────────── */

const patients: Patient[] = [
  {
    id: 'PT-001', name: 'Maria Santos', age: 52, sex: 'F', color: '#FF6B6B',
    dx: 'Type 2 Diabetes, Hypertension',
    checkpoints: {
      baseline: { labs: 48, steps: 40, diet: 42, oral: 55,  labNote: 'HbA1c 7.2%, LDL 138', stepsNote: '~3,800 steps/day', dietNote: 'High processed food', oralNote: 'Brushes once/day' },
      '3mo':    { labs: 62, steps: 61, diet: 63, oral: 72,  labNote: 'HbA1c 6.8%, LDL 121', stepsNote: '~6,100 steps/day', dietNote: 'Reduced soda, more veg', oralNote: 'Brushes 2×/day' },
      '6mo':    { labs: 74, steps: 76, diet: 75, oral: 85,  labNote: 'HbA1c 6.3%, LDL 108', stepsNote: '~7,600 steps/day', dietNote: 'Meal prepping, low-glycemic', oralNote: 'Daily brushing & flossing' },
    },
  },
  {
    id: 'PT-002', name: 'James Liu', age: 44, sex: 'M', color: '#007AFF',
    dx: 'Hyperlipidemia, Pre-diabetes',
    checkpoints: {
      baseline: { labs: 55, steps: 52, diet: 50, oral: 60,  labNote: 'HbA1c 6.1%, LDL 145', stepsNote: '~5,200 steps/day', dietNote: 'Frequent fast food', oralNote: 'Brushes once/day' },
      '3mo':    { labs: 63, steps: 66, diet: 68, oral: 70,  labNote: 'HbA1c 5.9%, LDL 130', stepsNote: '~6,600 steps/day', dietNote: 'Cooking at home 4×/wk', oralNote: 'Brushes 2×/day + mouthwash' },
      '6mo':    { labs: 72, steps: 80, diet: 79, oral: 80,  labNote: 'HbA1c 5.7%, LDL 115', stepsNote: '~8,000 steps/day', dietNote: 'Mediterranean-style diet', oralNote: 'Brushes 2×/day, flosses 5×/wk' },
    },
  },
  {
    id: 'PT-003', name: 'Aisha Johnson', age: 38, sex: 'F', color: '#34C759',
    dx: 'Obesity, Elevated CRP',
    checkpoints: {
      baseline: { labs: 50, steps: 35, diet: 38, oral: 45,  labNote: 'CRP 4.2, LDL 142', stepsNote: '~3,500 steps/day', dietNote: 'Irregular meals, high sugar', oralNote: 'Brushes irregularly' },
      '3mo':    { labs: 68, steps: 65, diet: 70, oral: 62,  labNote: 'CRP 2.8, LDL 128', stepsNote: '~6,500 steps/day', dietNote: '3 structured meals/day', oralNote: 'Brushes daily' },
      '6mo':    { labs: 82, steps: 88, diet: 85, oral: 78,  labNote: 'CRP 1.4, LDL 109', stepsNote: '~8,800 steps/day', dietNote: 'Whole foods, limited processed', oralNote: 'Brushes 2×/day, improving floss' },
    },
  },
  {
    id: 'PT-004', name: 'Robert Kim', age: 61, sex: 'M', color: '#FF9500',
    dx: 'Hypertension, CKD Stage 2',
    checkpoints: {
      baseline: { labs: 42, steps: 30, diet: 44, oral: 50,  labNote: 'BP 148/92, Creat 1.4', stepsNote: '~3,000 steps/day', dietNote: 'High sodium diet', oralNote: 'Brushes once/day' },
      '3mo':    { labs: 50, steps: 42, diet: 53, oral: 58,  labNote: 'BP 140/88, Creat 1.3', stepsNote: '~4,200 steps/day', dietNote: 'Reducing sodium, more fruit', oralNote: 'Brushes 2×/day' },
      '6mo':    { labs: 55, steps: 48, diet: 60, oral: 62,  labNote: 'BP 135/84, Creat 1.2', stepsNote: '~4,800 steps/day', dietNote: 'DASH diet, partial compliance', oralNote: 'Brushes 2×/day, mouthwash' },
    },
  },
  {
    id: 'PT-005', name: 'Elena Rodriguez', age: 47, sex: 'F', color: '#AF52DE',
    dx: 'Hypothyroidism, Anemia',
    checkpoints: {
      baseline: { labs: 52, steps: 45, diet: 58, oral: 65,  labNote: 'TSH 6.2, Hgb 10.8', stepsNote: '~4,500 steps/day', dietNote: 'Low iron foods', oralNote: 'Brushes 2×/day, occ floss' },
      '3mo':    { labs: 66, steps: 60, diet: 72, oral: 75,  labNote: 'TSH 3.8, Hgb 12.1', stepsNote: '~6,000 steps/day', dietNote: 'Iron-rich foods added', oralNote: 'Brushes 2×/day, floss 3×/wk' },
      '6mo':    { labs: 78, steps: 73, diet: 80, oral: 85,  labNote: 'TSH 2.6, Hgb 13.2', stepsNote: '~7,300 steps/day', dietNote: 'Balanced, cooking at home', oralNote: 'Daily brushing & flossing' },
    },
  },
  {
    id: 'PT-006', name: 'David Chen', age: 55, sex: 'M', color: '#32ADE6',
    dx: 'Metabolic Syndrome',
    checkpoints: {
      baseline: { labs: 46, steps: 38, diet: 40, oral: 48,  labNote: 'Trig 220, Glucose 108', stepsNote: '~3,800 steps/day', dietNote: 'High carb, low fiber', oralNote: 'Brushes once/day' },
      '3mo':    { labs: 58, steps: 55, diet: 60, oral: 65,  labNote: 'Trig 175, Glucose 101', stepsNote: '~5,500 steps/day', dietNote: 'Reducing carbs, adding fiber', oralNote: 'Brushes 2×/day' },
      '6mo':    { labs: 68, steps: 67, diet: 72, oral: 75,  labNote: 'Trig 145, Glucose 96',  stepsNote: '~6,700 steps/day', dietNote: 'Low-carb structured eating', oralNote: 'Brushes 2×/day, floss 4×/wk' },
    },
  },
  {
    id: 'PT-007', name: 'Priya Nair', age: 34, sex: 'F', color: '#5856D6',
    dx: 'PCOS, Vitamin D Deficiency',
    checkpoints: {
      baseline: { labs: 54, steps: 48, diet: 55, oral: 70,  labNote: 'Vit D 14 ng/mL, HbA1c 5.8%', stepsNote: '~4,800 steps/day', dietNote: 'Inconsistent eating', oralNote: 'Good oral habits' },
      '3mo':    { labs: 70, steps: 72, diet: 74, oral: 82,  labNote: 'Vit D 28 ng/mL, HbA1c 5.6%', stepsNote: '~7,200 steps/day', dietNote: 'Anti-inflammatory diet', oralNote: 'Excellent oral care' },
      '6mo':    { labs: 84, steps: 88, diet: 87, oral: 90,  labNote: 'Vit D 42 ng/mL, HbA1c 5.4%', stepsNote: '~8,800 steps/day', dietNote: 'Whole food, plant-rich', oralNote: 'Exemplary oral hygiene' },
    },
  },
  {
    id: 'PT-008', name: 'Marcus Thompson', age: 58, sex: 'M', color: '#FF3B30',
    dx: 'Coronary Artery Disease Risk',
    checkpoints: {
      baseline: { labs: 40, steps: 28, diet: 35, oral: 42,  labNote: 'LDL 165, hs-CRP 5.1', stepsNote: '~2,800 steps/day', dietNote: 'High sat fat, smoking', oralNote: 'Poor brushing habits' },
      '3mo':    { labs: 47, steps: 38, diet: 44, oral: 52,  labNote: 'LDL 152, hs-CRP 4.2', stepsNote: '~3,800 steps/day', dietNote: 'Reduced red meat, quit smoking', oralNote: 'Brushes daily now' },
      '6mo':    { labs: 56, steps: 50, diet: 58, oral: 62,  labNote: 'LDL 138, hs-CRP 2.9', stepsNote: '~5,000 steps/day', dietNote: 'Heart-healthy diet', oralNote: 'Brushes 2×/day' },
    },
  },
]

/* ── Utility Functions ────────────────────────────────────────── */

function calcOverall(c: CheckpointScores): number {
  return Math.round(c.labs * W.labs + c.steps * W.steps + c.diet * W.diet + c.oral * W.oral)
}

function getScores(p: Patient): [number, number, number] {
  return [calcOverall(p.checkpoints.baseline), calcOverall(p.checkpoints['3mo']), calcOverall(p.checkpoints['6mo'])]
}

function giftEligible(p: Patient): string[] {
  const [b, m3, m6] = getScores(p)
  const r: string[] = []
  if (m3 >= 70 || (m3 - b) >= 12) r.push('3-Month')
  if (m6 >= 70 || (m6 - m3) >= 12) r.push('6-Month')
  return r
}

function scoreColor(s: number): string {
  if (s >= 75) return '#1e8449'
  if (s >= 60) return '#1a5276'
  if (s >= 50) return '#9a7d0a'
  return '#c0392b'
}

function scoreBg(s: number): string {
  if (s >= 75) return '#d5f5e3'
  if (s >= 60) return '#d6eaf8'
  if (s >= 50) return '#fef9e7'
  return '#fde8e8'
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
}

/* ── Sub-Components ────────────────────────────────────────────── */

function StatTile({
  icon,
  value,
  label,
  colorClass,
}: {
  icon: string
  value: string
  label: string
  colorClass: string
}) {
  return (
    <div className="rounded-xl bg-white p-3.5 pb-3 shadow-[0_1px_3px_rgba(0,0,0,0.10),0_0_0_0.5px_rgba(0,0,0,0.06)]">
      <div className="mb-1.5 text-[22px] leading-none">{icon}</div>
      <div className={`text-[26px] font-extrabold leading-none ${colorClass}`}>{value}</div>
      <div className="mt-0.5 text-xs text-[#8e8e93]">{label}</div>
    </div>
  )
}

/* ── Patient Cards ────────────────────────────────────────────── */

function PatientCard({
  patient: p,
  onClick,
}: {
  patient: Patient
  onClick: () => void
}) {
  const [b, m3, m6] = getScores(p)
  const diff = m6 - b
  const trendIcon = diff >= 10 ? '📈' : diff <= -5 ? '📉' : '➡️'
  const eligible = giftEligible(p)

  return (
    <div
      onClick={onClick}
      className="mx-4 mb-2.5 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.10),0_0_0_0.5px_rgba(0,0,0,0.06)] p-3.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform duration-100"
    >
      <div
        className="w-[46px] h-[46px] rounded-full flex items-center justify-center font-bold text-base text-white flex-shrink-0"
        style={{ background: p.color }}
      >
        {initials(p.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold truncate">{p.name}</div>
        <div className="text-xs text-[#8e8e93] mt-0.5 truncate">{p.dx}</div>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span
            className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-lg"
            style={{ background: scoreBg(b), color: scoreColor(b) }}
          >
            {b}%
          </span>
          <span className="text-[11px] text-[#8e8e93] self-center">→</span>
          <span
            className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-lg"
            style={{ background: scoreBg(m3), color: scoreColor(m3) }}
          >
            {m3}%
          </span>
          <span className="text-[11px] text-[#8e8e93] self-center">→</span>
          <span
            className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-lg"
            style={{ background: scoreBg(m6), color: scoreColor(m6) }}
          >
            {m6}%
          </span>
          {eligible.length > 0 && (
            <span
              className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-lg"
              style={{ background: '#fff9e0', color: '#b8860b', border: '1px solid #ffe066' }}
            >
              🎁
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="text-[22px] font-extrabold" style={{ color: scoreColor(m6) }}>
          {m6}%
        </div>
        <div className="text-[13px]">{trendIcon}</div>
        <div className="text-[10px] text-[#8e8e93]">{p.id}</div>
      </div>
    </div>
  )
}

function PatientMiniCard({
  patient: p,
  onClick,
}: {
  patient: Patient
  onClick: () => void
}) {
  const [b, , m6] = getScores(p)
  const diff = m6 - b
  const trendIcon = diff >= 10 ? '▲' : diff <= -5 ? '▼' : '→'
  const trendColor = diff >= 10 ? '#27ae60' : diff <= -5 ? '#e74c3c' : '#8e8e93'

  return (
    <div
      onClick={onClick}
      className="mx-4 mb-2.5 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.10),0_0_0_0.5px_rgba(0,0,0,0.06)] p-3.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform duration-100"
    >
      <div
        className="w-[46px] h-[46px] rounded-full flex items-center justify-center font-bold text-base text-white flex-shrink-0"
        style={{ background: p.color }}
      >
        {initials(p.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold truncate">{p.name}</div>
        <div className="text-xs text-[#8e8e93] mt-0.5 truncate">{p.dx}</div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="text-[22px] font-extrabold" style={{ color: scoreColor(m6) }}>
          {m6}%
        </div>
        <div className="text-xs font-semibold" style={{ color: trendColor }}>
          {trendIcon} {diff >= 0 ? '+' : ''}
          {diff}
        </div>
      </div>
    </div>
  )
}

function GiftPatientCard({
  patient: p,
  score,
  reasons,
  dimmed,
  footnote,
  onClick,
}: {
  patient: Patient
  score: number
  reasons: string[]
  dimmed: boolean
  footnote?: string
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`mx-4 mb-2.5 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.10),0_0_0_0.5px_rgba(0,0,0,0.06)] p-3.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform duration-100 ${dimmed ? 'opacity-70' : ''}`}
    >
      <div className="text-[28px] flex-shrink-0" style={{ opacity: dimmed ? 0.4 : 1 }}>
        🎁
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold truncate">{p.name}</div>
        <div className="text-xs text-[#8e8e93] mt-0.5">
          {p.id} · Score: {score}%
          {footnote ? ` — ${footnote}` : ''}
        </div>
        {reasons.length > 0 && (
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {reasons.map((r) => (
              <span
                key={r}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-lg"
                style={{ background: '#eafaf1', color: '#1e8449', border: '1px solid #a9dfbf' }}
              >
                ✓ {r}
              </span>
            ))}
          </div>
        )}
      </div>
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] text-white flex-shrink-0"
        style={{ background: p.color }}
      >
        {initials(p.name)}
      </div>
    </div>
  )
}

/* ── Detail Panel ─────────────────────────────────────────────── */

function DetailPanel({
  patient,
  scores: [b, m3, m6],
  eligible,
  progressionData,
  radarData,
  onBack,
}: {
  patient: Patient
  scores: [number, number, number]
  eligible: string[]
  progressionData: { name: string; Overall: number; Labs: number; Steps: number; Diet: number; Oral: number }[]
  radarData: { metric: string; '6-Month': number; Baseline: number }[]
  onBack: () => void
}) {
  const [bScore, m3Score, m6Score] = [b, m3, m6]

  return (
    <>
      {/* ── Detail Hero ── */}
      <div className="px-4 pt-5 pb-4 bg-gradient-to-br from-[#1a5276] to-[#2e86c1] text-white">
        <button
          onClick={onBack}
          className="text-sm font-medium text-white/85 bg-none border-none flex items-center gap-1 mb-3 p-0 cursor-pointer"
        >
          ‹ Patients
        </button>
        <div className="text-2xl font-bold tracking-tight">{patient.name}</div>
        <div className="text-[13px] opacity-80 mt-0.5">
          {patient.id} · Age {patient.age} · {patient.sex === 'M' ? 'Male' : 'Female'} · {patient.dx}
        </div>
        <div className="flex gap-2 mt-3.5">
          {[
            { label: 'Baseline', score: bScore, trend: '' },
            { label: '3 Months', score: m3Score, trend: `${m3Score - bScore >= 0 ? '+' : ''}${m3Score - bScore} pts` },
            { label: '6 Months', score: m6Score, trend: `${m6Score - m3Score >= 0 ? '+' : ''}${m6Score - m3Score} pts` },
          ].map(({ label, score, trend }) => (
            <div
              key={label}
              className="flex-1 bg-white/15 border border-white/25 rounded-xl py-2.5 px-2 text-center"
            >
              <div className="text-[10px] opacity-75 font-semibold uppercase tracking-[0.3px]">{label}</div>
              <div className="text-[22px] font-extrabold mt-0.5">{score}%</div>
              <div className="text-[11px] opacity-80 mt-0.5">{trend || 'baseline'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Gift Card Eligibility Banner ── */}
      {eligible.length > 0 ? (
        <div className="mx-4 mt-3 rounded-xl p-3.5 flex items-center gap-3 bg-[#eafaf1] border-[1.5px] border-[#27ae60]">
          <div className="text-[28px] flex-shrink-0">🎁</div>
          <div>
            <h4 className="text-sm font-bold text-[#1c1c1e]">
              Eligible: {eligible.join(' & ')}
            </h4>
            <p className="text-xs text-[#8e8e93] mt-0.5 leading-relaxed">
              Score ≥ 70% or ≥ 12-point improvement met. Award $25 Safeway gift card.
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-4 mt-3 rounded-xl p-3.5 flex items-center gap-3 bg-[#fff9e0] border-[1.5px] border-[#f39c12]">
          <div className="text-[28px] flex-shrink-0">📋</div>
          <div>
            <h4 className="text-sm font-bold text-[#1c1c1e]">Not Yet Eligible</h4>
            <p className="text-xs text-[#8e8e93] mt-0.5 leading-relaxed">
              Needs score ≥ 70% or ≥ 12-pt improvement at next checkpoint. Keep coaching!
            </p>
          </div>
        </div>
      )}

      {/* ── Progress by Metric ── */}
      <div className="text-[13px] font-semibold text-[#8e8e93] uppercase tracking-[0.5px] px-4 pb-2 pt-5">
        Progress by Metric
      </div>

      <div className="mx-4 mb-4 flex flex-col gap-2.5">
        {(Object.keys(METRIC_META) as (keyof CheckpointScores)[]).map((key) => {
          const meta = METRIC_META[key]
          const vals = CP_KEYS.map((k) => patient.checkpoints[k][key])
          const notes = CP_KEYS.map((k) => patient.checkpoints[k][NOTE_KEYS[key]])
          const cur = vals[2]

          return (
            <div
              key={key}
              className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.10),0_0_0_0.5px_rgba(0,0,0,0.06)] p-3.5"
            >
              <div className="flex justify-between items-center mb-2.5">
                <div className="text-sm font-semibold flex items-center gap-1.5 text-[#1c1c1e]">
                  {meta.icon} {meta.label}
                  <span className="text-[11px] text-[#8e8e93] font-normal">({meta.weight})</span>
                </div>
                <div className="text-[15px] font-bold" style={{ color: meta.color }}>
                  {cur}%
                </div>
              </div>
              <div className="h-2 bg-[#e5e5ea] rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full transition-all duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  style={{ width: `${cur}%`, background: meta.color }}
                />
              </div>
              <div className="flex gap-2 mt-2.5">
                {(['Baseline', '3 Mo', '6 Mo'] as const).map((lbl, i) => (
                  <div key={lbl} className="flex-1 bg-[#f2f2f7] rounded-lg p-1.5 text-center">
                    <div className="text-[10px] text-[#8e8e93] font-medium">{lbl}</div>
                    <div className="text-[15px] font-bold mt-0.5" style={{ color: meta.color }}>
                      {vals[i]}%
                    </div>
                    <div className="text-[10px] text-[#8e8e93] mt-0.5 leading-tight">{notes[i]}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Line Chart: Score Progression ── */}
      <div className="mx-4 mb-4 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.10),0_0_0_0.5px_rgba(0,0,0,0.06)] p-4">
        <div className="text-sm font-semibold mb-3 text-[#1c1c1e]">
          📈 Score Progression
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value) => [`${value}%`]} />
              <Legend
                wrapperStyle={{ fontSize: 10 }}
                iconSize={10}
                verticalAlign="bottom"
              />
              <Line
                type="monotone"
                dataKey="Overall"
                stroke="#1a5276"
                strokeWidth={2.5}
                dot={{ r: 5 }}
                fill="rgba(26,82,118,0.08)"
              />
              <Line type="monotone" dataKey="Labs" stroke="#007AFF" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="5 3" />
              <Line type="monotone" dataKey="Steps" stroke="#34C759" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="5 3" />
              <Line type="monotone" dataKey="Diet" stroke="#AF52DE" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="5 3" />
              <Line type="monotone" dataKey="Oral" stroke="#FF9500" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Radar Chart: 6-Month Breakdown ── */}
      <div className="mx-4 mb-6 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.10),0_0_0_0.5px_rgba(0,0,0,0.06)] p-4">
        <div className="text-sm font-semibold mb-3 text-[#1c1c1e]">
          📊 6-Month Breakdown
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(0,0,0,0.08)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Tooltip formatter={(value) => [`${value}%`]} />
              <Legend
                wrapperStyle={{ fontSize: 10 }}
                iconSize={10}
                verticalAlign="bottom"
              />
              <Radar
                name="6-Month"
                dataKey="6-Month"
                stroke="#1a5276"
                fill="rgba(26,82,118,0.12)"
                strokeWidth={2}
                dot={{ r: 5 }}
                fillOpacity={0.6}
              />
              <Radar
                name="Baseline"
                dataKey="Baseline"
                stroke="#c6c6c8"
                fill="rgba(180,180,180,0.06)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={{ r: 3, fill: '#c6c6c8' }}
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="h-8" />
    </>
  )
}

/* ── Main Component ───────────────────────────────────────────── */

export function AdminDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<string>('all')

  /* Derived data */
  const { eligible, needs, avgScore } = useMemo(() => {
    const allScores = patients.map((p) => getScores(p)[2])
    const avg = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    const el = patients.filter((p) => giftEligible(p).length > 0).length
    const need = patients.filter((p) => getScores(p)[2] < 55).length
    return { eligible: el, needs: need, avgScore: avg }
  }, [])

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (filter === 'eligible') return giftEligible(p).length > 0
      if (filter === 'improving') {
        const [b, , m6] = getScores(p)
        return m6 - b >= 10
      }
      if (filter === 'needs') return getScores(p)[2] < 60
      return true
    })
  }, [searchQuery, filter])

  const topPerformers = useMemo(
    () =>
      [...patients]
        .sort((a, b) => getScores(b)[2] - getScores(a)[2])
        .slice(0, 3),
    [],
  )

  const needsAttention = useMemo(
    () =>
      patients
        .filter((p) => getScores(p)[2] < 60)
        .sort((a, b) => getScores(a)[2] - getScores(b)[2]),
    [],
  )

  const eligiblePatients = useMemo(
    () => patients.filter((p) => giftEligible(p).length > 0),
    [],
  )

  const notEligiblePatients = useMemo(
    () => patients.filter((p) => giftEligible(p).length === 0),
    [],
  )

  /* Detail panel data */
  const detailPatient = selectedPatient
  const detailScores = detailPatient ? getScores(detailPatient) : null
  const detailEligible = detailPatient ? giftEligible(detailPatient) : []

  const progressionData = detailPatient
    ? CP_KEYS.map((k) => {
        const c = detailPatient.checkpoints[k]
        return {
          name: CHECKPOINT_FULL[k],
          Overall: calcOverall(c),
          Labs: c.labs,
          Steps: c.steps,
          Diet: c.diet,
          Oral: c.oral,
        }
      })
    : []

  const radarData = detailPatient
    ? ['Labs', 'Steps', 'Diet', 'Oral'].map((metric) => {
        const key = metric.toLowerCase() as keyof CheckpointScores
        return {
          metric,
          '6-Month': detailPatient.checkpoints['6mo'][key],
          Baseline: detailPatient.checkpoints.baseline[key],
        }
      })
    : []

  /* Handlers */
  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => setSelectedPatient(null)

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'eligible', label: '🎁 Gift Card Eligible' },
    { id: 'improving', label: '📈 Improving' },
    { id: 'needs', label: '⚠️ Needs Support' },
  ]

  return (
    <div className="min-h-screen bg-[#f2f2f7] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','Helvetica_Neue',Arial,sans-serif] text-[#1c1c1e] antialiased">
      {/* ── Header – always visible ── */}
      <div className="sticky top-0 z-30 bg-[rgba(249,249,249,0.92)] border-b border-[#c6c6c8]/50 backdrop-blur-[20px]">
        <div className="flex items-center justify-between h-[52px] px-4 pt-[env(safe-area-inset-top,0px)]">
          <div>
            <div className="text-[17px] font-semibold tracking-tight">
              {selectedPatient ? selectedPatient.name : 'HealthTrack'}
            </div>
            <div className="text-[11px] text-[#8e8e93] mt-px">
              {selectedPatient
                ? selectedPatient.dx
                : 'Community Care Health Network'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#007AFF] flex items-center justify-center text-white text-lg flex-shrink-0 cursor-default">
            🔔
          </div>
        </div>
      </div>

      {/* ── Detail Panel (shown when a patient is selected) ── */}
      {detailPatient && detailScores ? (
        <DetailPanel
          patient={detailPatient}
          scores={detailScores}
          eligible={detailEligible}
          progressionData={progressionData}
          radarData={radarData}
          onBack={handleBack}
        />
      ) : (
        <>
          {/* ── Hero Banner ── */}
          <div className="mx-4 mt-3 p-5 pb-6 rounded-2xl bg-gradient-to-br from-[#1a5276] to-[#2e86c1] text-white shadow-[0_4px_16px_rgba(26,82,118,0.35)]">
            <div className="text-[11px] font-semibold tracking-[0.8px] uppercase opacity-75">
              Community Care Health Network
            </div>
            <div className="text-[22px] font-bold mt-1 tracking-tight">
              Wellness Progress Initiative
            </div>
            <div className="text-[13px] opacity-80 mt-0.5">
              Provider Dashboard · May 2026
            </div>
            <div className="inline-flex items-center gap-1.5 mt-3.5 bg-white/15 border border-white/30 rounded-full px-3.5 py-1.5 text-xs font-semibold">
              🎁 $25 Safeway Gift Card Program Active
            </div>
          </div>

          {/* ── Stats Grid ── */}
          <div className="grid grid-cols-2 gap-2.5 mx-4 mb-4">
            <StatTile icon="👥" value={String(patients.length)} label="Total Patients" colorClass="text-[#007AFF]" />
            <StatTile icon="📈" value={`${avgScore}%`} label="Avg Score at 6mo" colorClass="text-[#34C759]" />
            <StatTile icon="🎁" value={String(eligible)} label="Gift Card Eligible" colorClass="text-[#d4a017]" />
            <StatTile icon="⚠️" value={String(needs)} label="Need Support" colorClass="text-[#FF9500]" />
          </div>

          {/* ── Weight Bar ── */}
          <div className="mx-4 mb-4">
            <div className="text-[13px] font-semibold text-[#8e8e93] uppercase tracking-[0.5px] px-0 pb-2">
              Health Score Weights
            </div>
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.10),0_0_0_0.5px_rgba(0,0,0,0.06)] p-3.5">
              <div className="h-2.5 rounded-full flex overflow-hidden mb-2">
                <div className="h-full transition-all duration-300" style={{ width: '35%', background: '#007AFF' }} />
                <div className="h-full transition-all duration-300" style={{ width: '25%', background: '#34C759' }} />
                <div className="h-full transition-all duration-300" style={{ width: '25%', background: '#AF52DE' }} />
                <div className="h-full transition-all duration-300" style={{ width: '15%', background: '#FF9500' }} />
              </div>
              <div className="flex flex-wrap gap-x-3.5 gap-y-2 text-xs text-[#3c3c43]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: '#007AFF' }} />
                  Lab Results 35%
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: '#34C759' }} />
                  Steps 25%
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: '#AF52DE' }} />
                  Diet 25%
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: '#FF9500' }} />
                  Oral Hygiene 15%
                </div>
              </div>
            </div>
          </div>

          {/* ── Top Performers ── */}
          <div className="text-[13px] font-semibold text-[#8e8e93] uppercase tracking-[0.5px] px-4 pb-2 pt-5">
            Top Performers at 6 Months
          </div>
          {topPerformers.map((p) => (
            <PatientMiniCard key={p.id} patient={p} onClick={() => handleSelectPatient(p)} />
          ))}

          {/* ── Needs Attention ── */}
          <div className="text-[13px] font-semibold text-[#8e8e93] uppercase tracking-[0.5px] px-4 pb-2 pt-5">
            Need Attention
          </div>
          {needsAttention.length > 0 ? (
            needsAttention.map((p) => (
              <PatientMiniCard key={p.id} patient={p} onClick={() => handleSelectPatient(p)} />
            ))
          ) : (
            <div className="px-4 py-2 text-[13px] text-[#8e8e93]">
              All patients are on track 🎉
            </div>
          )}

          {/* ── Search & Filter ── */}
          <div className="sticky top-[52px] z-20 bg-[#f2f2f7] pt-2 pb-1">
            <div className="px-4">
              <div className="relative">
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8e93] pointer-events-none"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
                </svg>
                <input
                  type="search"
                  placeholder="Search patients…"
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#ebebf0] border-none rounded-lg py-2 pl-9 pr-3 text-base text-[#1c1c1e] outline-none placeholder:text-[#8e8e93]"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto px-4 pt-2 pb-1 scrollbar-none">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`whitespace-nowrap px-3.5 py-1 rounded-full text-[13px] font-medium border flex-shrink-0 transition-all duration-150 ${
                    filter === f.id
                      ? 'bg-[#007AFF] text-white border-[#007AFF]'
                      : 'bg-white text-[#3c3c43] border-[#c6c6c8]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Patient List ── */}
          <div className="text-[13px] font-semibold text-[#8e8e93] uppercase tracking-[0.5px] px-4 pb-2 pt-1">
            {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
          </div>
          {filteredPatients.map((p) => (
            <PatientCard key={p.id} patient={p} onClick={() => handleSelectPatient(p)} />
          ))}

          {/* ── Gift Card Section ── */}
          <div className="mx-4 mt-6 p-5 rounded-2xl bg-gradient-to-br from-[#b8860b] to-[#FFD60A] text-white shadow-[0_4px_14px_rgba(184,134,11,0.35)]">
            <div className="text-[36px]">🎁</div>
            <div className="text-xl font-bold mt-1.5">Safeway Gift Cards</div>
            <div className="text-[13px] opacity-85 mt-0.5">
              $25 reward for qualifying patients
            </div>
            <div className="mt-3 bg-white/20 rounded-lg px-3 py-2 text-xs leading-relaxed">
              ✅ Eligible if: Score ≥ 70% at checkpoint <em>or</em> improvement ≥ 12 pts from prior
            </div>
          </div>

          <div className="text-[13px] font-semibold text-[#8e8e93] uppercase tracking-[0.5px] px-4 pb-2 pt-5">
            Eligible Patients
          </div>
          {eligiblePatients.map((p) => {
            const reasons = giftEligible(p)
            const [, , m6] = getScores(p)
            return (
              <GiftPatientCard
                key={p.id}
                patient={p}
                score={m6}
                reasons={reasons}
                dimmed={false}
                onClick={() => handleSelectPatient(p)}
              />
            )
          })}
          {eligiblePatients.length === 0 && (
            <div className="px-4 py-2 text-[13px] text-[#8e8e93]">
              No patients eligible yet
            </div>
          )}

          <div className="text-[13px] font-semibold text-[#8e8e93] uppercase tracking-[0.5px] px-4 pb-2 pt-5">
            Not Yet Eligible
          </div>
          {notEligiblePatients.map((p) => {
            const [, , m6] = getScores(p)
            const needed = Math.max(0, 70 - m6)
            return (
              <GiftPatientCard
                key={p.id}
                patient={p}
                score={m6}
                reasons={[]}
                dimmed={true}
                footnote={`needs ${needed} more pts or ≥12pt jump`}
                onClick={() => handleSelectPatient(p)}
              />
            )
          })}

          <div className="h-8" />
        </>
      )}
    </div>
  )
}
