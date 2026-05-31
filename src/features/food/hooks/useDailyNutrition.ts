// Memoized aggregator that sums all meal totals into daily nutrition totals.

import { useMemo } from 'react';
import type { MealEntry, NutritionTotals } from '../types';

const EMPTY: NutritionTotals = {
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
  fiber_g: 0,
  sugar_g: 0,
  sodium_mg: 0,
};

export function useDailyNutrition(meals: MealEntry[]): NutritionTotals {
  return useMemo(
    () =>
      meals.reduce<NutritionTotals>(
        (acc, m) => ({
          calories: acc.calories + m.meal_total.calories,
          protein_g: acc.protein_g + m.meal_total.protein_g,
          carbs_g: acc.carbs_g + m.meal_total.carbs_g,
          fat_g: acc.fat_g + m.meal_total.fat_g,
          fiber_g: acc.fiber_g + m.meal_total.fiber_g,
          sugar_g: acc.sugar_g + m.meal_total.sugar_g,
          sodium_mg: acc.sodium_mg + m.meal_total.sodium_mg,
        }),
        { ...EMPTY },
      ),
    [meals],
  );
}
