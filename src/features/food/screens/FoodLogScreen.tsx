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
      <div className="text-[14px] text-[#666666] mb-3">{todayLabel()}</div>
      <DailySummary totals={dailyTotals} targets={DAILY_TARGETS} />
      <div className="text-[15px] font-bold text-[#333333] mb-2">
        Today's meals
      </div>
      {meals.length === 0 ? (
        <div className="text-[#666666] text-center mt-8">
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
        className="fixed right-[calc(50%-312px)] bottom-6 w-14 h-14 rounded-full bg-[#4CAF50] text-white text-[30px] font-light border-none shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
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
            className="bg-white rounded-t-2xl p-4 w-full max-w-[640px]"
          >
            {pendingAction === null ? (
              <>
                <div className="font-bold text-[16px] mb-3">Add a meal</div>
                <button
                  type="button"
                  className="btn btn-primary mb-2"
                  onClick={() => setPendingAction('photo')}
                >
                  📷 Take / Upload Photo
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
                <div className="font-bold text-[16px] mb-3">Which meal?</div>
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
