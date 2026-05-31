import { useState, useEffect, useMemo, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { isNative } from '@pwa-kit/sdk'
import { useHealthKitCtx } from '../contexts/HealthKitContext'

const NF = new Intl.NumberFormat('en-US')

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

type ViewMode = 'today' | 'week' | 'month'

// ── Helpers ──────────────────────────────────────────────────────

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - startOfYear.getTime()
  return Math.ceil((diff / 86400000 + startOfYear.getDay() + 1) / 7)
}

function groupByWeek(
  samples: { startDate: string; value: number }[],
): { label: string; value: number; date: string }[] {
  if (samples.length === 0) return []
  const weeks: Map<string, { sum: number; count: number; dates: Date[] }> = new Map()
  for (const s of samples) {
    const d = new Date(s.startDate)
    const wk = getWeekNumber(d)
    const key = `${d.getFullYear()}-W${String(wk).padStart(2, '0')}`
    const entry = weeks.get(key) ?? { sum: 0, count: 0, dates: [] }
    entry.sum += s.value
    entry.count++
    entry.dates.push(d)
    weeks.set(key, entry)
  }
  return [...weeks.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, entry]) => ({
      label: key.replace(/^\d+-W/, 'W'),
      value: Math.round(entry.sum / entry.count),
      date: entry.dates.sort((a, b) => a.getTime() - b.getTime())[Math.floor(entry.dates.length / 2)].toISOString(),
    }))
}

function groupByDay(
  samples: { startDate: string; value: number }[],
): { label: string; value: number; date: string }[] {
  if (samples.length === 0) return []
  const days: Map<string, { sum: number; date: Date }> = new Map()
  for (const s of samples) {
    const d = new Date(s.startDate)
    const key = d.toISOString().slice(0, 10)
    const entry = days.get(key) ?? { sum: 0, date: d }
    entry.sum += s.value
    days.set(key, entry)
  }
  return [...days.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([_, entry]) => ({
      label: entry.date.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' }),
      value: Math.round(entry.sum),
      date: entry.date.toISOString(),
    }))
}

// ── Component ────────────────────────────────────────────────────

export function StepsPage() {
  const { state, actions } = useHealthKitCtx()
  const { available, authorized, loading, stepSamples, totalSteps } = state
  const [view, setView] = useState<ViewMode>('today')

  // ── Data fetching ──
  const fetchData = useCallback(
    (mode: ViewMode) => {
      if (!authorized) return
      switch (mode) {
        case 'today':
          actions.queryStepCount(1)
          actions.querySteps(1)
          break
        case 'week':
          actions.queryStepCount(7)
          actions.querySteps(7)
          break
        case 'month':
          actions.queryStepCount(30)
          actions.querySteps(30)
          break
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [authorized],
  )

  useEffect(() => {
    if (!authorized) return
    fetchData(view)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, authorized])

  // ── Chart data ──
  const chartData = useMemo(() => {
    if (stepSamples.length === 0) return []
    switch (view) {
      case 'today':
        return stepSamples.slice(0, 48).map((s) => ({
          label: timeLabel(s.startDate),
          value: Math.round(s.value),
          date: s.startDate,
        }))
      case 'week':
        return groupByDay(stepSamples)
      case 'month':
        return groupByWeek(stepSamples)
    }
  }, [stepSamples, view])

  const chartTitle =
    view === 'today' ? "Today's breakdown" : view === 'week' ? 'Daily steps' : 'Weekly averages'

  // ── Not native ──
  if (!isNative) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
          <svg className="h-8 w-8 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M4 16l4-6 4 3 4-7 4 5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="4" cy="16" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="20" cy="11" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">HealthKit Unavailable</h2>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
          Step tracking requires the PWAKit native iOS app.
        </p>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
          <svg className="h-8 w-8 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Failed to load steps</h2>
        <p className="mt-2 max-w-xs text-sm text-slate-500">{state.error}</p>
        <button
          type="button"
          onClick={() => fetchData(view)}
          className="mt-6 rounded-2xl bg-green-600 px-8 py-3 text-sm font-semibold text-white transition active:bg-green-700 active:scale-95"
        >
          Retry
        </button>
      </div>
    )
  }

  if (available && !authorized) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <svg className="h-8 w-8 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">HealthKit Access Required</h2>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
          Grant step reading permission to see your daily step data.
        </p>
        <button
          type="button"
          onClick={() => actions.requestAuthorization()}
          className="mt-6 rounded-2xl bg-green-600 px-8 py-3 text-sm font-semibold text-white transition active:bg-green-700 active:scale-95"
        >
          Authorize HealthKit
        </button>
      </div>
    )
  }

  return (
    <div className="pt-4 space-y-4 pb-4">
      {/* ── Hero card (fixed height) ── */}
      <div className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-5 text-white shadow-sm min-h-[160px] flex flex-col justify-between">
        <div>
          {/* Fixed-width label to prevent shift on Today/Week/Month swap */}
          <p className="text-xs font-semibold uppercase tracking-wider text-green-100 w-24">
            {view === 'today' ? 'Today' : view === 'week' ? 'This week' : 'This month'}
          </p>
          {/* Fixed-height number zone */}
          <div className="mt-1 h-[48px] flex items-center">
            <p className="text-5xl font-bold tracking-tight tabular-nums">
              {totalSteps !== null ? NF.format(totalSteps) : '—'}
            </p>
          </div>
        </div>

        {/* Fixed-height info zone — always present to prevent collapse */}
        <div className="min-h-[72px] flex flex-col justify-end">
          {view === 'today' ? (
            <>
              <p className="text-sm text-green-100 min-h-[20px] tabular-nums">
                {totalSteps !== null
                  ? `${((totalSteps / 10000) * 100).toFixed(0)}% of 10,000 daily goal`
                  : loading
                    ? 'Loading…'
                    : 'No data yet'}
              </p>
              {/* Progress bar — always rendered, hidden when null */}
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: totalSteps !== null ? `${Math.min(100, (totalSteps / 10000) * 100)}%` : '0%' }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-green-100 min-h-[20px]">
              {totalSteps !== null
                ? `${NF.format(totalSteps)} total`
                : loading
                  ? 'Loading…'
                  : 'No data'}
            </p>
          )}
        </div>
      </div>

      {/* ── View toggle (always visible) ── */}
      <div className="flex rounded-xl bg-slate-100 p-1">
        {(
          [
            { key: 'today' as ViewMode, label: 'Today' },
            { key: 'week' as ViewMode, label: 'Week' },
            { key: 'month' as ViewMode, label: 'Month' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setView(tab.key)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
              view === tab.key
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Chart area (fixed height) ── */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          {chartTitle}
        </p>
        <div className="h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(val) => [NF.format(Number(val)), 'steps']}
                />
                <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={view === 'month' ? 48 : 20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              {loading ? (
                <div className="animate-pulse space-y-3 w-full px-4">
                  <div className="h-4 w-24 mx-auto rounded bg-slate-200" />
                  <div className="h-44 rounded-xl bg-slate-200" />
                </div>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M4 16l4-6 4 3 4-7 4 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-500">
                    {view === 'today'
                      ? 'No steps recorded today yet.'
                      : view === 'week'
                        ? 'No step data for this week.'
                        : 'No step data for this month.'}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
