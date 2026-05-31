// Horizontal progress bar for a single nutrient toward its daily target.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

interface Props {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}

export function NutrientBar({ label, value, target, unit, color }: Props) {
  const ratio = target > 0 ? value / target : 0;
  const widthPct = Math.min(100, Math.max(0, ratio * 100));
  const percentLabel = Math.round(ratio * 100);

  return (
    <View
      style={styles.container}
      accessibilityLabel={`${label}: ${value} of ${target} ${unit}, ${percentLabel} percent`}
    >
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value}/{target}
          {unit}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${widthPct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  value: {
    fontSize: 12,
    color: colors.textLight,
  },
  track: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
