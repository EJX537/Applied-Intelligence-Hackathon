import { useCallback, useEffect, useState } from 'react';
const STORAGE_KEY = 'food_ai_consent';
export function useConsentStatus() {
    const [hasConsent, setHasConsent] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        try {
            const value = window.localStorage.getItem(STORAGE_KEY);
            setHasConsent(value === 'true');
        }
        catch {
            setHasConsent(false);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const grantConsent = useCallback(async () => {
        window.localStorage.setItem(STORAGE_KEY, 'true');
        setHasConsent(true);
    }, []);
    return { hasConsent, grantConsent, loading };
}
