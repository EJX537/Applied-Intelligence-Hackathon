import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFoodStore } from '../store/foodStore';
import { ManualEntryForm } from '../components/ManualEntryForm';
import { colors } from '../constants/colors';
import type { FoodItem, LogMealResponse } from '../types';

interface LocationState {
  response?: LogMealResponse;
}

export function MealSummaryScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const response = state.response;

  const addMeal = useFoodStore((s) => s.addMeal);
  const meals = useFoodStore((s) => s.meals);

  useEffect(() => {
    if (response) addMeal(response.meal);
  }, [response, addMeal]);

  const [pendingItems, setPendingItems] = useState<FoodItem[]>(
    response?.items_needing_manual_entry ?? [],
  );

  if (!response) {
    return (
      <div className="app-shell">
        <p style={{ color: colors.textLight, textAlign: 'center', marginTop: 32 }}>
          No meal data. <button className="link-button" onClick={() => navigate('/')}>Go home</button>
        </p>
      </div>
    );
  }

  const dailyTotals = meals.reduce(
    (acc, m) => acc + m.meal_total.calories,
    response.meal.meal_total.calories,
  );

  const handleManualSubmit = (item: FoodItem) => {
    setPendingItems((prev) => prev.filter((p) => p.name !== item.name));
  };

  const totalsRow = (label: string, value: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ color: colors.textLight }}>{label}</span>
      <span style={{ color: colors.text, fontWeight: 600 }}>{value}</span>
    </div>
  );

  return (
    <div className="app-shell" style={{ paddingBottom: 96 }}>
      {response.meal.image_uri && (
        <img
          src={response.meal.image_uri}
          alt="Meal photo thumbnail"
          style={{
            width: '100%',
            height: 180,
            borderRadius: 12,
            marginBottom: 12,
            background: colors.border,
            objectFit: 'cover',
          }}
        />
      )}
      <h1 className="screen-heading">Meal logged</h1>
      <div className="screen-subheading">
        {response.meal.meal_type} · {new Date(response.meal.timestamp).toLocaleTimeString()}
      </div>

      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 8 }}>
          Meal totals
        </div>
        {totalsRow('Calories', `${response.meal.meal_total.calories} kcal`)}
        {totalsRow('Protein', `${response.meal.meal_total.protein_g} g`)}
        {totalsRow('Carbs', `${response.meal.meal_total.carbs_g} g`)}
        {totalsRow('Fat', `${response.meal.meal_total.fat_g} g`)}
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Items</div>
      {response.meal.items.map((item, idx) => (
        <div
          key={`${item.name}-${idx}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: colors.card,
            borderRadius: 10,
            padding: 12,
            marginBottom: 8,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{item.name}</div>
            <div style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>
              P {item.protein_g}g · C {item.carbs_g}g · F {item.fat_g}g
            </div>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: colors.primary }}>
            {item.calories} kcal
          </span>
        </div>
      ))}

      {pendingItems.map((item) => (
        <ManualEntryForm
          key={`manual-${item.name}`}
          itemName={item.name}
          onSubmit={() => handleManualSubmit(item)}
          onSkip={() => handleManualSubmit(item)}
        />
      ))}

      <div
        style={{
          marginTop: 12,
          background: colors.card,
          borderRadius: 12,
          padding: 14,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>Today's calories</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: colors.primary, marginTop: 4 }}>
          {dailyTotals} kcal
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          borderTop: `1px solid ${colors.border}`,
          background: colors.background,
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="btn btn-primary"
            aria-label="Done"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
