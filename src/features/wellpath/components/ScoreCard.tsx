import type { DailyScore } from '../types'

interface Props {
  score: DailyScore
  loading?: boolean
}

export function ScoreCard({ score, loading }: Props) {
  return (
    <div className="mt-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 text-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-emerald-100">Today&apos;s score</p>
          <p className="text-4xl font-bold">
            {loading ? <span className="opacity-40">—</span> : score.total}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-emerald-100">Completion</p>
          <p className="text-lg font-bold">
            {loading ? <span className="opacity-40">—</span> : `${score.completionRate}%`}
          </p>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-800/40">
        {loading ? (
          <div className="h-full w-1/3 animate-pulse rounded-full bg-white/30" />
        ) : (
          <div
            className="h-full rounded-full bg-white transition-all duration-700"
            style={{ width: `${score.completionRate}%` }}
          />
        )}
      </div>
      <p className="mt-2 text-[11px] text-emerald-100">
        {loading ? 'Loading daily data…' : score.message}
      </p>
    </div>
  )
}
