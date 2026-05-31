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
            {calPct}%
          </span>
        </div>
        <div className="flex-1">
          <NutrientBar
            label="Protein"
            value={totals.protein_g}
            target={targets.protein_g}
            unit="g"
            color="#4CAF50"
          />
          <NutrientBar
            label="Carbs"
            value={totals.carbs_g}
            target={targets.carbs_g}
            unit="g"
            color="#2196F3"
          />
          <NutrientBar
            label="Fat"
            value={totals.fat_g}
            target={targets.fat_g}
            unit="g"
            color="#FF9800"
          />
        </div>
      </div>
    </div>
  );
}
