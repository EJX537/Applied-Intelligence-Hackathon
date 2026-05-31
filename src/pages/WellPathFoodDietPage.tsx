import { useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionIcon } from '../features/wellpath/components'

const FOOD_DIET_DAILY_WEIGHT = 0.35

type ViewMode = 'today' | 'week'

type MealAnalysis = {
  id: string
  previewUrl: string
  status: 'analyzing' | 'done'
  result?: {
    name: string
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
    scoreOutOf100: number
  }
}

const MOCK_MEAL_RESULTS = [
  {
    name: 'Grilled chicken salad',
    calories: 420,
    protein: 32,
    carbs: 28,
    fat: 18,
    fiber: 6,
    sugar: 8,
    scoreOutOf100: 88,
  },
  {
    name: 'Oatmeal with berries',
    calories: 310,
    protein: 12,
    carbs: 48,
    fat: 8,
    fiber: 7,
    sugar: 14,
    scoreOutOf100: 82,
  },
  {
    name: 'Salmon with vegetables',
    calories: 485,
    protein: 38,
    carbs: 22,
    fat: 26,
    fiber: 5,
    sugar: 6,
    scoreOutOf100: 91,
  },
]

// ── Mock weekly data ─────────────────────────────────────────────

interface DayEntry {
  day: string
  label: string
  meals: number
  calories: number
  protein: number
  score: number
}

const MOCK_WEEK: DayEntry[] = [
  { day: 'Mon', label: 'Monday', meals: 3, calories: 1280, protein: 92, score: 86 },
  { day: 'Tue', label: 'Tuesday', meals: 2, calories: 860, protein: 58, score: 79 },
  { day: 'Wed', label: 'Wednesday', meals: 3, calories: 1140, protein: 80, score: 83 },
  { day: 'Thu', label: 'Thursday', meals: 4, calories: 1510, protein: 104, score: 88 },
  { day: 'Fri', label: 'Friday', meals: 2, calories: 730, protein: 46, score: 74 },
  { day: 'Sat', label: 'Saturday', meals: 3, calories: 1360, protein: 95, score: 85 },
  { day: 'Sun', label: 'Sunday', meals: 1, calories: 485, protein: 38, score: 91 },
]

