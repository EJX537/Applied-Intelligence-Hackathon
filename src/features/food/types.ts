// Food feature-specific types and re-exports from shared types.

export type {
  DailyLog,
  MealEntry,
  MealType,
  FoodItem,
  NutritionTotals,
  FoodCategory,
  LabResults,
  RecognizedItem,
  PortionOption,
} from '../../shared/types/DailyLog';

import type {
  RecognizedItem,
  MealEntry,
  NutritionTotals,
  FoodItem,
  FoodCategory,
  MealType,
} from '../../shared/types/DailyLog';

export interface FoodCorrection {
  original_name: string;
  corrected_name: string;
  original_category: FoodCategory;
  corrected_category: FoodCategory;
  image_uri: string | null;
  timestamp: string;
}

export interface AnalyzeResponse {
  image_uri: string;
  items: RecognizedItem[];
}

export interface LogMealRequestItem {
  name: string;
  usda_search_term: string;
  category: FoodCategory;
  portion_grams: number;
  quantity: number;
}

export interface LogMealRequest {
  meal_type: MealType;
  image_uri: string | null;
  items: LogMealRequestItem[];
  corrections: FoodCorrection[];
}

export interface LogMealResponse {
  meal: MealEntry;
  daily: NutritionTotals;
  items_needing_manual_entry: FoodItem[];
}

export interface SearchFoodResult {
  fdc_id: number;
  name: string;
  category: FoodCategory;
  nutrients_per_100g: NutritionTotals;
}

export interface SearchFoodResponse {
  results: SearchFoodResult[];
}

export interface PortionSelection {
  grams: number;
  quantity: number;
  customActive: boolean;
  edited: boolean;
  editedName: string | undefined;
}
