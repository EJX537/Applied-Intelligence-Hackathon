"use client";

import { useRef, useState } from "react";
import {
  ORAL_HEALTH_DAILY_WEIGHT,
  ORAL_HEALTH_QUESTIONS,
  calculateOralHealthScore,
} from "./oral-health-questions";

type Screen = "home" | "oral-health" | "food-diet";

const FOOD_DIET_DAILY_WEIGHT = 0.35;

const SECTIONS = [
  {
    id: "steps",
    title: "Step Counts",
    subtitle: "Daily · sync or manual entry",
    weight: "30% of daily score",
    status: "logged",
    score: 82,
    detail: "8,420 steps today",
    accent: "sky",
    icon: "steps",
  },
  {
    id: "lab",
    title: "Lab Data",
    subtitle: "Every 3 months · from provider",
    weight: "Month 3 & 6 review",
    status: "pending",
    score: null,
    detail: "Next lab due in 12 days",
    accent: "amber",
    icon: "lab",
  },
  {
    id: "oral",
    title: "Oral Health",
    subtitle: "Daily questions",
    weight: "15% of daily score",
    status: "incomplete",
    score: null,
    detail: "4 questions · not started",
    accent: "violet",
    icon: "oral",
  },
  {
    id: "food",
    title: "Food & Diet",
    subtitle: "Photo upload · AI nutrition analysis",
    weight: "35% of daily score",
    status: "incomplete",
    score: null,
    detail: "Upload meal photos · not started",
    accent: "emerald",
    icon: "food",
  },
];

const accentStyles: Record<
  string,
  { icon: string; ring: string; badge: string }
> = {
  sky: {
    icon: "bg-sky-500 text-white",
    ring: "ring-sky-100",
    badge: "bg-sky-100 text-sky-700",
  },
  amber: {
    icon: "bg-amber-500 text-white",
    ring: "ring-amber-100",
    badge: "bg-amber-100 text-amber-800",
  },
  violet: {
    icon: "bg-violet-500 text-white",
    ring: "ring-violet-100",
    badge: "bg-violet-100 text-violet-700",
  },
  emerald: {
    icon: "bg-emerald-500 text-white",
    ring: "ring-emerald-100",
    badge: "bg-emerald-100 text-emerald-700",
  },
};

function StatusBar() {
  return (
    <div className="relative flex items-center justify-between bg-white px-8 pb-1 pt-3 text-[11px] font-semibold text-slate-900">
      <span>9:41</span>
      <div className="absolute left-1/2 top-2 h-[26px] w-[120px] -translate-x-1/2 rounded-full bg-slate-900" />
      <div className="flex items-center gap-1">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <rect x="1" y="6" width="4" height="12" rx="1" />
          <rect x="7" y="4" width="4" height="14" rx="1" />
          <rect x="13" y="2" width="4" height="16" rx="1" />
          <rect x="19" y="5" width="4" height="13" rx="1" opacity="0.3" />
        </svg>
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 3C7.5 3 3.5 5.5 1 9c2.5 3.5 6.5 6 11 6s8.5-2.5 11-6c-2.5-3.5-6.5-6-11-6z" opacity="0.3" />
          <path d="M12 3c3 0 5.5 1.5 7 4-1.5 2.5-4 4-7 4s-5.5-1.5-7-4c1.5-2.5 4-4 7-4z" />
        </svg>
        <div className="flex h-3 w-6 items-center rounded-sm border border-slate-900 px-0.5">
          <div className="h-1.5 w-4 rounded-sm bg-slate-900" />
        </div>
      </div>
    </div>
  );
}

