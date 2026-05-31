import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConsentStatus } from '../hooks/useConsentStatus';
import { useFoodStore } from '../store/foodStore';
import { analyzeMealPhoto } from '../services/foodApi';
import { colors } from '../constants/colors';
import type { MealType } from '../types';

interface LocationState {
  mealType?: MealType;
}

function fileToBase64(file: File): Promise<{ base64: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] ?? '';
      resolve({ base64, dataUrl });
    };
    reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
    reader.readAsDataURL(file);
  });
}

export function CameraScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const mealType = state.mealType ?? 'lunch';

  const { hasConsent, loading: consentLoading } = useConsentStatus();
  const setCurrentAnalysis = useFoodStore((s) => s.setCurrentAnalysis);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!consentLoading && hasConsent === false) {
      navigate('/consent', { replace: true, state: { nextMealType: mealType } });
    }
  }, [consentLoading, hasConsent, navigate, mealType]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setAnalyzing(true);
    try {
      const { base64, dataUrl } = await fileToBase64(file);
      const result = await analyzeMealPhoto(base64, mealType);
      const imageUri = dataUrl || result.image_uri;
      setCurrentAnalysis(imageUri, result.items);
      navigate('/portion-select', {
        replace: true,
        state: { items: result.items, imageUri, mealType },
      });
    } catch {
      const retake = window.confirm(
        'Analysis failed. Click OK to choose another photo, or Cancel to enter manually.',
      );
      if (!retake) navigate('/manual-search', { replace: true, state: { mealType } });
    } finally {
      setAnalyzing(false);
    }
  };

  if (consentLoading || hasConsent === null) {
    return (
      <div className="app-shell" style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <span style={{ color: colors.textLight }}>Loading…</span>
      </div>
    );
  }

  return (
    <div
      className="app-shell"
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24 }}
    >
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: colors.text,
          textAlign: 'center',
          textTransform: 'capitalize',
          margin: 0,
        }}
      >
        Log a {mealType}
      </h1>
      <p
        style={{
          fontSize: 14,
          color: colors.textLight,
          textAlign: 'center',
          margin: '8px 0 32px',
        }}
      >
        Upload a photo of your meal to get started.
      </p>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {analyzing ? (
        <div style={{ textAlign: 'center', color: colors.textLight, fontSize: 14 }}>
          Analyzing your meal…
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="btn btn-primary"
            style={{ marginBottom: 12 }}
            aria-label="Take photo with camera"
          >
            📷 Take Photo
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="btn btn-secondary"
            style={{ marginBottom: 12 }}
            aria-label="Choose photo from device"
          >
            🖼 Choose from Device
          </button>
          <button
            type="button"
            onClick={() => navigate('/manual-search', { replace: true, state: { mealType } })}
            className="link-button"
            style={{ marginTop: 24, alignSelf: 'center' }}
          >
            Or search foods manually
          </button>
        </>
      )}
    </div>
  );
}
