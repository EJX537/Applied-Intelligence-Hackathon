// Shared type definitions for daily health logs, meals, and nutrition.

export type FoodCategory =
  | 'meat'
  | 'grain'
  | 'vegetable'
  | 'fruit'
  | 'bread'
  | 'drink'
  | 'snack'
  | 'dairy'
  | 'sauce'
  | 'mixed';

export interface NutritionTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
}

export interface FoodItem {
  name: string;
  usda_fdc_id: number | null;
  category: FoodCategory;
  portion_grams: number;
  quantity: number;
  effective_grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  cholesterol_mg: number;
  manual_entry: boolean;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  id: string;
  meal_type: MealType;
  timestamp: string;
  image_uri: string | null;
  items: FoodItem[];
  meal_total: NutritionTotals;
}

export interface LabResults {
  period: 'beginning' | '3_months' | '6_months';
  cbc: Record<string, number>;
  blood_pressure: {
    systolic: number;
    diastolic: number;
  };
  cholesterol: {
    ldl: number;
    hdl: number;
    total: number;
    triglycerides: number;
  };
}

export interface DailyLog {
  steps: number;
  calories_burned: number;
  lab_snapshot: LabResults | null;
  brushing_sessions: number;
  flossing_done: boolean;
  meals: MealEntry[];
  nutrition_totals: NutritionTotals;
  points_earned: number;
  rewards_unlocked: string[];
}

export interface RecognizedItem {
  name: string;
  usda_search_term: string;
  category: FoodCategory;
  confidence: 'high' | 'medium' | 'low';
}

export interface PortionOption {
  ref: number;
  label: string;
  grams: number;
  visual: string;
}
