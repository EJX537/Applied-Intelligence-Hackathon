// Top-of-screen summary card showing calorie circle and macro progress bars.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.circle} accessibilityLabel={`Calories: ${totals.calories} of ${targets.calories}`}>
          <Text style={styles.circleValue}>{totals.calories}</Text>
          <Text style={styles.circleUnit}>of {targets.calories}</Text>
          <Text style={styles.circlePct}>{calPct}%</Text>
        </View>
        <View style={styles.bars}>
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
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  circle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  circleUnit: {
    fontSize: 11,
    color: colors.textLight,
  },
  circlePct: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  bars: {
    flex: 1,
  },
});
