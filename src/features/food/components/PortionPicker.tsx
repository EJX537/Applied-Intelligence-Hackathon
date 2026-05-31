// Horizontal selector for predefined portion sizes plus a Custom option.

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { PortionOption } from '../types';
import { colors } from '../constants/colors';

interface Props {
  options: PortionOption[];
  selectedGrams: number | null;
  onSelect: (grams: number) => void;
  onCustomPress: () => void;
  customActive: boolean;
}

export function PortionPicker({
  options,
  selectedGrams,
  onSelect,
  onCustomPress,
  customActive,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((opt) => {
        const isSelected = !customActive && selectedGrams === opt.grams;
        return (
          <TouchableOpacity
            key={opt.ref}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(opt.grams)}
            accessibilityRole="button"
            accessibilityLabel={`${opt.label}, ${opt.grams} grams, ${opt.visual}`}
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={[styles.refText, isSelected && styles.textSelected]}>{opt.ref}</Text>
            <Text style={[styles.labelText, isSelected && styles.textSelected]}>{opt.label}</Text>
            <Text style={[styles.gramsText, isSelected && styles.textSelected]}>{opt.grams}g</Text>
            <Text style={[styles.visualText, isSelected && styles.textSelected]}>{opt.visual}</Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        style={[styles.chip, customActive && styles.chipSelected]}
        onPress={onCustomPress}
        accessibilityRole="button"
        accessibilityLabel="Set a custom portion in grams"
        accessibilityState={{ selected: customActive }}
      >
        <Text style={[styles.refText, customActive && styles.textSelected]}>+</Text>
        <Text style={[styles.labelText, customActive && styles.textSelected]}>Custom</Text>
        <Text style={[styles.gramsText, customActive && styles.textSelected]}>set grams</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    minWidth: 84,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: 8,
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  refText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textLight,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  gramsText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  visualText: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 2,
    textAlign: 'center',
  },
  textSelected: {
    color: '#FFFFFF',
  },
});