export function WellPathFoodDietPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<ViewMode>('today')
  const [meals, setMeals] = useState<MealAnalysis[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isAnalyzing = meals.some((m) => m.status === 'analyzing')
  const analyzedMeals = meals.filter((m) => m.status === 'done' && m.result)

  // ── Daily totals from uploaded meals ──
  const totals = useMemo(
    () =>
      analyzedMeals.reduce(
        (acc, meal) => {
          const r = meal.result!
          return {
            calories: acc.calories + r.calories,
            protein: acc.protein + r.protein,
            carbs: acc.carbs + r.carbs,
            fat: acc.fat + r.fat,
            fiber: acc.fiber + r.fiber,
            sugar: acc.sugar + r.sugar,
          }
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
      ),
    [analyzedMeals],
  )

  const dietScoreOutOf100 =
    analyzedMeals.length === 0
      ? 0
      : Math.round(
          analyzedMeals.reduce((sum, m) => sum + m.result!.scoreOutOf100, 0) /
            analyzedMeals.length,
        )

  // ── Photo upload ──
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    const mealId = crypto.randomUUID()
    const mockResult =
      MOCK_MEAL_RESULTS[meals.length % MOCK_MEAL_RESULTS.length]

    setMeals((prev) => [
      ...prev,
      { id: mealId, previewUrl, status: 'analyzing' },
    ])
    e.target.value = ''

    setTimeout(() => {
      setMeals((prev) =>
        prev.map((m) =>
          m.id === mealId ? { ...m, status: 'done', result: mockResult } : m,
        ),
      )
    }, 2200)
  }

  // ── Weekly aggregates ──
  const weekTotals = useMemo(() => {
    const cals = MOCK_WEEK.reduce((s, d) => s + d.calories, 0)
    const prot = MOCK_WEEK.reduce((s, d) => s + d.protein, 0)
    const avgScore = Math.round(
      MOCK_WEEK.reduce((s, d) => s + d.score, 0) / MOCK_WEEK.length,
    )
    return { calories: cals, protein: prot, score: avgScore }
  }, [])

  return (
    <div className="flex min-h-full flex-col">
      {/* ── Back link ── */}
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

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-white">
          <SectionIcon type="food" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Food & Diet</h2>
          <p className="text-xs text-slate-500">
            Upload meals · {Math.round(FOOD_DIET_DAILY_WEIGHT * 100)}% of daily score
          </p>
        </div>
      </div>

      {/* ── Segmented control ── */}
      <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
        {(
          [
            { key: 'today' as ViewMode, label: 'Today' },
            { key: 'week' as ViewMode, label: 'Week' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setView(tab.key)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
              view === tab.key
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {view === 'today' ? (
          <>
            {/* AI agent info card */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M12 2a4 4 0 014 4v1h1a3 3 0 013 3v8a3 3 0 01-3 3H7a3 3 0 01-3-3v-8a3 3 0 013-3h1V6a4 4 0 014-4z" strokeLinejoin="round" />
                    <circle cx="12" cy="14" r="2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">AI nutrition agent</p>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-800/80">
                    Upload a photo of your meal. Our agent will identify foods
                    and calculate calories and nutrition for you.
                  </p>
                </div>
              </div>
            </div>

            {/* Meals list */}
            {meals.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Today&apos;s meals
                </p>

                {meals.map((meal) => (
                  <article
                    key={meal.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100"
                  >
                    <div className="relative h-36 w-full bg-slate-100">
                      <img
                        src={meal.previewUrl}
                        alt="Uploaded meal"
                        className="h-full w-full object-cover"
                      />
                      {meal.status === 'analyzing' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 text-white">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <p className="mt-3 text-xs font-medium">AI agent analyzing…</p>
                          <p className="mt-1 text-[10px] text-white/70">
                            Calculating calories & nutrition
                          </p>
                        </div>
                      )}
                    </div>

                    {meal.status === 'done' && meal.result && (
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {meal.result.name}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              Identified by AI agent
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-600">
                              {meal.result.calories}
                            </p>
                            <p className="text-[10px] text-slate-400">kcal</p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {[
                            { label: 'Protein', value: `${meal.result.protein}g` },
                            { label: 'Carbs', value: `${meal.result.carbs}g` },
                            { label: 'Fat', value: `${meal.result.fat}g` },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="rounded-lg bg-slate-50 px-2 py-2 text-center"
                            >
                              <p className="text-[10px] text-slate-400">{item.label}</p>
                              <p className="text-sm font-semibold text-slate-800">
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {[
                            { label: 'Fiber', value: `${meal.result.fiber}g` },
                            { label: 'Sugar', value: `${meal.result.sugar}g` },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="rounded-lg bg-slate-50 px-2 py-2 text-center"
                            >
                              <p className="text-[10px] text-slate-400">{item.label}</p>
                              <p className="text-sm font-semibold text-slate-800">
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}

            {/* Daily totals */}
            {analyzedMeals.length > 0 && (
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Daily totals
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totals.calories}{' '}
                  <span className="text-base font-medium text-slate-400">kcal</span>
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-emerald-50 py-2">
                    <p className="text-slate-400">Protein</p>
                    <p className="font-semibold text-slate-800">{totals.protein}g</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 py-2">
                    <p className="text-slate-400">Carbs</p>
                    <p className="font-semibold text-slate-800">{totals.carbs}g</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 py-2">
                    <p className="text-slate-400">Fat</p>
                    <p className="font-semibold text-slate-800">{totals.fat}g</p>
                  </div>
                </div>
              </div>
            )}

            {/* Score card */}
            {analyzedMeals.length > 0 && (
              <div className="rounded-2xl bg-emerald-600 p-5 text-white shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                  Your scores
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[11px] text-emerald-200">Diet score</p>
                    <p className="mt-1 text-3xl font-bold">{dietScoreOutOf100}</p>
                    <p className="text-[11px] text-emerald-200">out of 100</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[11px] text-emerald-200">Daily score contribution</p>
                    <p className="mt-1 text-3xl font-bold">
                      {Math.round(dietScoreOutOf100 * FOOD_DIET_DAILY_WEIGHT * 10) / 10}
                    </p>
                    <p className="text-[11px] text-emerald-200">
                      {Math.round(FOOD_DIET_DAILY_WEIGHT * 100)}% of daily score
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* ── WEEK VIEW ── */
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                This week
              </p>
              <p className="mt-1 text-4xl font-bold tabular-nums">
                {weekTotals.calories.toLocaleString()}{' '}
                <span className="text-lg font-medium text-emerald-200">kcal</span>
              </p>
              <p className="mt-1 text-sm text-emerald-100">
                {weekTotals.protein}g protein · avg score {weekTotals.score}
              </p>
            </div>

            {/* Day-by-day breakdown */}
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Day breakdown
              </p>
              <div className="space-y-2">
                {MOCK_WEEK.map((day) => (
                  <div
                    key={day.day}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
                  >
                    <span className="w-8 text-xs font-bold text-slate-500">
                      {day.day}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-800">{day.calories} kcal</span>
                        <span className="text-slate-400">
                          {day.meals} meals · {day.protein}g protein
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${day.score}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-7 text-right text-xs font-bold text-emerald-600">
                      {day.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly totals grid */}
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Weekly averages
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-emerald-50 py-3">
                  <p className="text-xs text-slate-400">Daily calories</p>
                  <p className="text-xl font-bold text-slate-900">
                    {Math.round(weekTotals.calories / 7).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 py-3">
                  <p className="text-xs text-slate-400">Daily protein</p>
                  <p className="text-xl font-bold text-slate-900">
                    {Math.round(weekTotals.protein / 7)}g
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 py-3">
                  <p className="text-xs text-slate-400">Avg score</p>
                  <p className="text-xl font-bold text-slate-900">{weekTotals.score}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Photo button (natural flex child at bottom) ── */}
      <div className="border-t border-slate-200 bg-white px-4 pt-3 pb-[max(env(safe-area-inset-bottom,0px),8px)]">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 py-4 text-sm font-semibold text-white shadow-lg transition active:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          {isAnalyzing ? 'Analyzing…' : view === 'today' ? 'Take a photo' : 'Add meal'}
        </button>
      </div>
    </div>
  )
}
