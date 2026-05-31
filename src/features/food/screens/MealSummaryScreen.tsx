// Final summary screen after a meal is logged: items, totals, and manual-entry prompts.

import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFoodStore } from '../store/foodStore';
import { ManualEntryForm } from '../components/ManualEntryForm';
import { colors } from '../constants/colors';
import type { FoodItem } from '../types';
import type { FoodScreenProps } from '../navigation/types';

export function MealSummaryScreen({ navigation, route }: FoodScreenProps<'MealSummary'>) {
  const { response } = route.params;
  const addMeal = useFoodStore((s) => s.addMeal);
  const meals = useFoodStore((s) => s.meals);
  const [storedMealId, setStoredMealId] = useState<string | null>(null);

  if (!storedMealId) {
    addMeal(response.meal);
    setStoredMealId(response.meal.id);
  }

  const dailyTotals = meals.reduce(
    (acc, m) => acc + m.meal_total.calories,
    response.meal.meal_total.calories,
  );

  const [pendingItems, setPendingItems] = useState<FoodItem[]>(response.items_needing_manual_entry);

  const handleManualSubmit = (item: FoodItem) => {
    setPendingItems((prev) => prev.filter((p) => p.name !== item.name));
  };

  const handleDone = () => {
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {response.meal.image_uri && (
          <Image
            source={{ uri: response.meal.image_uri }}
            style={styles.thumbnail}
            accessibilityLabel="Meal photo thumbnail"
          />
        )}
        <Text style={styles.heading}>Meal logged</Text>
        <Text style={styles.subheading}>
          {response.meal.meal_type} · {new Date(response.meal.timestamp).toLocaleTimeString()}
        </Text>

        <View style={styles.totalsCard}>
          <Text style={styles.totalsTitle}>Meal totals</Text>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Calories</Text>
            <Text style={styles.totalsValue}>{response.meal.meal_total.calories} kcal</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Protein</Text>
            <Text style={styles.totalsValue}>{response.meal.meal_total.protein_g} g</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Carbs</Text>
            <Text style={styles.totalsValue}>{response.meal.meal_total.carbs_g} g</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Fat</Text>
            <Text style={styles.totalsValue}>{response.meal.meal_total.fat_g} g</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Items</Text>
        {response.meal.items.map((item, idx) => (
          <View key={`${item.name}-${idx}`} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMacros}>
                P {item.protein_g}g · C {item.carbs_g}g · F {item.fat_g}g
              </Text>
            </View>
            <Text style={styles.itemCalories}>{item.calories} kcal</Text>
          </View>
        ))}

        {pendingItems.map((item) => (
          <ManualEntryForm
            key={`manual-${item.name}`}
            itemName={item.name}
            onSubmit={() => handleManualSubmit(item)}
            onSkip={() => handleManualSubmit(item)}
          />
        ))}

        <View style={styles.dailyCard}>
          <Text style={styles.totalsTitle}>Today's calories</Text>
          <Text style={styles.dailyValue}>{dailyTotals} kcal</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
          accessibilityRole="button"
          accessibilityLabel="Done"
        >
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, paddingBottom: 24 },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: colors.border,
  },
  heading: { fontSize: 22, fontWeight: '700', color: colors.text },
  subheading: { fontSize: 13, color: colors.textLight, marginTop: 2, marginBottom: 16, textTransform: 'capitalize' },
  totalsCard: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 16 },
  totalsTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 8 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  totalsLabel: { color: colors.textLight },
  totalsValue: { color: colors.text, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 8 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.text },
  itemMacros: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  itemCalories: { fontSize: 14, fontWeight: '700', color: colors.primary },
  dailyCard: {
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  dailyValue: { fontSize: 24, fontWeight: '800', color: colors.primary, marginTop: 4 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  doneButton: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
