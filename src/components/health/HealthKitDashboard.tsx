import { useState } from 'react'
import { useHealthKit } from '../../hooks/useHealthKit'
import type { WorkoutActivityType } from '@pwa-kit/sdk'
import './HealthKitDashboard.css'

// ─── Helpers ──────────────────────────────────────────────────────

const HK_FORMAT = new Intl.NumberFormat('en-US')

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fmtDuration(seconds: number) {
  const min = Math.round(seconds / 60)
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

// ─── Number stat card ─────────────────────────────────────────────

function Stat({ label, value, unit }: { label: string; value: number | string | null; unit?: string }) {
  if (value === null) return null
  return (
    <div className="hk-stat">
      <span className="hk-stat-label">{label}</span>
      <span className="hk-stat-value">
        {typeof value === 'number' ? HK_FORMAT.format(value) : value}
        {unit && <span className="hk-stat-unit"> {unit}</span>}
      </span>
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────

function Section({
  title,
  icon,
  defaultOpen = true,
  children,
}: {
  title: string
  icon: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <details className="hk-section" open={defaultOpen}>
      <summary className="hk-section-title">
        <span>{icon} {title}</span>
      </summary>
      <div className="hk-section-body">{children}</div>
    </details>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────

export function HealthKitDashboard() {
  const [state, actions] = useHealthKit()
  const { available, authorized, loading, error, stepSamples, totalSteps, heartRateSamples, workouts, sleepSamples } = state

  // Sample rendering limit
  const [maxSamples] = useState(10)

  // ── Computed ──
  const stepSum = stepSamples.reduce((s, h) => s + h.value, 0)
  const avgHeartRate = heartRateSamples.length > 0
    ? Math.round(heartRateSamples.reduce((s, h) => s + h.value, 0) / heartRateSamples.length)
    : null
  const lastHeartRate = heartRateSamples.length > 0 ? heartRateSamples[heartRateSamples.length - 1].value : null
  const sleepByStage = sleepSamples.reduce<Record<string, number>>((acc, s) => {
    acc[s.stage] = (acc[s.stage] || 0) + 1
    return acc
  }, {})

  return (
    <div className="hk-dashboard">
      <h2 className="hk-title">💚 HealthKit</h2>
      <p className="hk-sub">Full API integration</p>

      {/* ── Status bar ── */}
      <div className="hk-status-bar">
        <div className="hk-pill-group">
          <span className={`hk-pill ${available === null ? '' : available ? 'green' : 'red'}`}>
            {available === null ? '⋯ Checking' : available ? '✅ Available' : '❌ Unavailable'}
          </span>
          <span className={`hk-pill ${authorized ? 'green' : 'gray'}`}>
            {authorized ? '✅ Authorized' : '🔐 Not authorized'}
          </span>
        </div>
        <div className="hk-btn-row">
          <button className="hk-btn" onClick={actions.checkAvailability} disabled={loading}>
            {loading ? '⋯' : '🔍 Check'}
          </button>
          <button className="hk-btn" onClick={() => actions.requestAuthorization()} disabled={loading || authorized || available === false}>
            {authorized ? '✅ Authorized' : '🔐 Authorize'}
          </button>
          <button className="hk-btn danger" onClick={actions.reset} disabled={loading}>
            Reset
          </button>
        </div>
      </div>

      {error && <p className="hk-error">{error}</p>}

      {/* ── Steps ── */}
      <Section title="Steps" icon="👣" defaultOpen>
        <div className="hk-actions">
          <button className="hk-btn" onClick={() => actions.queryStepCount(7)} disabled={!authorized || loading}>
            Total (7d)
          </button>
          <button className="hk-btn" onClick={() => actions.queryStepCount(1)} disabled={!authorized || loading}>
            Today
          </button>
          <button className="hk-btn" onClick={() => actions.querySteps(7)} disabled={!authorized || loading}>
            Samples (7d)
          </button>
        </div>
        {totalSteps !== null && <Stat label="Total Steps" value={totalSteps} />}
        {stepSamples.length > 0 && (
          <div className="hk-data-block">
            <div className="hk-data-header">
              <span>{stepSamples.length} samples</span>
              <span>Sum: {HK_FORMAT.format(Math.round(stepSum))}</span>
            </div>
            <div className="hk-sample-list">
              {stepSamples.slice(0, maxSamples).map((s, i) => (
                <div key={i} className="hk-sample-row">
                  <span className="hk-date">{fmtDate(s.startDate)}</span>
                  <span className="hk-val">{HK_FORMAT.format(Math.round(s.value))} {s.unit}</span>
                  <span className="hk-source">{s.sourceName ?? ''}</span>
                </div>
              ))}
              {stepSamples.length > maxSamples && (
                <div className="hk-more">…and {stepSamples.length - maxSamples} more</div>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* ── Heart Rate ── */}
      <Section title="Heart Rate" icon="❤️" defaultOpen={false}>
        <div className="hk-actions">
          <button className="hk-btn" onClick={() => actions.queryHeartRate(1)} disabled={!authorized || loading}>
            24h
          </button>
          <button className="hk-btn" onClick={() => actions.queryHeartRate(7)} disabled={!authorized || loading}>
            7 days
          </button>
        </div>
        {lastHeartRate !== null && <Stat label="Latest" value={`${lastHeartRate} bpm`} />}
        {avgHeartRate !== null && <Stat label="Average" value={`${avgHeartRate} bpm`} />}
        {heartRateSamples.length > 0 && (
          <div className="hk-data-block">
            <div className="hk-data-header">{heartRateSamples.length} readings</div>
            <div className="hk-sample-list">
              {heartRateSamples.slice(0, maxSamples).map((s, i) => (
                <div key={i} className="hk-sample-row">
                  <span className="hk-date">{fmtDate(s.startDate)} {fmtTime(s.startDate)}</span>
                  <span className="hk-val">{Math.round(s.value)} {s.unit}</span>
                  <span className="hk-source">{s.sourceName ?? ''}</span>
                </div>
              ))}
              {heartRateSamples.length > maxSamples && (
                <div className="hk-more">…and {heartRateSamples.length - maxSamples} more</div>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* ── Workouts ── */}
      <Section title="Workouts" icon="🏃" defaultOpen={false}>
        <div className="hk-actions">
          <button className="hk-btn" onClick={() => actions.queryWorkouts(7)} disabled={!authorized || loading}>
            7 days
          </button>
          <button className="hk-btn" onClick={() => actions.queryWorkouts(30)} disabled={!authorized || loading}>
            30 days
          </button>
        </div>
        {workouts.length > 0 && (
          <div className="hk-data-block">
            <div className="hk-data-header">{workouts.length} workouts</div>
            <div className="hk-sample-list">
              {workouts.map((w, i) => (
                <div key={i} className="hk-sample-row">
                  <span className="hk-date">{fmtDate(w.startDate)}</span>
                  <span className="hk-val">{w.type}</span>
                  <span className="hk-source">{fmtDuration(w.duration)}{w.calories ? ` · ${w.calories} kcal` : ''}{w.distance ? ` · ${HK_FORMAT.format(w.distance)}m` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="hk-divider" />
        <SaveWorkoutForm onSave={(req) => actions.saveWorkout(req)} disabled={!authorized || loading} />
      </Section>

      {/* ── Sleep ── */}
      <Section title="Sleep" icon="🌙" defaultOpen={false}>
        <div className="hk-actions">
          <button className="hk-btn" onClick={() => actions.querySleep(7)} disabled={!authorized || loading}>
            7 days
          </button>
          <button className="hk-btn" onClick={() => actions.querySleep(1)} disabled={!authorized || loading}>
            Last night
          </button>
        </div>
        {Object.keys(sleepByStage).length > 0 && (
          <div className="hk-data-block">
            <div className="hk-data-header">
              {sleepSamples.length} samples across {Object.keys(sleepByStage).length} stages
            </div>
            <div className="hk-sample-list">
              {Object.entries(sleepByStage).map(([stage, count]) => (
                <div key={stage} className="hk-sample-row">
                  <span className="hk-date">{stage}</span>
                  <span className="hk-val">{count} entries</span>
                </div>
              ))}
            </div>
            <details className="hk-details">
              <summary>View all {sleepSamples.length} samples</summary>
              <div className="hk-sample-list">
                {sleepSamples.slice(0, maxSamples).map((s, i) => (
                  <div key={i} className="hk-sample-row">
                    <span className="hk-date">{fmtDate(s.startDate)}</span>
                    <span className="hk-val">{s.stage}</span>
                    <span className="hk-source">{fmtTime(s.startDate)} → {fmtTime(s.endDate)}</span>
                  </div>
                ))}
                {sleepSamples.length > maxSamples && (
                  <div className="hk-more">…and {sleepSamples.length - maxSamples} more</div>
                )}
              </div>
            </details>
          </div>
        )}
      </Section>

      {/* ── Not available fallback ── */}
      {available === false && (
        <p className="hk-hint">HealthKit requires a real iOS device — not available in the simulator.</p>
      )}
    </div>
  )
}

// ─── Save Workout Form ────────────────────────────────────────────

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
  const [dur, setDur] = useState(30)
  const [cal, setCal] = useState('')
  const [dist, setDist] = useState('')

  const handleSave = () => {
    const end = new Date()
    const start = new Date(end.getTime() - dur * 60 * 1000)
    onSave({
      workoutType: type,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      ...(cal ? { calories: Number(cal) } : {}),
      ...(dist ? { distance: Number(dist) } : {}),
    })
  }

  return (
    <div className="hk-form">
      <div className="hk-form-title">Save a workout</div>
      <div className="hk-form-row">
        <select value={type} onChange={e => setType(e.target.value as WorkoutActivityType)} disabled={disabled}>
          {workoutTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <label>
          {dur} min
          <input type="range" min={5} max={180} step={5} value={dur} onChange={e => setDur(Number(e.target.value))} disabled={disabled} />
        </label>
      </div>
      <div className="hk-form-row">
        <input type="number" placeholder="Calories (kcal)" value={cal} onChange={e => setCal(e.target.value)} disabled={disabled} />
        <input type="number" placeholder="Distance (m)" value={dist} onChange={e => setDist(e.target.value)} disabled={disabled} />
      </div>
      <button className="hk-btn" onClick={handleSave} disabled={disabled}>💾 Save Workout</button>
    </div>
  )
}
