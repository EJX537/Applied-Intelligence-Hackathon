// Per-item portion + quantity selection, name editing, and meal submission.

import React, { useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { PORTION_SIZES } from '../constants/portionSizes';
import { PortionPicker } from '../components/PortionPicker';
import { QuantityStepper } from '../components/QuantityStepper';
import { CustomGramInput } from '../components/CustomGramInput';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { colors } from '../constants/colors';
import { logMeal } from '../services/foodApi';
import type {
  FoodCategory,
  RecognizedItem,
  FoodCorrection,
  LogMealRequest,
  LogMealRequestItem,
} from '../types';
import type { FoodScreenProps } from '../navigation/types';

interface ItemState {
  item: RecognizedItem;
  portion_grams: number | null;
  quantity: number;
  customActive: boolean;
  edited: boolean;
  editedName: string;
  originalName: string;
  originalCategory: FoodCategory;
}

function defaultPortionFor(category: FoodCategory): { grams: number | null; customActive: boolean } {
  const options = PORTION_SIZES[category];
  if (!options || options.length === 0) return { grams: null, customActive: true };
  const medium = options.find((o) => o.label === 'Medium') ?? options[0];
  return { grams: medium.grams, customActive: false };
}

export function PortionSelectScreen({ navigation, route }: FoodScreenProps<'PortionSelect'>) {
  const { items, imageUri, mealType } = route.params;

  const [states, setStates] = useState<ItemState[]>(() =>
    items.map((it) => {
      const { grams, customActive } = defaultPortionFor(it.category);
      return {
        item: it,
        portion_grams: grams,
        quantity: 1,
        customActive,
        edited: false,
        editedName: it.name,
        originalName: it.name,
        originalCategory: it.category,
      };
    }),
  );
  const [submitting, setSubmitting] = useState<boolean>(false);

  const allReady = useMemo(
    () => states.every((s) => s.portion_grams !== null && s.portion_grams > 0),
    [states],
  );

  const update = (index: number, patch: Partial<ItemState>) => {
    setStates((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const removeAt = (index: number) => {
    setStates((prev) => prev.filter((_, i) => i !== index));
  };

  const addManualItem = () => {
    const blank: RecognizedItem = {
      name: 'New item',
      usda_search_term: '',
      category: 'mixed',
      confidence: 'high',
    };
    const { grams, customActive } = defaultPortionFor(blank.category);
    setStates((prev) => [
      ...prev,
      {
        item: blank,
        portion_grams: grams,
        quantity: 1,
        customActive,
        edited: true,
        editedName: blank.name,
        originalName: blank.name,
        originalCategory: blank.category,
      },
    ]);
  };

  const handleConfirm = async () => {
    if (!allReady) {
      Alert.alert('Set portions', 'Please select a portion for every item.');
      return;
    }
    setSubmitting(true);
    try {
      const reqItems: LogMealRequestItem[] = states.map((s) => ({
        name: s.editedName,
        usda_search_term: s.item.usda_search_term,
        category: s.item.category,
        portion_grams: s.portion_grams ?? 0,
        quantity: s.quantity,
      }));
      const corrections: FoodCorrection[] = states
        .filter((s) => s.edited && s.editedName.trim() !== s.originalName)
        .map((s) => ({
          original_name: s.originalName,
          corrected_name: s.editedName.trim(),
          original_category: s.originalCategory,
          corrected_category: s.item.category,
          image_uri: imageUri,
          timestamp: new Date().toISOString(),
        }));
      const req: LogMealRequest = {
        meal_type: mealType,
        image_uri: imageUri,
        items: reqItems,
        corrections,
      };
      const response = await logMeal(req);
      navigation.replace('MealSummary', { response });
    } catch (e) {
      Alert.alert('Could not log meal', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Confirm portions</Text>
        {states.map((s, index) => {
          const options = PORTION_SIZES[s.item.category];
          const isMixed = s.item.category === 'mixed';
          const total = (s.portion_grams ?? 0) * s.quantity;
          return (
            <View key={`${s.originalName}-${index}`} style={styles.card}>
              <View style={styles.cardHeader}>
                <TextInput
                  style={styles.nameInput}
                  value={s.editedName}
                  onChangeText={(t) => update(index, { editedName: t, edited: true })}
                  accessibilityLabel={`Edit name for ${s.originalName}`}
                />
                <ConfidenceBadge confidence={s.item.confidence} />
              </View>
              <Text style={styles.category}>{s.item.category}</Text>
              {!isMixed && (
                <PortionPicker
                  options={options}
                  selectedGrams={s.portion_grams}
                  onSelect={(g) => update(index, { portion_grams: g, customActive: false })}
                  onCustomPress={() => update(index, { customActive: true })}
                  customActive={s.customActive}
                />
              )}
              {(s.customActive || isMixed) && (
                <CustomGramInput
                  onSubmit={(g) => update(index, { portion_grams: g, customActive: true })}
                />
              )}
              <View style={styles.stepperRow}>
                <Text style={styles.stepperLabel}>Quantity</Text>
                <QuantityStepper
                  quantity={s.quantity}
                  onChange={(q) => update(index, { quantity: q })}
                />
              </View>
              <Text style={styles.totalLine}>
                {s.portion_grams ?? '—'}g × {s.quantity} = {total}g
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => update(index, { edited: true })}
                  accessibilityRole="button"
                  accessibilityLabel={`Mark ${s.originalName} as edited`}
                >
                  <Text style={styles.actionText}>Edit name</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeAt(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${s.originalName}`}
                >
                  <Text style={[styles.actionText, { color: colors.danger }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <TouchableOpacity
          style={styles.addButton}
          onPress={addManualItem}
          accessibilityRole="button"
          accessibilityLabel="Add another item manually"
        >
          <Text style={styles.addButtonText}>+ Add another item manually</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirm, (!allReady || submitting) && styles.confirmDisabled]}
          onPress={handleConfirm}
          disabled={!allReady || submitting}
          accessibilityRole="button"
          accessibilityLabel="Confirm and calculate nutrition"
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmText}>Confirm & Calculate</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, paddingBottom: 24 },
  heading: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 12 },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 4,
  },
  category: {
    fontSize: 12,
    color: colors.textLight,
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stepperLabel: { color: colors.textLight, fontSize: 13 },
  totalLine: { marginTop: 10, fontSize: 14, color: colors.text, fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionText: { color: colors.secondary, fontSize: 13, fontWeight: '600' },
  addButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addButtonText: { color: colors.secondary, fontWeight: '600' },
  footer: {
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirm: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDisabled: { opacity: 0.5 },
  confirmText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
