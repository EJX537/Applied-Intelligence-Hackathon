// Compact card summarizing a logged meal in the daily list.

import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { MealEntry } from '../types';
import { colors } from '../constants/colors';

interface Props {
  meal: MealEntry;
  onDelete: (id: string) => void;
}

const MEAL_ICONS: Record<MealEntry['meal_type'], string> = {
  breakfast: '🍳',
  lunch: '🥗',
  dinner: '🍽',
  snack: '🍎',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function MealCard({ meal, onDelete }: Props) {
  const handleDelete = () => {
    Alert.alert('Delete meal', 'Remove this meal from today\'s log?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(meal.id) },
    ]);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{MEAL_ICONS[meal.meal_type]}</Text>
      <View style={styles.body}>
        <Text style={styles.title}>
          {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
        </Text>
        <Text style={styles.meta}>
          {formatTime(meal.timestamp)} · {meal.items.length} item{meal.items.length === 1 ? '' : 's'}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.calories}>{meal.meal_total.calories} kcal</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${meal.meal_type}`}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  icon: {
    fontSize: 28,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  calories: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
});
