import { useMemo } from 'react'
import { BarChart, Bar, AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import type { HealthKitState, HealthKitActions } from '../hooks/useHealthKit'
import { groupByDay, toTimeline, fullLabel } from '../lib/chart-data'

const NF = new Intl.NumberFormat('en-US')

function Pill({ ok, label }: { ok: boolean | null; label: string }) {
  const cls =
    ok === null
      ? 'border-gray-500/30 bg-gray-500/8 text-gray-400'
      : ok
        ? 'border-green-500/40 bg-green-500/10 text-green-500'
        : 'border-red-500/40 bg-red-500/10 text-red-500'
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${cls}`}>
      {ok === null ? '⋯' : ok ? '✅' : '❌'} {label}
    </span>
  )
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string
  value: number | string | null
  unit?: string
}) {
  if (value === null) return null
  return (
    <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-green-500/6 border border-green-500/12">
      <span className="text-sm text-[var(--color-text)]">{label}</span>
      <span className="text-xl font-bold font-mono text-green-500">
        {typeof value === 'number' ? NF.format(value) : value}
        {unit && <span className="text-sm font-normal opacity-70 ml-0.5">{unit}</span>}
      </span>
    </div>
  )
}

export function DashboardPage({
  state,
  actions,
}: {
  state: HealthKitState
  actions: HealthKitActions
}) {
  const { available, authorized, loading, error, totalSteps, stepSamples, heartRateSamples, workouts, sleepSamples } = state
  const avgHR = heartRateSamples.length > 0
    ? Math.round(heartRateSamples.reduce((s, h) => s + h.value, 0) / heartRateSamples.length)
    : null
  const totalWorkoutCal = workouts.reduce((s, w) => s + (w.calories ?? 0), 0)

  const dailySteps = useMemo(() => groupByDay(stepSamples).slice(-7), [stepSamples])
  const hrTimeline = useMemo(() => toTimeline(heartRateSamples, 40), [heartRateSamples])

  return (
    <div className="pt-4 space-y-3">
      {/* Status */}
      <div className="flex items-center gap-2 flex-wrap">
        <Pill ok={available} label="Available" />
        <Pill ok={authorized} label="Authorized" />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <button
          onClick={actions.checkAvailability}
          disabled={loading}
          className="min-h-[44px] w-full px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.98] transition-all hover:border-green-500 hover:bg-green-500/8 disabled:opacity-35 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking…' : '🔍 Check HealthKit'}
        </button>
        <button
          onClick={() => actions.requestAuthorization()}
          disabled={loading || authorized || available === false}
          className="min-h-[44px] w-full px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.98] transition-all hover:border-green-500 hover:bg-green-500/8 disabled:opacity-35 disabled:cursor-not-allowed"
        >
          {authorized ? '✅ Authorized' : '🔐 Request Access'}
        </button>
      </div>

      {error && (
        <p className="px-4 py-3 rounded-xl bg-red-500/8 text-red-500 text-sm font-medium border border-red-500/20">{error}</p>
      )}

      {/* Quick stats */}
      <div className="flex flex-col gap-2.5">
        <h2 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider m-0">Today's Overview</h2>
        {totalSteps !== null && <StatCard label="Steps" value={totalSteps} />}
        {avgHR !== null && <StatCard label="Avg Heart Rate" value={`${avgHR} bpm`} />}
        {totalWorkoutCal > 0 && <StatCard label="Workout Calories" value={totalWorkoutCal} unit="kcal" />}
        {sleepSamples.length > 0 && <StatCard label="Sleep Samples" value={sleepSamples.length} />}
      </div>

      {/* Mini step chart */}
      {dailySteps.length > 1 && (
        <div className="pt-1">
          <p className="text-xs font-medium text-[var(--color-text)] mb-2 px-1">Weekly steps</p>
          <div className="rounded-xl bg-green-500/4 border border-green-500/10 p-2">
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={dailySteps} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  labelFormatter={(_, payload) => (payload?.[0] ? fullLabel(payload[0].payload.date) : '')}
                  formatter={(val) => [NF.format(Number(val)), 'steps']}
                />
                <Bar dataKey="value" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Mini heart rate sparkline */}
      {hrTimeline.length > 1 && (
        <div>
          <p className="text-xs font-medium text-[var(--color-text)] mb-2 px-1">Heart rate</p>
          <div className="rounded-xl bg-red-500/4 border border-red-500/10 p-2">
            <ResponsiveContainer width="100%" height={70}>
              <AreaChart data={hrTimeline} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="dashHr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={1.5} fill="url(#dashHr)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {stepSamples.length === 0 && totalSteps === null && avgHR === null && (
        <p className="text-sm opacity-50 text-center py-6">
          No data yet — use the tabs below to query steps, heart rate, and activity.
        </p>
      )}

      {available === false && (
        <p className="text-sm opacity-60 px-4 py-3 bg-[var(--color-code-bg)] rounded-xl">
          HealthKit requires a real iOS device.
        </p>
      )}
    </div>
  )
}
