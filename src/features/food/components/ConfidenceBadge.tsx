// Visual indicator for AI recognition confidence on a food item.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

interface Props {
  confidence: 'high' | 'medium' | 'low';
}

export function ConfidenceBadge({ confidence }: Props) {
  if (confidence === 'high') return null;

  if (confidence === 'medium') {
    return (
      <View style={styles.badge} accessibilityLabel="Medium confidence">
        <Text style={[styles.icon, { color: colors.warning }]}>!</Text>
      </View>
    );
  }

  return (
    <View style={styles.badge} accessibilityLabel="Low confidence">
      <Text style={[styles.icon, { color: colors.danger }]}>x</Text>
      <Text style={[styles.label, { color: colors.danger }]}>Low confidence</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
