// Photo capture & gallery entry point for meal logging.

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import { useConsentStatus } from '../hooks/useConsentStatus';
import { useFoodStore } from '../store/foodStore';
import { analyzeMealPhoto } from '../services/foodApi';
import { colors } from '../constants/colors';
import type { FoodScreenProps } from '../navigation/types';

export function CameraScreen({ navigation, route }: FoodScreenProps<'Camera'>) {
  const { mealType } = route.params;
  const { hasConsent, loading: consentLoading } = useConsentStatus();
  const setCurrentAnalysis = useFoodStore((s) => s.setCurrentAnalysis);
  const [analyzing, setAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    if (!consentLoading && hasConsent === false) {
      navigation.replace('Consent', { nextMealType: mealType });
    }
  }, [consentLoading, hasConsent, navigation, mealType]);

  const handleAnalyze = async (uri: string | undefined, base64: string | undefined) => {
    if (!uri || !base64) {
      Alert.alert('Image error', 'Could not read image data.');
      return;
    }
    setAnalyzing(true);
    try {
      const result = await analyzeMealPhoto(base64, mealType);
      const imageUri = uri || result.image_uri;
      setCurrentAnalysis(imageUri, result.items);
      navigation.replace('PortionSelect', {
        items: result.items,
        imageUri,
        mealType,
      });
    } catch (e) {
      Alert.alert('Analysis failed', 'We could not identify the food in your photo.', [
        { text: 'Retake Photo', onPress: handleTakePhoto },
        { text: 'Add Manually', onPress: () => navigation.replace('ManualFoodSearch', { mealType }) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } finally {
      setAnalyzing(false);
    }
  };

  const processResponse = async (response: ImagePickerResponse) => {
    if (response.didCancel) return;
    if (response.errorCode) {
      Alert.alert('Image picker error', response.errorMessage ?? 'Unknown error');
      return;
    }
    const asset: Asset | undefined = response.assets?.[0];
    if (!asset) return;
    await handleAnalyze(asset.uri, asset.base64);
  };

  const handleTakePhoto = async () => {
    const response = await launchCamera({
      mediaType: 'photo',
      quality: 0.6,
      includeBase64: true,
      saveToPhotos: false,
    });
    await processResponse(response);
  };

  const handleChooseGallery = async () => {
    const response = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.6,
      includeBase64: true,
      selectionLimit: 1,
    });
    await processResponse(response);
  };

  if (consentLoading || hasConsent === null) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Log a {mealType}</Text>
        <Text style={styles.subtitle}>Snap a photo of your meal to get started.</Text>

        {analyzing ? (
          <View style={styles.analyzing}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.analyzingText}>Analyzing your meal…</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleTakePhoto}
              accessibilityRole="button"
              accessibilityLabel="Take photo with camera"
            >
              <Text style={styles.primaryButtonText}>📷 Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleChooseGallery}
              accessibilityRole="button"
              accessibilityLabel="Choose photo from gallery"
            >
              <Text style={styles.secondaryButtonText}>🖼 Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.link}
              onPress={() => navigation.replace('ManualFoodSearch', { mealType })}
              accessibilityRole="link"
              accessibilityLabel="Search foods manually"
            >
              <Text style={styles.linkText}>Or search foods manually</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  button: {
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: colors.secondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  analyzing: {
    alignItems: 'center',
    gap: 12,
  },
  analyzingText: {
    color: colors.textLight,
    fontSize: 14,
  },
});
