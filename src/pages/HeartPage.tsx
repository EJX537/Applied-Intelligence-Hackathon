import { useState } from 'react'
import type { HealthKitState, HealthKitActions } from '../hooks/useHealthKit'

function d(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
function t(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export function HeartPage({ state, actions }: { state: HealthKitState; actions: HealthKitActions }) {
  const { authorized, loading, heartRateSamples } = state
  const [maxSamples] = useState(20)

  const avg = heartRateSamples.length > 0
    ? Math.round(heartRateSamples.reduce((s, h) => s + h.value, 0) / heartRateSamples.length)
    : null
  const last = heartRateSamples.length > 0
    ? heartRateSamples[heartRateSamples.length - 1].value
    : null
  const min = heartRateSamples.length > 0
    ? Math.min(...heartRateSamples.map(h => h.value))
    : null
  const max = heartRateSamples.length > 0
    ? Math.max(...heartRateSamples.map(h => h.value))
    : null

  return (
    <div className="pt-4 space-y-3">
      <h2 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider m-0">Heart Rate</h2>

      {/* Summary row */}
      {last !== null && (
        <div className="flex items-center justify-center gap-4 py-6">
          <span className="text-5xl font-bold font-mono text-red-500">{Math.round(last)}</span>
          <span className="text-lg text-[var(--color-text)] font-medium">bpm</span>
        </div>
      )}

      {/* Stat grid */}
      {avg !== null && (
        <div className="grid grid-cols-3 gap-2">
          <div className="px-3 py-2.5 rounded-xl bg-[var(--color-code-bg)] text-center">
            <div className="text-xs text-[var(--color-text)]">Average</div>
            <div className="text-lg font-bold font-mono text-[var(--color-text-h)]">{avg}</div>
          </div>
          <div className="px-3 py-2.5 rounded-xl bg-[var(--color-code-bg)] text-center">
            <div className="text-xs text-[var(--color-text)]">Min</div>
            <div className="text-lg font-bold font-mono text-[var(--color-text-h)]">{min ?? '—'}</div>
          </div>
          <div className="px-3 py-2.5 rounded-xl bg-[var(--color-code-bg)] text-center">
            <div className="text-xs text-[var(--color-text)]">Max</div>
            <div className="text-lg font-bold font-mono text-[var(--color-text-h)]">{max ?? '—'}</div>
          </div>
        </div>
      )}

      {/* Action chips */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => actions.queryHeartRate(1)}
          disabled={!authorized || loading}
          className="flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.97] transition-all hover:border-red-500 hover:bg-red-500/8 disabled:opacity-35"
        >
          24h
        </button>
        <button
          onClick={() => actions.queryHeartRate(7)}
          disabled={!authorized || loading}
          className="flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.97] transition-all hover:border-red-500 hover:bg-red-500/8 disabled:opacity-35"
        >
          7 days
        </button>
      </div>

      {/* Sample list */}
      {heartRateSamples.length > 0 && (
        <div className="pt-1">
          <div className="text-xs font-medium px-3 py-2 bg-[var(--color-code-bg)] rounded-lg mb-1 text-[var(--color-text)]">
            {heartRateSamples.length} readings
          </div>
          {heartRateSamples.slice(0, maxSamples).map((s, i) => (
            <div key={i} className="flex gap-2 items-center py-1 px-2.5 font-mono text-xs border-b border-gray-500/10 last:border-b-0">
              <span className="shrink-0 text-[var(--color-text)] text-[11px]">{d(s.startDate)} {t(s.startDate)}</span>
              <span className="flex-1 text-right font-medium text-[var(--color-text-h)]">
                {Math.round(s.value)} {s.unit}
              </span>
              {s.sourceName && (
                <span className="shrink-0 opacity-45 text-[10px] max-w-20 truncate">{s.sourceName}</span>
              )}
            </div>
          ))}
          {heartRateSamples.length > maxSamples && (
            <p className="text-[11px] opacity-45 italic px-2.5 py-1">…and {heartRateSamples.length - maxSamples} more</p>
          )}
        </div>
      )}

      {!authorized && (
        <p className="text-sm opacity-50 text-center py-6">Authorize HealthKit on the Dashboard tab first.</p>
      )}
    </div>
  )
}
