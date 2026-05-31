import type { Patient } from '../types'
import { initials } from '../utils'

export function GiftPatientCard({
  patient: p,
  score,
  reasons,
  dimmed,
  footnote,
  onClick,
}: {
  patient: Patient
  score: number
  reasons: string[]
  dimmed: boolean
  footnote?: string
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`mx-4 mb-2.5 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-3.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform duration-100 ${dimmed ? 'opacity-70' : ''}`}
    >
      <div className={`text-[28px] shrink-0 ${dimmed ? 'opacity-40' : ''}`}>
        🎁
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-slate-900 truncate">{p.name}</div>
        <div className="text-xs text-slate-400 mt-0.5">
          {p.id} · Score: {score}%
          {footnote ? ` — ${footnote}` : ''}
        </div>
        {reasons.length > 0 && (
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {reasons.map((r) => (
              <span
                key={r}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              >
                ✓ {r}
              </span>
            ))}
          </div>
        )}
      </div>
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] text-white shrink-0"
        style={{ background: p.color }}
      >
        {initials(p.name)}
      </div>
    </div>
  )
}
