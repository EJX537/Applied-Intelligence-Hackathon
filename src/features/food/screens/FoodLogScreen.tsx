import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFoodStore } from '../store/foodStore';
import { useDailyNutrition } from '../hooks/useDailyNutrition';
import { DailySummary } from '../components/DailySummary';
import { MealCard } from '../components/MealCard';
import { colors } from '../constants/colors';
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
    if (action === 'photo') navigate('/camera', { state: { mealType: mt } });
    else if (action === 'search') navigate('/manual-search', { state: { mealType: mt } });
  };

  return (
    <div className="app-shell">
      <div style={{ fontSize: 14, color: colors.textLight, marginBottom: 12 }}>{todayLabel()}</div>
      <DailySummary totals={dailyTotals} targets={DAILY_TARGETS} />
      <div style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 8 }}>
        Today's meals
      </div>
      {meals.length === 0 ? (
        <div style={{ color: colors.textLight, textAlign: 'center', marginTop: 32 }}>
          No meals logged today — tap + to start
        </div>
      ) : (
        <div style={{ paddingBottom: 80 }}>
          {meals.map((m) => (
            <MealCard key={m.id} meal={m} onDelete={removeMeal} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowSheet(true)}
        aria-label="Add a meal"
        style={{
          position: 'fixed',
          right: 'calc(50% - 312px)',
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          background: colors.primary,
          color: '#fff',
          fontSize: 30,
          fontWeight: 300,
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        +
      </button>

      {showSheet && (
        <div
          role="dialog"
          aria-label="Add a meal"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 10,
          }}
          onClick={() => {
            setShowSheet(false);
            setPendingAction(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: colors.card,
              borderRadius: '16px 16px 0 0',
              padding: 16,
              width: '100%',
              maxWidth: 640,
            }}
          >
            {pendingAction === null ? (
              <>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Add a meal</div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginBottom: 8 }}
                  onClick={() => setPendingAction('photo')}
                >
                  📷 Take / Upload Photo
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginBottom: 8 }}
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
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Which meal?</div>
                {MEAL_TYPES.map((mt) => (
                  <button
                    type="button"
                    key={mt}
                    className="btn btn-secondary"
                    style={{ marginBottom: 8 }}
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