function BottomNav() {
  return (
    <>
      <nav className="flex border-t border-slate-200 bg-white px-6 py-2 pb-6">
        {[
          { label: "Home", active: true },
          { label: "Progress", active: false },
          { label: "Rewards", active: false },
          { label: "Profile", active: false },
        ].map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={`flex flex-1 flex-col items-center gap-1 py-1 ${
              tab.active ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            <div
              className={`h-1 w-1 rounded-full ${tab.active ? "bg-emerald-600" : "bg-transparent"}`}
            />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="flex justify-center bg-white pb-2">
        <div className="h-1 w-28 rounded-full bg-slate-900" />
      </div>
    </>
  );
}

function SectionIcon({ type }: { type: string }) {
  const cls = "h-6 w-6";
  switch (type) {
    case "steps":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 16l4-6 4 3 4-7 4 5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="4" cy="16" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="20" cy="11" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "lab":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M9 3h6v7l4 10H5L9 10V3z" strokeLinejoin="round" />
          <path d="M9 3h6" strokeLinecap="round" />
        </svg>
      );
    case "oral":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
        </svg>
      );
    case "food":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 2C8 6 6 10 6 14a6 6 0 0012 0c0-4-2-8-6-12z" strokeLinejoin="round" />
          <path d="M12 12v6" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function StatusPill({ status }: { status: string }) {
  if (status === "logged") {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        Done
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
        Upcoming
      </span>
    );
  }
  return (
    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
      To do
    </span>
  );
}

function HomeScreen({
  onOpenOralHealth,
  onOpenFoodDiet,
}: {
  onOpenOralHealth: () => void;
  onOpenFoodDiet: () => void;
}) {
  const dailyScore = 85;
  const completionRate = 86;
  const currentMonth = 1;

  return (
    <>
      <header className="bg-white px-5 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Good morning</p>
            <h1 className="text-xl font-bold text-slate-900">Sarah</h1>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
            S
          </div>
        </div>

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
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-4 pt-2">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Today&apos;s check-in
        </p>
        <div className="space-y-3">
          {SECTIONS.map((section) => {
            const styles = accentStyles[section.accent];
            const isOral = section.id === "oral";
            const isFood = section.id === "food";
            const isClickable = isOral || isFood;

            return (
              <button
                key={section.id}
                type="button"
                onClick={
                  isOral
                    ? onOpenOralHealth
                    : isFood
                      ? onOpenFoodDiet
                      : undefined
                }
                className={`flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ${styles.ring} transition active:scale-[0.98] active:bg-slate-50 ${isClickable ? "cursor-pointer" : ""}`}
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
            );
          })}
        </div>
      </main>

      <BottomNav />
    </>
  );
}

function OralHealthScreen({ onBack }: { onBack: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = ORAL_HEALTH_QUESTIONS.length;
  const allAnswered = answeredCount === totalQuestions;
  const { scoreOutOf100, dailyContribution } = calculateOralHealthScore(answers);
  const dailyWeightPercent = ORAL_HEALTH_DAILY_WEIGHT * 100;

  function selectOption(questionId: string, optionLabel: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionLabel }));
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-4 pb-3 pt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
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
      </header>

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
                  const selected = answers[q.id] === option.label;
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
                  );
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
    </>
  );
}

type MealAnalysis = {
  id: string;
  previewUrl: string;
  status: "analyzing" | "done";
  result?: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    scoreOutOf100: number;
  };
};

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
];

function FoodDietScreen({ onBack }: { onBack: () => void }) {
  const [meals, setMeals] = useState<MealAnalysis[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dailyWeightPercent = FOOD_DIET_DAILY_WEIGHT * 100;

  const analyzedMeals = meals.filter((m) => m.status === "done" && m.result);
  const isAnalyzing = meals.some((m) => m.status === "analyzing");

  const totals = analyzedMeals.reduce(
    (acc, meal) => {
      const r = meal.result!;
      return {
        calories: acc.calories + r.calories,
        protein: acc.protein + r.protein,
        carbs: acc.carbs + r.carbs,
        fat: acc.fat + r.fat,
        fiber: acc.fiber + r.fiber,
        sugar: acc.sugar + r.sugar,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
  );

  const dietScoreOutOf100 =
    analyzedMeals.length === 0
      ? 0
      : Math.round(
          analyzedMeals.reduce((sum, m) => sum + m.result!.scoreOutOf100, 0) /
            analyzedMeals.length,
        );

  const dailyContribution =
    Math.round(dietScoreOutOf100 * FOOD_DIET_DAILY_WEIGHT * 10) / 10;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const mealId = crypto.randomUUID();
    const mockResult =
      MOCK_MEAL_RESULTS[meals.length % MOCK_MEAL_RESULTS.length];

    setMeals((prev) => [
      ...prev,
      { id: mealId, previewUrl, status: "analyzing" },
    ]);

    e.target.value = "";

    setTimeout(() => {
      setMeals((prev) =>
        prev.map((m) =>
          m.id === mealId ? { ...m, status: "done", result: mockResult } : m,
        ),
      );
    }, 2200);
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-4 pb-3 pt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
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
      </header>

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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
    </>
  );
}

export default function AppMockup() {
  const [screen, setScreen] = useState<Screen>("home");

  return (
    <div className="flex min-h-full items-center justify-center bg-slate-200 p-6 font-sans">
      <div
        className="relative w-full max-w-[390px] overflow-hidden rounded-[44px] border-[10px] border-slate-900 bg-slate-900 shadow-2xl"
        style={{ height: "844px" }}
      >
        <StatusBar />

        <div className="flex h-[calc(100%-44px)] flex-col bg-slate-50">
          {screen === "home" && (
            <HomeScreen
              onOpenOralHealth={() => setScreen("oral-health")}
              onOpenFoodDiet={() => setScreen("food-diet")}
            />
          )}
          {screen === "oral-health" && (
            <OralHealthScreen onBack={() => setScreen("home")} />
          )}
          {screen === "food-diet" && (
            <FoodDietScreen onBack={() => setScreen("home")} />
          )}
        </div>
      </div>
    </div>
  );
}
