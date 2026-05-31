// Manual nutrition entry form for items the API could not enrich.

import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';

interface ManualNutrients {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface Props {
  itemName: string;
  onSubmit: (nutrients: ManualNutrients) => void;
  onSkip: () => void;
}

export function ManualEntryForm({ itemName, onSubmit, onSkip }: Props) {
  const [calories, setCalories] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fat, setFat] = useState<string>('');

  const parseField = (v: string): number => {
    const n = parseFloat(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  const handleSave = () => {
    onSubmit({
      calories: parseField(calories),
      protein_g: parseField(protein),
      carbs_g: parseField(carbs),
      fat_g: parseField(fat),
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Add nutrition for: {itemName}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Calories</Text>
        <TextInput
          style={styles.input}
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
          placeholder="0"
          accessibilityLabel={`Calories for ${itemName}`}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Protein (g)</Text>
        <TextInput
          style={styles.input}
          value={protein}
          onChangeText={setProtein}
          keyboardType="numeric"
          placeholder="0"
          accessibilityLabel={`Protein grams for ${itemName}`}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Carbs (g)</Text>
        <TextInput
          style={styles.input}
          value={carbs}
          onChangeText={setCarbs}
          keyboardType="numeric"
          placeholder="0"
          accessibilityLabel={`Carbs grams for ${itemName}`}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Fat (g)</Text>
        <TextInput
          style={styles.input}
          value={fat}
          onChangeText={setFat}
          keyboardType="numeric"
          placeholder="0"
          accessibilityLabel={`Fat grams for ${itemName}`}
        />
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel={`Save nutrition for ${itemName}`}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.skipButton]}
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel={`Skip and log ${itemName} without nutrition`}
        >
          <Text style={styles.skipText}>Skip — log without nutrition</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    width: 100,
    fontSize: 13,
    color: colors.textLight,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FAFAFA',
    color: colors.text,
  },
  actions: {
    marginTop: 8,
    gap: 8,
  },
  button: {
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipText: {
    color: colors.textLight,
  },
});
