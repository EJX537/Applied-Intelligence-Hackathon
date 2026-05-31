// Integer +/- stepper for portion quantity multiplier.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';

interface Props {
  quantity: number;
  onChange: (qty: number) => void;
  max?: number;
}

export function QuantityStepper({ quantity, onChange, max = 10 }: Props) {
  const atMin = quantity <= 1;
  const atMax = quantity >= max;
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.button, atMin && styles.buttonDisabled]}
        onPress={() => !atMin && onChange(quantity - 1)}
        disabled={atMin}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        accessibilityState={{ disabled: atMin }}
      >
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.value} accessibilityLabel={`Quantity ${quantity}`}>
        {quantity}x
      </Text>
      <TouchableOpacity
        style={[styles.button, atMax && styles.buttonDisabled]}
        onPress={() => !atMax && onChange(quantity + 1)}
        disabled={atMax}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        accessibilityState={{ disabled: atMax }}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.border,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  value: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
