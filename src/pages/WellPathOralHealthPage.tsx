import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ORAL_HEALTH_DAILY_WEIGHT,
  ORAL_HEALTH_QUESTIONS,
  calculateOralHealthScore,
} from '../features/wellpath/oralHealthQuestions'
import { SectionIcon } from '../features/wellpath/components'

export function WellPathOralHealthPage() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const answeredCount = Object.keys(answers).length
  const totalQuestions = ORAL_HEALTH_QUESTIONS.length
  const allAnswered = answeredCount === totalQuestions
  const { scoreOutOf100, dailyContribution } = calculateOralHealthScore(answers)
  const dailyWeightPercent = ORAL_HEALTH_DAILY_WEIGHT * 100

  function selectOption(questionId: string, optionLabel: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionLabel }))
  }

  function handleBack() {
    navigate('/')
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-4 pb-3 pt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition active:bg-slate-200"
            aria-label="Back to home"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-slate-900">Oral Health</h1>
            <p className="text-xs text-slate-500">
              Daily check-in · {dailyWeightPercent}% of daily score
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500 text-white">
            <SectionIcon type="oral" />
          </div>
        </div>

        <div className="mt-4 px-1">
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
      </div>

      {/* Questions */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
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
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </article>
          ))}

          {allAnswered && (
            <div className="rounded-2xl bg-violet-600 p-5 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-200">
                Your scores
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-[11px] text-violet-200">Oral health score</p>
                  <p className="mt-1 text-3xl font-bold">{scoreOutOf100}</p>
                  <p className="text-[11px] text-violet-200">out of 100</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-[11px] text-violet-200">Daily score contribution</p>
                  <p className="mt-1 text-3xl font-bold">{dailyContribution}</p>
                  <p className="text-[11px] text-violet-200">
                    {dailyWeightPercent}% of daily score
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Save button */}
      <div className="border-t border-slate-200 bg-white px-4 py-3 pb-6">
        <button
          type="button"
          disabled={!allAnswered}
          className={`w-full rounded-2xl py-3.5 text-sm font-semibold transition ${
            allAnswered
              ? "bg-violet-600 text-white active:bg-violet-700"
              : "cursor-not-allowed bg-slate-200 text-slate-400"
          }`}
        >
          {allAnswered ? "Save oral health check-in" : `Answer all ${totalQuestions} questions`}
        </button>
      </div>
    </div>
  )
}
