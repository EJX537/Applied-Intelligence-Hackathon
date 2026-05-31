// Main food feature home: today's date, daily summary, meal list, and add-meal FAB.

import React, { useState } from 'react';
import {
  ActionSheetIOS,
  FlatList,
  Platform,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFoodStore } from '../store/foodStore';
import { useDailyNutrition } from '../hooks/useDailyNutrition';
import { DailySummary } from '../components/DailySummary';
import { MealCard } from '../components/MealCard';
import { colors } from '../constants/colors';
import type { MealType, NutritionTotals } from '../types';
import type { FoodScreenProps } from '../navigation/types';

const DAILY_TARGETS: NutritionTotals = {
  calories: 2000,
  protein_g: 100,
  carbs_g: 250,
  fat_g: 70,
  fiber_g: 30,
  sugar_g: 50,
  sodium_mg: 2300,
};

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function FoodLogScreen({ navigation }: FoodScreenProps<'FoodLog'>) {
  const meals = useFoodStore((s) => s.meals);
  const removeMeal = useFoodStore((s) => s.removeMeal);
  const dailyTotals = useDailyNutrition(meals);
  const [showSheet, setShowSheet] = useState<boolean>(false);

  const promptMealType = (next: (mt: MealType) => void) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Breakfast', 'Lunch', 'Dinner', 'Snack'],
          cancelButtonIndex: 0,
          title: 'Which meal?',
        },
        (idx) => {
          if (idx === 0) return;
          next(MEAL_TYPES[idx - 1]);
        },
      );
      return;
    }
    Alert.alert('Which meal?', undefined, [
      ...MEAL_TYPES.map((mt) => ({
        text: mt.charAt(0).toUpperCase() + mt.slice(1),
        onPress: () => next(mt),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const showAddSheet = () => {
    const options =
      Platform.OS === 'ios'
        ? ['Cancel', 'Take Photo', 'Search Food']
        : ['Take Photo', 'Search Food'];
    const handlePhoto = () =>
      promptMealType((mealType) => navigation.navigate('Camera', { mealType }));
    const handleSearch = () =>
      promptMealType((mealType) => navigation.navigate('ManualFoodSearch', { mealType }));

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 0 },
        (idx) => {
          if (idx === 1) handlePhoto();
          else if (idx === 2) handleSearch();
        },
      );
    } else {
      Alert.alert('Add a meal', undefined, [
        { text: 'Take Photo', onPress: handlePhoto },
        { text: 'Search Food', onPress: handleSearch },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.date}>{todayLabel()}</Text>
        <DailySummary totals={dailyTotals} targets={DAILY_TARGETS} />
        <Text style={styles.sectionTitle}>Today's meals</Text>
        <FlatList
          data={meals}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MealCard meal={item} onDelete={removeMeal} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No meals logged today — tap + to start</Text>
          }
          contentContainerStyle={styles.list}
        />
      </View>
      <TouchableOpacity
        style={styles.fab}
        onPress={showAddSheet}
        accessibilityRole="button"
        accessibilityLabel="Add a meal"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 16 },
  date: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  list: { paddingBottom: 80 },
  empty: {
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 32,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 32,
  },
});
