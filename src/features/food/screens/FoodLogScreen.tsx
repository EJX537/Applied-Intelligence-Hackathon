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
    <div className="app-shell">
<<<<<<< HEAD
      <div className="text-sm text-text-light mb-3">{todayLabel()}</div>
      <DailySummary totals={dailyTotals} targets={DAILY_TARGETS} />
      <div className="text-[15px] font-bold text-text-app mb-2">
        Today's meals
      </div>
      {meals.length === 0 ? (
        <div className="text-text-light text-center mt-8">
=======
      <div className="text-[14px] text-[#666666] mb-3">{todayLabel()}</div>
      <DailySummary totals={dailyTotals} targets={DAILY_TARGETS} />
      <div className="text-[15px] font-bold text-[#333333] mb-2">
        Today's meals
      </div>
      {meals.length === 0 ? (
        <div className="text-[#666666] text-center mt-8">
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
          No meals logged today — tap + to start
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
<<<<<<< HEAD
        className="floating-add-btn"
=======
        className="fixed right-[calc(50%-312px)] bottom-6 w-14 h-14 rounded-full bg-[#4CAF50] text-white text-[30px] font-light border-none shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
      >
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
<<<<<<< HEAD
            className="bg-card-app rounded-t-2xl p-4 w-full max-w-[640px]"
          >
            {pendingAction === null ? (
              <>
                <div className="font-bold text-base mb-3">Add a meal</div>
                <button
                  type="button"
                  className="btn btn-primary mb-2 gap-2"
=======
            className="bg-white rounded-t-2xl p-4 w-full max-w-[640px]"
          >
            {pendingAction === null ? (
              <>
                <div className="font-bold text-[16px] mb-3">Add a meal</div>
                <button
                  type="button"
                  className="btn btn-primary mb-2"
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
                  onClick={() => setPendingAction('photo')}
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
<<<<<<< HEAD
                <div className="font-bold text-base mb-3">Which meal?</div>
=======
                <div className="font-bold text-[16px] mb-3">Which meal?</div>
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
                {MEAL_TYPES.map((mt) => (
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
