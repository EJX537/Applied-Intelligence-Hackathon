import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { isNative } from '@pwa-kit/sdk'
import { useWellPathData } from '../hooks/useWellPathData'
import { useHealthKitCtx } from '../contexts/HealthKitContext'
import { ScoreCard } from '../features/wellpath/components/ScoreCard'
import { RewardsCard } from '../features/wellpath/components/RewardsCard'
import { SectionCard } from '../features/wellpath/components/SectionCard'
import type { SectionData } from '../features/wellpath/types'

const NF = new Intl.NumberFormat('en-US')

// ── Loading skeleton ─────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="bg-white -mx-4 px-4 pb-4 pt-2">
        <div className="flex items-center justify-between animate-pulse">
          <div className="space-y-1">
            <div className="h-3 w-16 rounded bg-slate-200" />
            <div className="h-6 w-24 rounded bg-slate-200" />
          </div>
          <div className="h-10 w-10 rounded-full bg-slate-200" />
        </div>
        <ScoreCard
          score={{ total: 0, completionRate: 0, completedSections: 0, totalSections: 0, message: '' }}
          loading
        />
        <RewardsCard plan={{ currentMonth: 1, thresholdScore: 70, thresholdCompletion: 80, milestones: [] }} loading />
      </div>
      <div className="flex-1 pb-6 pt-2">
        <div className="mb-3 h-3 w-28 rounded bg-slate-200 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 animate-pulse">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="h-3 w-40 rounded bg-slate-200" />
                <div className="h-3 w-32 rounded bg-slate-200" />
              </div>
              <div className="h-9 w-9 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Error state ──────────────────────────────────────────────────

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
        <svg className="h-8 w-8 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-900">Unable to load dashboard</h2>
      <p className="mt-2 max-w-xs text-sm text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-2xl bg-green-600 px-8 py-3 text-sm font-semibold text-white transition active:bg-green-700 active:scale-95"
      >
        Try again
      </button>
    </div>
  )
}

// ── Empty state ──────────────────────────────────────────────────

function DashboardEmpty({ message }: { message: string }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <svg className="h-8 w-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-900">Welcome to WellPath</h2>
      <p className="mt-2 max-w-xs text-sm text-slate-500">{message}</p>
      <button
        type="button"
        className="mt-6 rounded-2xl bg-green-600 px-8 py-3 text-sm font-semibold text-white transition active:bg-green-700 active:scale-95"
      >
        Start your first check-in
      </button>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────

export function WellPathHomePage() {
  const navigate = useNavigate()
  const { state: dashState, refetch } = useWellPathData()
  const { state: hkState } = useHealthKitCtx()

  // ── Merge real step data into dashboard sections ─────────────
  const sections = useMemo(() => {
    if (dashState.status !== 'ready') return []

    return dashState.data.sections.map((sec) => {
      if (sec.def.id !== 'steps') return sec

      const todaySteps = hkState.totalSteps
      const isLoading = isNative && (hkState.available === null || hkState.loading)

      const stepsData: SectionData = {
        ...sec.data,
        status: todaySteps !== null ? 'logged' : sec.data.status,
        score: todaySteps !== null
          ? Math.min(100, Math.round((todaySteps / 10000) * 100))
          : sec.data.score,
        detail: todaySteps !== null
          ? `${NF.format(todaySteps)} steps today`
          : isLoading
            ? 'Loading step data…'
            : sec.data.detail,
        loading: isLoading,
        error: hkState.error ?? undefined,
      }
      return { ...sec, data: stepsData }
    })
  }, [dashState, hkState])

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'oral') navigate('/user/oral-health')
    else if (sectionId === 'food') navigate('/user/food-diet')
    else if (sectionId === 'steps') navigate('/user/steps')
    else if (sectionId === 'lab') navigate('/user/lab')
  }

  // ── Loading ──
  if (dashState.status === 'loading') return <DashboardSkeleton />

  // ── Error ──
  if (dashState.status === 'error') return <DashboardError message={dashState.error} onRetry={refetch} />

  // ── Empty ──
  if (dashState.status === 'empty') return <DashboardEmpty message={dashState.message} />

  // ── Ready ──
  const { data } = dashState

  return (
    <div className="flex min-h-full flex-col">
      {/* Greeting + score card — spans full width */}
      <div className="bg-white -mx-4 px-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Good morning</p>
            <h1 className="text-xl font-bold text-slate-900">{data.user.name}</h1>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
            {data.user.avatarInitial}
          </div>
        </div>

        <ScoreCard score={data.dailyScore} />
        <RewardsCard plan={data.rewards} />
      </div>

      {/* Check-in sections */}
      <div className="flex-1 pb-6 pt-2">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Today&apos;s check-in
        </p>
        <div className="space-y-3">
          {sections.map(({ def, data: secData }) => (
            <SectionCard key={def.id} def={def} data={secData} onNavigate={handleNavigate} />
          ))}
        </div>
      </div>
    </div>
  )
}
