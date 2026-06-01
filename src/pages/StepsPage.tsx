import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { HealthKitState, HealthKitActions } from '../hooks/useHealthKit'
import { groupByDay, fullLabel } from '../lib/chart-data'

const NF = new Intl.NumberFormat('en-US')

function d(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function StepsPage({ state, actions }: { state: HealthKitState; actions: HealthKitActions }) {
  const { authorized, loading, stepSamples, totalSteps } = state
  const [maxSamples] = useState(20)
  const stepSum = stepSamples.reduce((s, h) => s + h.value, 0)

  const daily = useMemo(() => groupByDay(stepSamples), [stepSamples])

  return (
    <div className="pt-4 space-y-4">
      {/* Premium Header Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-sm flex justify-between items-center">
        <div>
          <span className="text-xs text-white/75 font-semibold tracking-wider uppercase">Active Steps</span>
          <h2 className="text-xl font-bold m-0 text-white">Daily Steps</h2>
          <span className="text-xs text-white/80">Tracker & Analytics</span>
        </div>
        {totalSteps !== null && (
          <div className="text-right">
            <span className="text-xs text-white/70 block font-semibold">7-Day Total</span>
            <span className="text-3xl font-extrabold font-mono text-white leading-none">
              {NF.format(totalSteps)}
            </span>
          </div>
        )}
      </div>

      {/* Daily bar chart */}
      {daily.length > 0 && (
        <div className="pt-1">
          <p className="text-xs font-medium text-[var(--color-text)] mb-2 px-1">Daily steps</p>
          <div className="rounded-xl bg-green-500/4 border border-green-500/10 p-2">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={daily} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'var(--color-text)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(_, payload) => (payload?.[0] ? fullLabel(payload[0].payload.date) : '')}
                  formatter={(val) => [NF.format(Number(val)), 'steps']}
                />
                <Bar
                  dataKey="value"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
        <p className="text-sm opacity-50 text-center py-6">Authorize HealthKit on the Dashboard tab first.</p>
      )}
    </div>
  )
}
