// Initial consent screen explaining how meal photos are used.

import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useConsentStatus } from '../hooks/useConsentStatus';
import { colors } from '../constants/colors';
import type { FoodScreenProps } from '../navigation/types';

export function ConsentScreen({ navigation, route }: FoodScreenProps<'Consent'>) {
  const { grantConsent } = useConsentStatus();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleAccept = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await grantConsent();
      const mealType = route.params?.nextMealType ?? 'lunch';
      navigation.replace('Camera', { mealType });
    } catch (e) {
      Alert.alert('Could not save consent', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.iconWrap}>
          <Text style={styles.iconText}>🍽</Text>
        </View>
        <Text style={styles.title}>How we use your meal photos</Text>
        <View style={styles.bullets}>
          <Text style={styles.bullet}>• Photos are sent to an AI service to identify food items.</Text>
          <Text style={styles.bullet}>• Photos are stored privately on your device and our servers.</Text>
          <Text style={styles.bullet}>• Photos are never shared with third parties.</Text>
          <Text style={styles.bullet}>• You can delete any photo from your meal log at any time.</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleAccept}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel="I understand, continue"
        >
          <Text style={styles.buttonText}>
            {submitting ? 'Saving…' : 'I Understand — Continue'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  bullets: {
    width: '100%',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  bullet: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
