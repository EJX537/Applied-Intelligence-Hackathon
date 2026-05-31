// Tracks whether the user has consented to AI meal-photo analysis.

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'food_ai_consent';

export function useConsentStatus() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled) setHasConsent(value === 'true');
      } catch {
        if (!cancelled) setHasConsent(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const grantConsent = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    setHasConsent(true);
  }, []);

  return { hasConsent, grantConsent, loading };
}
