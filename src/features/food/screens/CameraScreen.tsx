import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConsentStatus } from '../hooks/useConsentStatus';
import { useFoodStore } from '../store/foodStore';
import { analyzeMealPhoto } from '../services/foodApi';
import { colors } from '../constants/colors';
import type { MealType } from '../types';

interface LocationState {
  mealType?: MealType;
}

export function CameraScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const mealType = state.mealType ?? 'lunch';

  const { hasConsent, loading: consentLoading } = useConsentStatus();
  const setCurrentAnalysis = useFoodStore((s) => s.setCurrentAnalysis);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Redirect to consent if needed
  useEffect(() => {
    if (!consentLoading && hasConsent === false) {
      navigate('/consent', { replace: true, state: { nextMealType: mealType } });
    }
  }, [consentLoading, hasConsent, navigate, mealType]);

  // Start front camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions and try again.');
    }
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    if (!consentLoading && hasConsent !== false) {
      startCamera();
    }
    return () => stopCamera();
  }, [consentLoading, hasConsent, startCamera, stopCamera]);

  // Capture a frame from the video
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror the capture to match mirrored preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Retake — discard image and restart camera
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Use the captured photo for analysis
  const handleUsePhoto = async () => {
    if (!capturedImage) return;
    setAnalyzing(true);
    try {
      const base64 = capturedImage.split(',')[1] ?? '';
      const result = await analyzeMealPhoto(base64, mealType);
      const imageUri = capturedImage || result.image_uri;
      setCurrentAnalysis(imageUri, result.items);
      navigate('/portion-select', {
        replace: true,
        state: { items: result.items, imageUri, mealType },
      });
    } catch {
      const retry = window.confirm(
        'Analysis failed. Click OK to retake, or Cancel to enter manually.',
      );
      if (retry) {
        handleRetake();
      } else {
        navigate('/manual-search', { replace: true, state: { mealType } });
      }
    } finally {
      setAnalyzing(false);
    }
  };

  // Loading / consent gate
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
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 24,
        minHeight: '100vh',
      }}
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
          margin: '8px 0 24px',
        }}
      >
        {capturedImage ? 'Review your photo' : 'Position your meal in the viewfinder'}
      </p>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Camera Error */}
      {cameraError && !capturedImage && (
        <div
          style={{
            background: 'rgba(244,67,54,0.1)',
            border: `1px solid ${colors.danger}`,
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 20,
            color: colors.danger,
            fontSize: 14,
            textAlign: 'center',
            width: '100%',
            maxWidth: 480,
          }}
        >
          {cameraError}
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: 12 }}
            onClick={startCamera}
          >
            🔄 Try Again
          </button>
        </div>
      )}

      {/* Live Camera Viewfinder */}
      {!capturedImage && !cameraError && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 480,
            aspectRatio: '4 / 3',
            borderRadius: 20,
            overflow: 'hidden',
            background: '#000',
            marginBottom: 24,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
            }}
          />
          {/* Viewfinder overlay corners */}
          {cameraReady && (
            <div
              style={{
                position: 'absolute',
                inset: 16,
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: 12,
                pointerEvents: 'none',
              }}
            />
          )}
          {/* Camera loading indicator */}
          {!cameraReady && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Captured Image Preview */}
      {capturedImage && (
        <div
          style={{
            width: '100%',
            maxWidth: 480,
            aspectRatio: '4 / 3',
            borderRadius: 20,
            overflow: 'hidden',
            marginBottom: 24,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            position: 'relative',
          }}
        >
          <img
            src={capturedImage}
            alt="Captured meal"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {analyzing && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: '4px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                Analyzing your meal…
              </span>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          maxWidth: 480,
        }}
      >
        {!capturedImage && cameraReady && (
          <button
            id="capture-button"
            type="button"
            onClick={handleCapture}
            aria-label="Capture photo"
            className="capture-btn"
          >
            {/* Camera SVG Icon */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
        )}

        {/* Retake & Use Photo — visible after capture */}
        {capturedImage && !analyzing && (
          <div
            style={{
              display: 'flex',
              gap: 12,
              width: '100%',
            }}
          >
            <button
              id="retake-button"
              type="button"
              onClick={handleRetake}
              className="btn btn-secondary"
              style={{ flex: 1 }}
              aria-label="Retake photo"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Retake
            </button>
            <button
              id="use-photo-button"
              type="button"
              onClick={handleUsePhoto}
              className="btn btn-primary"
              style={{ flex: 1 }}
              aria-label="Use this photo"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Use Photo
            </button>
          </div>
        )}
      </div>

      {/* Manual search fallback */}
      {!analyzing && (
        <button
          type="button"
          onClick={() => navigate('/manual-search', { replace: true, state: { mealType } })}
          className="link-button"
          style={{ marginTop: 24, alignSelf: 'center' }}
        >
          Or search foods manually
        </button>
      )}

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
