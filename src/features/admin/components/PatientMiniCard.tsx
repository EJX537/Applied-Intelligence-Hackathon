import type { Patient } from '../types'
import { getScores, scoreColor, initials } from '../utils'

export function PatientMiniCard({
  patient: p,
  onClick,
}: {
  patient: Patient
  onClick: () => void
}) {
  const [b, , m6] = getScores(p)
  const diff = m6 - b
  const trendIcon = diff >= 10 ? '▲' : diff <= -5 ? '▼' : '→'
  const trendColor = diff >= 10 ? 'text-green-600' : diff <= -5 ? 'text-red-500' : 'text-slate-400'

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
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="text-[22px] font-extrabold" style={{ color: scoreColor(m6) }}>
          {m6}%
        </div>
        <div className={`text-xs font-semibold ${trendColor}`}>
          {trendIcon} {diff >= 0 ? '+' : ''}
          {diff}
        </div>
      </div>
    </div>
  )
}
