// Navigation param list and screen-prop types for the food feature stack.

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MealType, RecognizedItem } from '../types';
import type { LogMealResponse } from '../types';

export type FoodStackParamList = {
  FoodLog: undefined;
  Consent: { nextMealType?: MealType } | undefined;
  Camera: { mealType: MealType };
  PortionSelect: {
    items: RecognizedItem[];
    imageUri: string | null;
    mealType: MealType;
  };
  ManualFoodSearch: { mealType: MealType };
  MealSummary: { response: LogMealResponse };
};

export type FoodScreenProps<T extends keyof FoodStackParamList> = NativeStackScreenProps<
  FoodStackParamList,
  T
>;
