// Portion size reference tables by food category.

import type { FoodCategory, PortionOption } from '../types';

export const PORTION_SIZES: Record<FoodCategory, PortionOption[]> = {
  meat: [
    { ref: 1, label: 'Small', grams: 85, visual: 'Deck of cards' },
    { ref: 2, label: 'Medium', grams: 140, visual: 'Palm of hand' },
    { ref: 3, label: 'Large', grams: 200, visual: 'Full fist' },
  ],
  grain: [
    { ref: 1, label: 'Small', grams: 100, visual: 'Tennis ball' },
    { ref: 2, label: 'Medium', grams: 185, visual: 'Cupped hand' },
    { ref: 3, label: 'Large', grams: 280, visual: 'Two fists' },
  ],
  vegetable: [
    { ref: 1, label: 'Small', grams: 75, visual: 'Handful' },
    { ref: 2, label: 'Medium', grams: 150, visual: 'Full cup' },
    { ref: 3, label: 'Large', grams: 225, visual: 'Heaping cup' },
  ],
  fruit: [
    { ref: 1, label: 'Small', grams: 80, visual: 'Egg sized' },
    { ref: 2, label: 'Medium', grams: 130, visual: 'Tennis ball' },
    { ref: 3, label: 'Large', grams: 180, visual: 'Fist sized' },
  ],
  bread: [
    { ref: 1, label: 'Small', grams: 30, visual: '1 slice' },
    { ref: 2, label: 'Medium', grams: 60, visual: '2 slices' },
    { ref: 3, label: 'Large', grams: 90, visual: '3 slices' },
  ],
  drink: [
    { ref: 1, label: 'Small', grams: 200, visual: 'Small cup' },
    { ref: 2, label: 'Medium', grams: 350, visual: 'Can' },
    { ref: 3, label: 'Large', grams: 500, visual: 'Bottle' },
  ],
  snack: [
    { ref: 1, label: 'Small', grams: 15, visual: 'Thumb tip' },
    { ref: 2, label: 'Medium', grams: 30, visual: 'Palm hollow' },
    { ref: 3, label: 'Large', grams: 50, visual: 'Cupped palm' },
  ],
  dairy: [
    { ref: 1, label: 'Small', grams: 120, visual: 'Half cup' },
    { ref: 2, label: 'Medium', grams: 245, visual: 'Full glass' },
    { ref: 3, label: 'Large', grams: 370, visual: 'Large bowl' },
  ],
  sauce: [
    { ref: 1, label: 'Small', grams: 5, visual: '1 tsp' },
    { ref: 2, label: 'Medium', grams: 15, visual: '1 tbsp' },
    { ref: 3, label: 'Large', grams: 30, visual: '2 tbsp' },
  ],
  mixed: [],
};
