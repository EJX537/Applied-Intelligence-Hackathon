import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { HealthKitState, HealthKitActions } from '../hooks/useHealthKit'
import { toTimeline } from '../lib/chart-data'

function d(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
function t(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export function HeartPage({ state, actions }: { state: HealthKitState; actions: HealthKitActions }) {
  const { authorized, loading, heartRateSamples } = state
  const [maxSamples] = useState(20)

  const timeline = useMemo(() => toTimeline(heartRateSamples, 50), [heartRateSamples])

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
    <div className="pt-4 space-y-4">
      {/* Premium Header Banner */}
      <div className="bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl p-5 text-white shadow-sm flex justify-between items-center">
        <div>
          <span className="text-xs text-white/75 font-semibold tracking-wider uppercase">Vitals</span>
          <h2 className="text-xl font-bold m-0 text-white">Heart Rate</h2>
          <span className="text-xs text-white/80">Tracker & Pulse Analytics</span>
        </div>
        {last !== null && (
          <div className="text-right">
            <span className="text-xs text-white/70 block font-semibold">Latest Pulse</span>
            <span className="text-3xl font-extrabold font-mono text-white leading-none">
              {Math.round(last)}
              <span className="text-sm font-normal opacity-85 ml-1">bpm</span>
            </span>
          </div>
        )}
      </div>

      {/* Area chart */}
      {timeline.length > 1 && (
        <div className="rounded-xl bg-red-500/4 border border-red-500/10 p-2">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={timeline} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
              <defs>
                <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: 'var(--color-text)' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['dataMin - 10', 'dataMax + 10']}
                tick={{ fontSize: 10, fill: 'var(--color-text)' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(val) => [`${Number(val)} bpm`, 'Heart Rate']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#hrGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#ef4444' }}
              />
            </AreaChart>
          </ResponsiveContainer>
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
