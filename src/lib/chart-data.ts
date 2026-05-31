/**
 * Helpers to transform HealthKit sample arrays into chart-friendly data.
 */

// ── Daily aggregation ─────────────────────────────────────────────

export interface DailyValue {
  /** YYYY-MM-DD */
  date: string
  /** Label e.g. "Mon", "Tue Jun 2" */
  label: string
  value: number
  count: number
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatShortLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return DAY_NAMES[d.getDay()]
}

function formatFullLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

/** Group samples with `startDate` by calendar day, summing values. */
export function groupByDay<S extends { startDate: string; value: number }>(
  samples: S[],
): DailyValue[] {
  const map = new Map<string, { value: number; count: number }>()
  for (const s of samples) {
    const day = s.startDate.slice(0, 10)
    const e = map.get(day)
    if (e) {
      e.value += s.value
      e.count++
    } else {
      map.set(day, { value: s.value, count: 1 })
    }
  }
  return Array.from(map.entries())
    .map(([date, { value, count }]) => ({
      date,
      label: formatShortLabel(date),
      value: Math.round(value),
      count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Return a full label version for tooltips. */
export function fullLabel(iso: string): string {
  return formatFullLabel(iso)
}

// ── Heart-rate timeline ──────────────────────────────────────────

export interface HeartReading {
  time: string // HH:mm
  value: number
}

export function toTimeline(
  samples: { startDate: string; value: number }[],
  maxPoints = 50,
): HeartReading[] {
  const sorted = [...samples]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, maxPoints)
  return sorted.map((s) => ({
    time: new Date(s.startDate).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }),
    value: Math.round(s.value),
  }))
}

// ── Workout duration by type ──────────────────────────────────────

export interface WorkoutSummary {
  type: string
  totalMinutes: number
  count: number
  totalCalories: number
}

export function summarizeWorkouts(
  workouts: { type: string; duration: number; calories?: number }[],
): WorkoutSummary[] {
  const map = new Map<string, { totalMinutes: number; count: number; totalCalories: number }>()
  for (const w of workouts) {
    const e = map.get(w.type)
    const mins = Math.round(w.duration / 60)
    if (e) {
      e.totalMinutes += mins
      e.count++
      e.totalCalories += w.calories ?? 0
    } else {
      map.set(w.type, { totalMinutes: mins, count: 1, totalCalories: w.calories ?? 0 })
    }
  }
  return Array.from(map.entries())
    .map(([type, s]) => ({ type, ...s }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
}

// ── Sleep stages ──────────────────────────────────────────────────

export interface SleepSummary {
  stage: string
  totalMinutes: number
  count: number
}

export function summarizeSleep(
  samples: { startDate: string; endDate: string; stage: string }[],
): SleepSummary[] {
  const map = new Map<string, { totalMs: number; count: number }>()
  for (const s of samples) {
    const ms = new Date(s.endDate).getTime() - new Date(s.startDate).getTime()
    const e = map.get(s.stage)
    if (e) {
      e.totalMs += ms
      e.count++
    } else {
      map.set(s.stage, { totalMs: ms, count: 1 })
    }
  }
  return Array.from(map.entries())
    .map(([stage, { totalMs, count }]) => ({
      stage,
      totalMinutes: Math.round(totalMs / 60000),
      count,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
}
