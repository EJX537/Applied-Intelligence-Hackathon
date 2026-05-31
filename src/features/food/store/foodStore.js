// Zustand store for the food feature: today's meals and current photo analysis state.
import { create } from 'zustand';
import { fetchMeals, deleteMeal } from '../services/foodApi';
const EMPTY_TOTALS = {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    sugar_g: 0,
    sodium_mg: 0,
};
export const useFoodStore = create((set, get) => ({
    meals: [],
    currentItems: [],
    currentImageUri: null,
    mealsLoaded: false,
    setCurrentAnalysis: (imageUri, items) => set({ currentImageUri: imageUri, currentItems: items }),
    addMeal: (meal) => set((s) => s.meals.some((m) => m.id === meal.id) ? s : { meals: [meal, ...s.meals] }),
    removeMeal: (mealId) => {
        set((s) => ({ meals: s.meals.filter((m) => m.id !== mealId) }));
        void deleteMeal(mealId);
    },
    clearCurrentAnalysis: () => set({ currentImageUri: null, currentItems: [] }),
    loadMeals: async () => {
        const meals = await fetchMeals();
        set({ meals, mealsLoaded: true });
    },
    getDailyTotals: () => get().meals.reduce((acc, m) => ({
        calories: acc.calories + m.meal_total.calories,
        protein_g: acc.protein_g + m.meal_total.protein_g,
        carbs_g: acc.carbs_g + m.meal_total.carbs_g,
        fat_g: acc.fat_g + m.meal_total.fat_g,
        fiber_g: acc.fiber_g + m.meal_total.fiber_g,
        sugar_g: acc.sugar_g + m.meal_total.sugar_g,
        sodium_mg: acc.sodium_mg + m.meal_total.sodium_mg,
    }), { ...EMPTY_TOTALS }),
}));
