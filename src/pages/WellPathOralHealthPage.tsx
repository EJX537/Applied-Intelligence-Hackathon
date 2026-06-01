import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { insforge } from '../shared/api/insforgeClient'
import {
  ORAL_HEALTH_DAILY_WEIGHT,
  ORAL_HEALTH_QUESTIONS,
  ORAL_HEALTH_MAX_POINTS,
  calculateOralHealthScore,
} from '../features/wellpath/oralHealthQuestions'
import { submitOralHealthCheckIn } from '../features/wellpath/services/oralHealthApi'
import { SectionIcon } from '../features/wellpath/components'

export function WellPathOralHealthPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [todayScore, setTodayScore] = useState<number | null>(null)
  const [loadingCheck, setLoadingCheck] = useState(true)

  // ── Check if already submitted today ──
  useEffect(() => {
    if (!user?.id) {
      setLoadingCheck(false)
      return
    }

    const today = new Date().toISOString().slice(0, 10)
    let cancelled = false

    const check = async () => {
      try {
        // Resolve patient ID (may differ from auth user ID for seed users)
        let patientId = user.id
        if (user.email) {
          const checkRes = await insforge.database
            .from('patients')
            .select('id')
            .eq('id', user.id)
            .maybeSingle()

          if (!checkRes.data) {
            const emailRes = await insforge.database
              .from('patients')
              .select('id')
              .eq('patient_code', user.email)
              .maybeSingle()
            if (emailRes.data) {
              patientId = emailRes.data.id
            }
          }
        }

        const { data } = await insforge.database
          .from('oral_responses')
          .select('normalized_score')
          .eq('patient_id', patientId)
          .eq('record_date', today)
          .maybeSingle()

        if (cancelled) return
        if (data && (data as { normalized_score: number }).normalized_score != null) {
          setTodayScore((data as { normalized_score: number }).normalized_score)
          setSubmitted(true)
        }
      } catch {
        // ignore fetch errors
      } finally {
        if (!cancelled) setLoadingCheck(false)
      }
    }

    check()

    return () => { cancelled = true }
  }, [user?.id])

  const answeredCount = Object.keys(answers).length
  const totalQuestions = ORAL_HEALTH_QUESTIONS.length
  const allAnswered = answeredCount === totalQuestions
  const { rawPoints, scoreOutOf100, dailyContribution } = calculateOralHealthScore(answers)
  const dailyWeightPercent = ORAL_HEALTH_DAILY_WEIGHT * 100

  // Use the saved score when already submitted
  const displayScore = todayScore ?? scoreOutOf100
  const displayDailyContribution = submitted && todayScore != null
    ? Math.round((todayScore * ORAL_HEALTH_DAILY_WEIGHT) * 10) / 10
    : dailyContribution

  function selectOption(questionId: string, optionLabel: string) {
    if (submitting || submitted) return // lock answers once submitted
    setAnswers((prev) => ({ ...prev, [questionId]: optionLabel }))
  }

  const handleSubmit = useCallback(async () => {
    if (!allAnswered || submitting || submitted) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      await submitOralHealthCheckIn({
        userId: user?.id ?? '',
        userEmail: user?.email,
        date: new Date().toISOString().slice(0, 10),
        answers,
        scoreOutOf100,
        rawPoints,
        maxPoints: ORAL_HEALTH_MAX_POINTS,
      })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to save check-in. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }, [allAnswered, submitting, submitted, answers, scoreOutOf100, rawPoints])

  // ── Loading while checking today's status ──
  if (loadingCheck) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-violet-500" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-30" />
          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="mt-3 text-sm text-slate-500">Checking today&apos;s status…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Back link */}
      <button
        type="button"
        onClick={() => navigate('/user')}
        className="flex items-center gap-1 text-xs text-slate-500 pt-3 pb-1 cursor-pointer"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Dashboard
      </button>

      {/* Header info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-500 text-white">
          <SectionIcon type="oral" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Oral Health</h2>
          <p className="text-xs text-slate-500">
            Daily check-in · {dailyWeightPercent}% of daily score
          </p>
        </div>
      </div>

      {/* Progress bar (hidden after submission) */}
      {!submitted && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">
              {answeredCount} of {totalQuestions} answered
            </span>
            <span className="text-slate-400">
              {Math.round((answeredCount / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-violet-100">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-300"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Submitted state: show score card ── */}
      {submitted ? (
        <div className="flex-1 flex flex-col items-center justify-center pb-4">
          {/* Success checkmark */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
            <svg className="h-8 w-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-emerald-700 mb-1">
            {todayScore != null ? 'Today\'s check-in complete!' : 'Check-in saved!'}
          </p>
          <p className="text-xs text-slate-500 mb-6">
            {todayScore != null
              ? 'You already completed today\'s oral health check-in'
              : 'Today\'s oral health has been recorded'}
          </p>

          {/* Score card */}
          <div className="w-full rounded-2xl bg-violet-600 p-5 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-200">
              Your scores
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-[11px] text-violet-200">Oral health score</p>
                <p className="mt-1 text-3xl font-bold">{displayScore}</p>
                <p className="text-[11px] text-violet-200">out of 100</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-[11px] text-violet-200">Daily score contribution</p>
                <p className="mt-1 text-3xl font-bold">{displayDailyContribution}</p>
                <p className="text-[11px] text-violet-200">
                  {dailyWeightPercent}% of daily score
                </p>
              </div>
            </div>
          </div>

          {/* Back to dashboard */}
          <button
            type="button"
            onClick={() => navigate('/user')}
            className="mt-6 w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition active:bg-slate-800 active:scale-[0.98]"
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <>
          {/* ── Questions ── */}
          <div className="flex-1 space-y-4 pb-4">
            {ORAL_HEALTH_QUESTIONS.map((q, index) => (
              <article
                key={q.id}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >
                <div className="mb-3 flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium leading-snug text-slate-900">
                    {q.question}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pl-8">
                  {q.options.map((option) => {
                    const selected = answers[q.id] === option.label
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => selectOption(q.id, option.label)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition active:scale-95 ${
                          selected
                            ? 'bg-violet-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </article>
            ))}

            {/* Error banner */}
            {submitError && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3">
                <svg className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-rose-900">Failed to save</p>
                  <p className="text-xs text-rose-600 mt-0.5">{submitError}</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Save button ── */}
          <div className="border-t border-slate-200 bg-white -mx-4 px-4 py-3 pb-4">
            <button
              type="button"
              disabled={!allAnswered || submitting}
              onClick={handleSubmit}
              className={`flex items-center justify-center w-full rounded-2xl py-3.5 text-sm font-semibold transition ${
                !allAnswered
                  ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                  : submitting
                    ? 'cursor-wait bg-violet-400 text-white'
                    : 'bg-violet-600 text-white active:bg-violet-700 active:scale-[0.98]'
              }`}
            >
              {submitting ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-30" />
                    <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Saving…
                </>
              ) : allAnswered ? (
                'Save oral health check-in'
              ) : (
                `Answer all ${totalQuestions} questions`
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
