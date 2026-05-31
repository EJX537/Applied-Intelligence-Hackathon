import { useNavigate } from 'react-router-dom'
import { patients } from '../features/admin/patientData'
import { CHECKPOINT_FULL, CP_KEYS } from '../features/admin/types'
import type { CheckpointKey } from '../features/admin/types'
import { SectionIcon } from '../features/wellpath/components'

// ── Current user lookup (same source as admin) ───────────────────

const CURRENT_USER = patients.find((p) => p.name === 'Sarah Johnson')!

// ── Parse labNote into structured entries ────────────────────────

interface LabEntry {
  test: string
  value: string
  flag?: 'high' | 'low' | 'normal'
  range?: string
}

function parseLabNote(note: string): LabEntry[] {
  if (!note) return []
  return note.split(', ').map((part) => {
    const trimmed = part.trim()
    // Try to split on first space or colon to separate test name from value
    const match = trimmed.match(/^([A-Za-z0-9/α-ω⁺⁻²\s]+?)\s+([\d.]+(?:\s*\/\s*[\d.]+)?)/)
    if (match) {
      const [, test, val] = match
      const numVal = parseFloat(val.split('/')[0])
      let flag: LabEntry['flag'] = 'normal'
      let range = ''
      if (test.toLowerCase().includes('hba1c')) {
        range = '<5.7%'
        if (numVal >= 6.5) flag = 'high'
        else if (numVal >= 5.7) flag = 'high'
      } else if (test.toLowerCase().includes('ldl')) {
        range = '<100 mg/dL'
        if (numVal > 130) flag = 'high'
        else if (numVal > 100) flag = 'high'
      } else if (test.toLowerCase().includes('bp') || test.toLowerCase().includes('blood pressure')) {
        range = '<120/80'
        const systolic = parseInt(val.split('/')[0], 10)
        if (systolic >= 140) flag = 'high'
        else if (systolic >= 130) flag = 'high'
      }
      return { test: test.trim(), value: val, flag, range }
    }
    return { test: trimmed, value: '', flag: 'normal' }
  })
}

// ── Score color helper ───────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 75) return 'text-emerald-600'
  if (s >= 60) return 'text-sky-600'
  if (s >= 50) return 'text-amber-600'
  return 'text-rose-600'
}

function scoreBg(s: number): string {
  if (s >= 75) return 'bg-emerald-50 border-emerald-200'
  if (s >= 60) return 'bg-sky-50 border-sky-200'
  if (s >= 50) return 'bg-amber-50 border-amber-200'
  return 'bg-rose-50 border-rose-200'
}

function scoreRing(s: number): string {
  if (s >= 75) return '#10b981'
  if (s >= 60) return '#0ea5e9'
  if (s >= 50) return '#d97706'
  return '#e11d48'
}

// ── Flag colors ──────────────────────────────────────────────────

const flagStyles: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'High' },
  low: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Low' },
  normal: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Normal' },
}

// ── Main component ───────────────────────────────────────────────

export function WellPathLabDataPage() {
  const navigate = useNavigate()

  // Lab data across checkpoints
  const baseline = CURRENT_USER.checkpoints.baseline
  const labs3mo = CURRENT_USER.checkpoints['3mo']
  const labs6mo = CURRENT_USER.checkpoints['6mo']

  const baselineEntries = parseLabNote(baseline.labNote)
  const has3mo = labs3mo.labNote.length > 0
  const has6mo = labs6mo.labNote.length > 0

  // Current lab score (baseline)
  const currentScore = baseline.labs
  const ringColor = scoreRing(currentScore)

  return (
    <div className="flex min-h-full flex-col">
      {/* Back link */}
      <button
        type="button"
        onClick={() => navigate('/user')}
        className="flex items-center gap-1 text-xs text-slate-500 pt-3 pb-1 cursor-pointer"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Dashboard
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500 text-white">
          <SectionIcon type="lab" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Lab Data</h2>
          <p className="text-xs text-slate-500">
            Every 3 months · from provider · Month 3 & 6 review
          </p>
        </div>
      </div>

      {/* ── Current Lab Score ── */}
      <div className={`rounded-2xl border p-5 mb-4 ${scoreBg(currentScore)}`}>
        <div className="flex items-center gap-5">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="5" className="text-slate-200" />
              <circle
                cx="36" cy="36" r="30"
                fill="none"
                stroke={ringColor}
                strokeWidth="5"
                strokeDasharray={`${(currentScore / 100) * 188.5} 188.5`}
                strokeLinecap="round"
              />
            </svg>
            <span className={`absolute text-2xl font-extrabold ${scoreColor(currentScore)}`}>
              {currentScore}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Lab Health Score</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Based on current lab results · higher is better
            </p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Baseline assessment from your most recent lab panel.
              Target score: 70+ at 3-month and 6-month checkpoints.
            </p>
          </div>
        </div>
      </div>

      {/* ── Current Lab Values ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-slate-900">Current Lab Values</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            Baseline
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {baselineEntries.length > 0 ? (
            baselineEntries.map((entry, i) => {
              const flags = flagStyles[entry.flag ?? 'normal']
              return (
                <div key={i} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{entry.test}</p>
                    {entry.range && (
                      <p className="text-[11px] text-slate-400 mt-0.5">Range: {entry.range}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-slate-800">{entry.value}</span>
                    {entry.flag && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${flags.bg} ${flags.text}`}>
                        {flags.label}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-slate-500 py-2">No lab results recorded yet.</p>
          )}
        </div>
      </div>

      {/* ── Lab Progression ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-slate-900">Score Progression</span>
        </div>
        <div className="space-y-3">
          {CP_KEYS.map((key, idx) => {
            const cp = CURRENT_USER.checkpoints[key]
            const label = CHECKPOINT_FULL[key]
            const score = key === 'baseline' ? cp.labs : labs3mo.labs
            const hasData = key === 'baseline' || (key === '3mo' ? has3mo : has6mo)
            const isCurrent = key === 'baseline'

            return (
              <div
                key={key}
                className={`flex items-center gap-4 rounded-xl p-3 ${
                  isCurrent ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-slate-50'
                } ${!hasData && idx > 0 ? 'opacity-40' : ''}`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isCurrent ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {isCurrent ? score : hasData ? score : '—'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500">
                    {isCurrent
                      ? 'Your current lab results'
                      : hasData
                        ? 'Checkpoint reached'
                        : 'Not yet due'}
                  </p>
                </div>
                {hasData && score !== undefined && score > 0 && (
                  <div className="h-2 w-20 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${score}%`, backgroundColor: scoreRing(score) }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Info card ── */}
      <div className="rounded-2xl bg-gradient-to-br from-sky-600 to-sky-700 p-4 text-white mb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg">
            ℹ️
          </div>
          <div>
            <p className="text-sm font-semibold">About your lab review</p>
            <p className="mt-1 text-xs leading-relaxed text-sky-100">
              Lab results are reviewed at 3-month and 6-month milestones.
              Each review compares your progress against baseline and
              rewards improvement with gift card incentives.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
