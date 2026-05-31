import type { HealthKitState, HealthKitActions } from '../hooks/useHealthKit'

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
        {stepSamples.length === 0 && totalSteps === null && avgHR === null && (
          <p className="text-sm opacity-50 text-center py-6">
            No data yet — use the tabs below to query steps, heart rate, and activity.
          </p>
        )}
      </div>

      {available === false && (
        <p className="text-sm opacity-60 px-4 py-3 bg-[var(--color-code-bg)] rounded-xl">
          HealthKit requires a real iOS device.
        </p>
      )}
    </div>
  )
}
