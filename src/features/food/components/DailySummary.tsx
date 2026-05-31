import type { NutritionTotals } from '../types';
import { colors } from '../constants/colors';
import { NutrientBar } from './NutrientBar';

interface Props {
  totals: NutritionTotals;
  targets: NutritionTotals;
}

export function DailySummary({ totals, targets }: Props) {
  const calRatio = targets.calories > 0 ? totals.calories / targets.calories : 0;
  const calPct = Math.min(100, Math.round(calRatio * 100));

  return (
    <div
      style={{
        background: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          aria-label={`Calories: ${totals.calories} of ${targets.calories}`}
          style={{
            width: 110,
            height: 110,
            borderRadius: 55,
            border: `6px solid ${colors.primary}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 700, color: colors.text }}>
            {totals.calories}
          </span>
          <span style={{ fontSize: 11, color: colors.textLight }}>of {targets.calories}</span>
          <span style={{ fontSize: 12, color: colors.primary, fontWeight: 600, marginTop: 2 }}>
            {calPct}%
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <NutrientBar
            label="Protein"
            value={totals.protein_g}
            target={targets.protein_g}
            unit="g"
            color={colors.primary}
          />
          <NutrientBar
            label="Carbs"
            value={totals.carbs_g}
            target={targets.carbs_g}
            unit="g"
            color={colors.secondary}
          />
          <NutrientBar
            label="Fat"
            value={totals.fat_g}
            target={targets.fat_g}
            unit="g"
            color={colors.warning}
          />
        </div>
      </div>
    </div>
  );
}
