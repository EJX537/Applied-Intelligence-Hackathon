import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useFoodStore } from '../store/foodStore';
import { useDailyNutrition } from '../hooks/useDailyNutrition';
import { DailySummary } from '../components/DailySummary';
import { MealCard } from '../components/MealCard';

import type { MealType, NutritionTotals } from '../types';

const DAILY_TARGETS: NutritionTotals = {
  calories: 2000,
  protein_g: 100,
  carbs_g: 250,
  fat_g: 70,
  fiber_g: 30,
  sugar_g: 50,
  sodium_mg: 2300,
};

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function FoodLogScreen() {
  const navigate = useNavigate();
  const loc = useLocation();
  const isRoot = loc.pathname === '/food' || loc.pathname.endsWith('/food');

  if (!isRoot) return <Outlet />;

  const meals = useFoodStore((s) => s.meals);
  const removeMeal = useFoodStore((s) => s.removeMeal);
  const loadMeals = useFoodStore((s) => s.loadMeals);
  const dailyTotals = useDailyNutrition(meals);
  const [showSheet, setShowSheet] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<'photo' | 'search' | null>(null);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const handlePickMealType = (mt: MealType) => {
    const action = pendingAction;
    setPendingAction(null);
    setShowSheet(false);
    if (action === 'photo') navigate('camera', { state: { mealType: mt } });
    else if (action === 'search') navigate('manual-search', { state: { mealType: mt } });
  };

  return (
    <div className="pt-4 space-y-4 pb-24">
      {/* Premium Header Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-5 text-white shadow-sm flex justify-between items-center">
        <div>
          <span className="text-xs text-white/75 font-semibold tracking-wider uppercase">Nutrition</span>
          <h2 className="text-xl font-bold m-0 text-white">Food Diary</h2>
          <span className="text-xs text-white/80">{todayLabel()}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-white/70 block font-semibold">Logged</span>
          <span className="text-3xl font-extrabold font-mono text-white leading-none">
            {meals.length}
            <span className="text-xs font-normal opacity-85 ml-1">meals</span>
          </span>
        </div>
      </div>

      <DailySummary totals={dailyTotals} targets={DAILY_TARGETS} />
      <div className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider m-0">
        Today's meals
      </div>
      {meals.length === 0 ? (
        <div className="text-text-light text-center mt-8">          No meals logged today — tap + to start
        </div>
      ) : (
        <div className="pb-20">
          {meals.map((m) => (
            <MealCard key={m.id} meal={m} onDelete={removeMeal} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowSheet(true)}
        aria-label="Add a meal"
        className="floating-add-btn"      >
        +
      </button>

      {showSheet && (
        <div
          role="dialog"
          aria-label="Add a meal"
          className="fixed inset-0 bg-black/40 flex items-end justify-center z-10"
          onClick={() => {
            setShowSheet(false);
            setPendingAction(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card-app rounded-t-2xl p-4 w-full max-w-[640px]"
          >
            {pendingAction === null ? (
              <>
                <div className="font-bold text-base mb-3">Add a meal</div>
                <button
                  type="button"
                  className="btn btn-primary mb-2 gap-2"                  onClick={() => setPendingAction('photo')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Capture Image
                </button>
                <button
                  type="button"
                  className="btn btn-secondary mb-2"
                  onClick={() => setPendingAction('search')}
                >
                  🔍 Search Food
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSheet(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="font-bold text-base mb-3">Which meal?</div>                {MEAL_TYPES.map((mt) => (
                  <button
                    type="button"
                    key={mt}
                    className="btn btn-secondary mb-2"
                    onClick={() => handlePickMealType(mt)}
                  >
                    {mt.charAt(0).toUpperCase() + mt.slice(1)}
                  </button>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPendingAction(null)}
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
