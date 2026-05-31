import type { NutritionTotals } from '../types';
import { NutrientBar } from './NutrientBar';

interface Props {
  totals: NutritionTotals;
  targets: NutritionTotals;
}

export function DailySummary({ totals, targets }: Props) {
  const calRatio = targets.calories > 0 ? totals.calories / targets.calories : 0;
  const calPct = Math.min(100, Math.round(calRatio * 100));

  return (
<<<<<<< HEAD
    <div className="bg-card-app rounded-2xl p-4 mb-3">
      <div className="flex items-center gap-4">
        <div
          aria-label={`Calories: ${totals.calories} of ${targets.calories}`}
          className="w-[110px] h-[110px] rounded-full border-[6px] border-primary flex flex-col items-center justify-center shrink-0"
        >
          <span className="text-[22px] font-bold text-text-app">
            {totals.calories}
          </span>
          <span className="text-[11px] text-text-light">of {targets.calories}</span>
          <span className="text-xs text-primary font-semibold mt-0.5">
=======
    <div className="bg-white rounded-2xl p-4 mb-3">
      <div className="flex items-center gap-4">
        <div
          aria-label={`Calories: ${totals.calories} of ${targets.calories}`}
          className="w-[110px] h-[110px] rounded-full border-[6px] border-[#4CAF50] flex flex-col items-center justify-center shrink-0"
        >
          <span className="text-[22px] font-bold text-[#333333]">
            {totals.calories}
          </span>
          <span className="text-[11px] text-[#666666]">of {targets.calories}</span>
          <span className="text-xs text-[#4CAF50] font-semibold mt-0.5">
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
            {calPct}%
          </span>
        </div>
        <div className="flex-1">
          <NutrientBar
            label="Protein"
            value={totals.protein_g}
            target={targets.protein_g}
            unit="g"
<<<<<<< HEAD
            color="bg-primary"
=======
            color="#4CAF50"
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
          />
          <NutrientBar
            label="Carbs"
            value={totals.carbs_g}
            target={targets.carbs_g}
            unit="g"
<<<<<<< HEAD
            color="bg-secondary"
=======
            color="#2196F3"
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
          />
          <NutrientBar
            label="Fat"
            value={totals.fat_g}
            target={targets.fat_g}
            unit="g"
<<<<<<< HEAD
            color="bg-warning"
=======
            color="#FF9800"
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
          />
        </div>
      </div>
    </div>
  );
}
