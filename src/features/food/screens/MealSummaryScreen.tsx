import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFoodStore } from '../store/foodStore';
import { ManualEntryForm } from '../components/ManualEntryForm';

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
        <p className="text-[#666666] text-center mt-8">
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
    <div className="flex justify-between mb-1.5">
      <span className="text-text-light">{label}</span>
      <span className="text-text-app font-semibold">{value}</span>    </div>
  );

  return (
    <div className="app-shell pb-24">
      {response.meal.image_uri && (
        <img
          src={response.meal.image_uri}
          alt="Meal photo thumbnail"
          className="w-full h-[180px] rounded-xl mb-3 bg-border-app object-cover"        />
      )}
      <h1 className="screen-heading">Meal logged</h1>
      <div className="screen-subheading">
        {response.meal.meal_type} · {new Date(response.meal.timestamp).toLocaleTimeString()}
      </div>

      <div className="card">
        <div className="text-[15px] font-semibold text-text-app mb-2">          Meal totals
        </div>
        {totalsRow('Calories', `${response.meal.meal_total.calories} kcal`)}
        {totalsRow('Protein', `${response.meal.meal_total.protein_g} g`)}
        {totalsRow('Carbs', `${response.meal.meal_total.carbs_g} g`)}
        {totalsRow('Fat', `${response.meal.meal_total.fat_g} g`)}
      </div>

      <div className="text-[15px] font-bold text-text-app mb-2">Items</div>
      {response.meal.items.map((item, idx) => (
        <div
          key={`${item.name}-${idx}`}
          className="flex items-center bg-card-app rounded-[10px] p-3 mb-2"
        >
          <div className="flex-1">
            <div className="text-sm font-semibold text-text-app">{item.name}</div>
            <div className="text-xs text-text-light mt-0.5">
              P {item.protein_g}g · C {item.carbs_g}g · F {item.fat_g}g
            </div>
          </div>
          <span className="text-sm font-bold text-primary">            {item.calories} kcal
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

      <div className="mt-3 bg-card-app rounded-xl p-3.5 text-center">
        <div className="text-[15px] font-semibold text-text-app">Today's calories</div>
        <div className="text-2xl font-extrabold text-primary mt-1">          {dailyTotals} kcal
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-border-app bg-background-app z-10">        <div className="max-w-[640px] mx-auto">
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
