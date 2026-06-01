import type { SectionDef, SectionData, SectionAccent } from '../types'
import { SectionIcon, StatusPill } from '../components'

const accentStyles: Record<SectionAccent, { icon: string; ring: string; badge: string }> = {
  sky: { icon: 'bg-sky-500 text-white', ring: 'ring-sky-100', badge: 'bg-sky-100 text-sky-700' },
  amber: { icon: 'bg-amber-500 text-white', ring: 'ring-amber-100', badge: 'bg-amber-100 text-amber-800' },
  violet: { icon: 'bg-violet-500 text-white', ring: 'ring-violet-100', badge: 'bg-violet-100 text-violet-700' },
  emerald: { icon: 'bg-emerald-500 text-white', ring: 'ring-emerald-100', badge: 'bg-emerald-100 text-emerald-700' },
}

interface Props {
  def: SectionDef
  data: SectionData
  onNavigate: (sectionId: string) => void
}

export function SectionCard({ def, data, onNavigate }: Props) {
  const styles = accentStyles[def.accent]
  const isInteractive = def.id === 'steps' || def.id === 'lab' || def.id === 'oral' || def.id === 'food'

  if (data.loading) {
    return (
      <div className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 animate-pulse">
        <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-200" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-3 w-40 rounded bg-slate-200" />
          <div className="h-3 w-32 rounded bg-slate-200" />
        </div>
        <div className="h-9 w-9 rounded bg-slate-200" />
      </div>
    )
  }

  if (data.error) {
    return (
      <div className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-rose-200">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-500`}>
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-rose-900">{def.title}</h3>
          <p className="mt-0.5 text-xs text-rose-600">{data.error}</p>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => isInteractive && onNavigate(def.id)}
      disabled={!isInteractive}
      className={`flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ${isInteractive ? styles.ring + ' cursor-pointer active:scale-[0.98] active:bg-slate-50 transition' : 'cursor-default'}`}
    >
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}>
        <SectionIcon type={def.icon} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900">{def.title}</h3>
          {!def.hideStatus && <StatusPill status={data.status} />}
        </div>
        {def.subtitle && <p className="mt-0.5 text-xs text-slate-500">{def.subtitle}</p>}
        <p className="mt-1.5 text-sm font-medium text-slate-700">{data.detail}</p>
        <span className={`mt-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-medium ${styles.badge}`}>
          {def.weightLabel}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        {!def.hideScore && data.score !== null ? (
          <span className="text-2xl font-bold text-slate-900">{data.score}</span>
        ) : !def.hideScore ? (
          <span className="text-sm font-medium text-slate-400">—</span>
        ) : null}
        {isInteractive && (
          <svg className="h-5 w-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  )
}
