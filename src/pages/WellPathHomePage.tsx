import { useNavigate } from 'react-router-dom'
import { SECTIONS, accentStyles, SectionIcon, StatusPill } from '../features/wellpath/components'

export function WellPathHomePage() {
  const navigate = useNavigate()
  const dailyScore = 85
  const completionRate = 86
  const currentMonth = 1

  return (
    <div className="flex min-h-full flex-col">
      {/* Greeting + score card */}
      <div className="bg-white px-5 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Good morning</p>
            <h1 className="text-xl font-bold text-slate-900">Sarah</h1>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
            S
          </div>
        </div>

        {/* Today's Score Card */}
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-100">Today&apos;s score</p>
              <p className="text-4xl font-bold">{dailyScore}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-emerald-100">Completion</p>
              <p className="text-lg font-bold">{completionRate}%</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-800/40">
            <div className="h-full rounded-full bg-white" style={{ width: `${completionRate}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-emerald-100">
            2 of 3 daily sections complete · Lab not due today
          </p>
        </div>

        {/* Rewards Card */}
        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-800">
              Month {currentMonth} reward · $25
            </p>
            <p className="text-[10px] text-emerald-700">Need ≥70 score · ≥80% completion</p>
          </div>
          <div className="mt-2 flex gap-2">
            {[
              { month: 1, earned: true },
              { month: 3, earned: false },
              { month: 6, earned: false },
            ].map((m) => (
              <div
                key={m.month}
                className={`flex flex-1 flex-col items-center rounded-xl py-2 ${
                  m.earned ? "bg-emerald-600 text-white" : "bg-white text-slate-500"
                }`}
              >
                <span className="text-xs font-bold">$25</span>
                <span className="text-[9px]">Mo {m.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Check-in sections */}
      <div className="flex-1 px-5 pb-6 pt-2">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Today&apos;s check-in
        </p>
        <div className="space-y-3">
          {SECTIONS.map((section) => {
            const styles = accentStyles[section.accent]
            const isOral = section.id === "oral"
            const isFood = section.id === "food"

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  if (isOral) navigate('/oral-health')
                  else if (isFood) navigate('/food-diet')
                }}
                className={`flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ${styles.ring} transition active:scale-[0.98] active:bg-slate-50 ${isOral || isFood ? "cursor-pointer" : ""}`}
              >
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}
                >
                  <SectionIcon type={section.icon} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{section.title}</h3>
                    <StatusPill status={section.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{section.subtitle}</p>
                  <p className="mt-1.5 text-sm font-medium text-slate-700">{section.detail}</p>
                  <span
                    className={`mt-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-medium ${styles.badge}`}
                  >
                    {section.weight}
                  </span>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  {section.score !== null ? (
                    <span className="text-2xl font-bold text-slate-900">{section.score}</span>
                  ) : (
                    <span className="text-sm font-medium text-slate-400">—</span>
                  )}
                  <svg
                    className="h-5 w-5 text-slate-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
