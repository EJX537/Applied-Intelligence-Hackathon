import type { RewardsPlan } from '../types'

interface Props {
  plan: RewardsPlan
  loading?: boolean
}

export function RewardsCard({ plan, loading }: Props) {
  return (
    <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-emerald-800">
          {loading
            ? 'Loading rewards…'
            : `Month ${plan.currentMonth} reward · $${plan.milestones[0]?.amount ?? 25}`}
        </p>
        <p className="text-[10px] text-emerald-700">
          {loading ? '…' : `Need ≥${plan.thresholdScore} score · ≥${plan.thresholdCompletion}% completion`}
        </p>
      </div>
      <div className="mt-2 flex gap-2">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-1 flex-col items-center rounded-xl bg-white/60 py-2 animate-pulse"
              >
                <div className="mb-1 h-3 w-8 rounded bg-white/60" />
                <div className="h-2 w-10 rounded bg-white/60" />
              </div>
            ))
          : plan.milestones.map((m) => (
              <div
                key={m.month}
                className={`flex flex-1 flex-col items-center rounded-xl py-2 ${
                  m.earned
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-500'
                }`}
              >
                <span className="text-xs font-bold">${m.amount}</span>
                <span className="text-[9px]">Mo {m.month}</span>
              </div>
            ))}
      </div>
    </div>
  )
}
