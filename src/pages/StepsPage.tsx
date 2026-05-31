import { useState } from 'react'
import type { HealthKitState, HealthKitActions } from '../hooks/useHealthKit'

const NF = new Intl.NumberFormat('en-US')

function d(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function StepsPage({ state, actions }: { state: HealthKitState; actions: HealthKitActions }) {
  const { authorized, loading, stepSamples, totalSteps } = state
  const [maxSamples] = useState(20)
  const stepSum = stepSamples.reduce((s, h) => s + h.value, 0)

  return (
    <div className="pt-4 space-y-3">
      <h2 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider m-0">Step Counter</h2>

      {/* Stat cards */}
      {totalSteps !== null && (
        <div className="flex justify-between items-center px-5 py-4 rounded-2xl bg-green-500/8 border border-green-500/15">
          <span className="text-sm font-medium text-[var(--color-text)]">Total (7 days)</span>
          <span className="text-3xl font-bold font-mono text-green-500">
            {NF.format(totalSteps)}
          </span>
        </div>
      )}

      {stepSamples.length > 0 && (
        <div className="flex justify-between items-center px-5 py-3 rounded-xl bg-[var(--color-code-bg)]">
          <span className="text-xs text-[var(--color-text)]">Raw sample sum</span>
          <span className="text-lg font-bold font-mono text-[var(--color-text-h)]">
            {NF.format(Math.round(stepSum))}
          </span>
        </div>
      )}

      {/* Action chips */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => actions.queryStepCount(7)}
          disabled={!authorized || loading}
          className="flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.97] transition-all hover:border-green-500 disabled:opacity-35"
        >
          Total (7d)
        </button>
        <button
          onClick={() => actions.queryStepCount(1)}
          disabled={!authorized || loading}
          className="flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.97] transition-all hover:border-green-500 disabled:opacity-35"
        >
          Today
        </button>
        <button
          onClick={() => actions.querySteps(7)}
          disabled={!authorized || loading}
          className="flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.97] transition-all hover:border-green-500 disabled:opacity-35"
        >
          Samples
        </button>
      </div>

      {/* Sample list */}
      {stepSamples.length > 0 && (
        <div className="pt-1">
          <div className="flex justify-between text-xs font-medium px-3 py-2 bg-[var(--color-code-bg)] rounded-lg mb-1 text-[var(--color-text)]">
            <span>{stepSamples.length} samples</span>
            <span>Sum: {NF.format(Math.round(stepSum))}</span>
          </div>
          {stepSamples.slice(0, maxSamples).map((s, i) => (
            <div key={i} className="flex gap-2 items-center py-1 px-2.5 font-mono text-xs border-b border-gray-500/10 last:border-b-0">
              <span className="shrink-0 text-[var(--color-text)] text-[11px]">{d(s.startDate)}</span>
              <span className="flex-1 text-right font-medium text-[var(--color-text-h)]">
                {NF.format(Math.round(s.value))} {s.unit}
              </span>
              {s.sourceName && (
                <span className="shrink-0 opacity-45 text-[10px] max-w-20 truncate">{s.sourceName}</span>
              )}
            </div>
          ))}
          {stepSamples.length > maxSamples && (
            <p className="text-[11px] opacity-45 italic px-2.5 py-1">…and {stepSamples.length - maxSamples} more</p>
          )}
        </div>
      )}

      {!authorized && (
        <p className="text-sm opacity-50 text-center py-6">
          Authorize HealthKit on the Dashboard tab first.
        </p>
      )}
    </div>
  )
}
