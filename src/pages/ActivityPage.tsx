import { useState } from 'react'
import type { HealthKitState, HealthKitActions } from '../hooks/useHealthKit'
import type { WorkoutActivityType } from '@pwa-kit/sdk'

const NF = new Intl.NumberFormat('en-US')

function d(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
function t(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}
function dur(sec: number) {
  const m = Math.round(sec / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r > 0 ? `${h}h ${r}m` : `${h}h`
}

export function ActivityPage({ state, actions }: { state: HealthKitState; actions: HealthKitActions }) {
  const { authorized, loading, workouts, sleepSamples } = state
  const [maxSamples] = useState(20)

  const sleepByStage = sleepSamples.reduce<Record<string, number>>((acc, s) => {
    acc[s.stage] = (acc[s.stage] || 0) + 1
    return acc
  }, {})

  return (
    <div className="pt-4 space-y-4">
      {/* ── Workouts ── */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider m-0 mb-2.5">🏃 Workouts</h2>
        <div className="flex gap-2 mb-2.5">
          <button
            onClick={() => actions.queryWorkouts(7)}
            disabled={!authorized || loading}
            className="flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.97] transition-all hover:border-orange-500 hover:bg-orange-500/8 disabled:opacity-35"
          >
            7 days
          </button>
          <button
            onClick={() => actions.queryWorkouts(30)}
            disabled={!authorized || loading}
            className="flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.97] transition-all hover:border-orange-500 hover:bg-orange-500/8 disabled:opacity-35"
          >
            30 days
          </button>
        </div>

        {workouts.length > 0 && (
          <div>
            <div className="text-xs font-medium px-3 py-2 bg-[var(--color-code-bg)] rounded-lg mb-1 text-[var(--color-text)]">
              {workouts.length} workouts
            </div>
            {workouts.map((w, i) => (
              <div key={i} className="flex gap-2 items-center py-1.5 px-2.5 font-mono text-xs border-b border-gray-500/10 last:border-b-0">
                <span className="shrink-0 text-[var(--color-text)] text-[11px]">{d(w.startDate)}</span>
                <span className="flex-1 text-right font-medium text-[var(--color-text-h)] capitalize">{w.type}</span>
                <span className="shrink-0 text-[11px] opacity-60">
                  {dur(w.duration)}
                  {w.calories ? ` · ${w.calories} kcal` : ''}
                  {w.distance ? ` · ${NF.format(w.distance)}m` : ''}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="h-px bg-[var(--color-border)] my-3" />
        <SaveWorkoutForm onSave={(r) => actions.saveWorkout(r)} disabled={!authorized || loading} />
      </div>

      {/* ── Sleep ── */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider m-0 mb-2.5">🌙 Sleep</h2>
        <div className="flex gap-2 mb-2.5">
          <button
            onClick={() => actions.querySleep(7)}
            disabled={!authorized || loading}
            className="flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.97] transition-all hover:border-indigo-500 hover:bg-indigo-500/8 disabled:opacity-35"
          >
            7 days
          </button>
          <button
            onClick={() => actions.querySleep(1)}
            disabled={!authorized || loading}
            className="flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.97] transition-all hover:border-indigo-500 hover:bg-indigo-500/8 disabled:opacity-35"
          >
            Last night
          </button>
        </div>

        {Object.keys(sleepByStage).length > 0 && (
          <div>
            <div className="flex justify-between text-xs font-medium px-3 py-2 bg-[var(--color-code-bg)] rounded-lg mb-1 text-[var(--color-text)]">
              <span>{sleepSamples.length} samples</span>
              <span>{Object.keys(sleepByStage).length} stages</span>
            </div>
            {Object.entries(sleepByStage).map(([stage, count]) => (
              <div key={stage} className="flex gap-2 items-center py-1 px-2.5 font-mono text-xs border-b border-gray-500/10 last:border-b-0">
                <span className="text-[var(--color-text-h)]">{stage}</span>
                <span className="flex-1 text-right text-[var(--color-text)]">{count} entries</span>
              </div>
            ))}
            {sleepSamples.length > 0 && (
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer opacity-60 hover:opacity-100 hover:text-indigo-500 py-1 select-none">
                  View time details
                </summary>
                <div className="mt-1">
                  {sleepSamples.slice(0, maxSamples).map((s, i) => (
                    <div key={i} className="flex gap-2 items-center py-0.5 px-2 font-mono text-[11px] border-b border-gray-500/10 last:border-b-0">
                      <span className="text-[var(--color-text-h)]">{s.stage}</span>
                      <span className="flex-1 text-right opacity-60">{d(s.startDate)} {t(s.startDate)} → {t(s.endDate)}</span>
                    </div>
                  ))}
                  {sleepSamples.length > maxSamples && (
                    <p className="text-[11px] opacity-45 italic px-2 py-0.5">…and {sleepSamples.length - maxSamples} more</p>
                  )}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {!authorized && (
        <p className="text-sm opacity-50 text-center py-6">Authorize HealthKit on the Dashboard tab first.</p>
      )}
    </div>
  )
}

// ─── Save Workout Form ─────────────────────────────────────────────

const workoutTypes: WorkoutActivityType[] = [
  'running', 'walking', 'cycling', 'swimming', 'hiking', 'yoga',
  'hiit', 'strengthTraining', 'dance', 'pilates', 'other',
]

function SaveWorkoutForm({
  onSave,
  disabled,
}: {
  onSave: (req: { workoutType: WorkoutActivityType; startDate: string; endDate: string; calories?: number; distance?: number }) => void
  disabled: boolean
}) {
  const [type, setType] = useState<WorkoutActivityType>('running')
  const [durMin, setDurMin] = useState(30)
  const [cal, setCal] = useState('')
  const [dist, setDist] = useState('')

  const handleSave = () => {
    const end = new Date()
    const start = new Date(end.getTime() - durMin * 60 * 1000)
    onSave({
      workoutType: type,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      ...(cal ? { calories: Number(cal) } : {}),
      ...(dist ? { distance: Number(dist) } : {}),
    })
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm font-semibold text-[var(--color-text)]">Save a workout</p>
      <div className="flex gap-2 items-center">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as WorkoutActivityType)}
          disabled={disabled}
          className="flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-sans appearance-none"
        >
          {workoutTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="flex flex-col items-center text-xs text-[var(--color-text)] gap-0.5 min-h-[44px] justify-center">
          <span>{durMin} min</span>
          <input type="range" min={5} max={180} step={5} value={durMin} onChange={(e) => setDurMin(Number(e.target.value))} disabled={disabled} className="w-24 accent-orange-500" />
        </label>
      </div>
      <div className="flex gap-2">
        <input type="number" placeholder="Calories (kcal)" value={cal} onChange={(e) => setCal(e.target.value)} disabled={disabled}
          className="flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-sans" />
        <input type="number" placeholder="Distance (m)" value={dist} onChange={(e) => setDist(e.target.value)} disabled={disabled}
          className="flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-sans" />
      </div>
      <button onClick={handleSave} disabled={disabled}
        className="min-h-[44px] px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.98] transition-all hover:border-orange-500 hover:bg-orange-500/8 disabled:opacity-35">
        💾 Save Workout
      </button>
    </div>
  )
}
