import type { Patient } from '../types'
import { getScores, giftEligible, scoreColor, scoreBg, initials } from '../utils'

export function PatientCard({
  patient: p,
  onClick,
}: {
  patient: Patient
  onClick: () => void
}) {
  const [b, m3, m6] = getScores(p)
  const diff = m6 - b
  const trendIcon = diff >= 10 ? '📈' : diff <= -5 ? '📉' : '➡️'
  const eligible = giftEligible(p)

  return (
    <div
      onClick={onClick}
      className="mx-4 mb-2.5 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-3.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform duration-100"
    >
      <div
        className="w-[46px] h-[46px] rounded-full flex items-center justify-center font-bold text-base text-white shrink-0"
        style={{ background: p.color }}
      >
        {initials(p.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-slate-900 truncate">{p.name}</div>
        <div className="text-xs text-slate-400 mt-0.5 truncate">{p.dx}</div>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {[b, m3, m6].map((s, i) => (
            <span key={i}>
              {i > 0 && <span className="text-[11px] text-slate-300 mx-0.5">→</span>}
              <span
                className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-lg"
                style={{ background: scoreBg(s), color: scoreColor(s) }}
              >
                {s}%
              </span>
            </span>
          ))}
          {eligible.length > 0 && (
            <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-300">
              🎁
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="text-[22px] font-extrabold" style={{ color: scoreColor(m6) }}>
          {m6}%
        </div>
        <div className="text-[13px]">{trendIcon}</div>
        <div className="text-[10px] text-slate-400">{p.id}</div>
      </div>
    </div>
  )
}
