// Numeric input for entering a custom portion size in grams.

import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';

interface Props {
  onSubmit: (grams: number) => void;
}

export function CustomGramInput({ onSubmit }: Props) {
  const [text, setText] = useState<string>('');

  const handleSubmit = () => {
    const parsed = parseFloat(text);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    onSubmit(parsed);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="grams"
        keyboardType="numeric"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        accessibilityLabel="Custom portion in grams"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        accessibilityRole="button"
        accessibilityLabel="Set custom grams"
      >
        <Text style={styles.buttonText}>Set</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
