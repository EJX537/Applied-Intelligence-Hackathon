import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionIcon } from '../features/wellpath/components'

const FOOD_DIET_DAILY_WEIGHT = 0.35

type MealAnalysis = {
  id: string
  previewUrl: string
  status: "analyzing" | "done"
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
    name: "Grilled chicken salad",
    calories: 420,
    protein: 32,
    carbs: 28,
    fat: 18,
    fiber: 6,
    sugar: 8,
    scoreOutOf100: 88,
  },
  {
    name: "Oatmeal with berries",
    calories: 310,
    protein: 12,
    carbs: 48,
    fat: 8,
    fiber: 7,
    sugar: 14,
    scoreOutOf100: 82,
  },
  {
    name: "Salmon with vegetables",
    calories: 485,
    protein: 38,
    carbs: 22,
    fat: 26,
    fiber: 5,
    sugar: 6,
    scoreOutOf100: 91,
  },
]

export function WellPathFoodDietPage() {
  const navigate = useNavigate()
  const [meals, setMeals] = useState<MealAnalysis[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dailyWeightPercent = FOOD_DIET_DAILY_WEIGHT * 100

  const analyzedMeals = meals.filter((m) => m.status === "done" && m.result)
  const isAnalyzing = meals.some((m) => m.status === "analyzing")

  const totals = analyzedMeals.reduce(
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
  )

  const dietScoreOutOf100 =
    analyzedMeals.length === 0
      ? 0
      : Math.round(
          analyzedMeals.reduce((sum, m) => sum + m.result!.scoreOutOf100, 0) /
            analyzedMeals.length,
        )

  const dailyContribution =
    Math.round(dietScoreOutOf100 * FOOD_DIET_DAILY_WEIGHT * 10) / 10

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    const mealId = crypto.randomUUID()
    const mockResult =
      MOCK_MEAL_RESULTS[meals.length % MOCK_MEAL_RESULTS.length]

    setMeals((prev) => [
      ...prev,
      { id: mealId, previewUrl, status: "analyzing" },
    ])

    e.target.value = ""

    setTimeout(() => {
      setMeals((prev) =>
        prev.map((m) =>
          m.id === mealId ? { ...m, status: "done", result: mockResult } : m,
        ),
      )
    }, 2200)
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
            <h1 className="text-lg font-bold text-slate-900">Food & Diet</h1>
            <p className="text-xs text-slate-500">
              Upload meals · AI agent · {dailyWeightPercent}% of daily score
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <SectionIcon type="food" />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
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
                Upload a photo of your meal. Our agent will identify foods and
                calculate calories and nutrition for you.
              </p>
            </div>
          </div>
        </div>

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
          className="mt-4 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-white py-8 transition active:bg-emerald-50 disabled:opacity-50"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            Upload meal photo
          </p>
          <p className="mt-1 text-xs text-slate-500">Camera or photo library</p>
        </button>

        {meals.length > 0 && (
          <div className="mt-6 space-y-4">
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
                  {meal.status === "analyzing" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 text-white">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <p className="mt-3 text-xs font-medium">AI agent analyzing…</p>
                      <p className="mt-1 text-[10px] text-white/70">
                        Calculating calories & nutrition
                      </p>
                    </div>
                  )}
                </div>

                {meal.status === "done" && meal.result && (
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
                        { label: "Protein", value: `${meal.result.protein}g` },
                        { label: "Carbs", value: `${meal.result.carbs}g` },
                        { label: "Fat", value: `${meal.result.fat}g` },
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
                        { label: "Fiber", value: `${meal.result.fiber}g` },
                        { label: "Sugar", value: `${meal.result.sugar}g` },
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

        {analyzedMeals.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Daily nutrition totals
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totals.calories}{" "}
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
                  <p className="mt-1 text-3xl font-bold">{dailyContribution}</p>
                  <p className="text-[11px] text-emerald-200">
                    {dailyWeightPercent}% of daily score
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Save button */}
      <div className="border-t border-slate-200 bg-white px-4 py-3 pb-6">
        <button
          type="button"
          disabled={analyzedMeals.length === 0 || isAnalyzing}
          className={`w-full rounded-2xl py-3.5 text-sm font-semibold transition ${
            analyzedMeals.length > 0 && !isAnalyzing
              ? "bg-emerald-600 text-white active:bg-emerald-700"
              : "cursor-not-allowed bg-slate-200 text-slate-400"
          }`}
        >
          {isAnalyzing
            ? "Waiting for AI analysis…"
            : analyzedMeals.length > 0
              ? "Save food & diet check-in"
              : "Upload a meal photo to continue"}
        </button>
      </div>
    </div>
  )
}
