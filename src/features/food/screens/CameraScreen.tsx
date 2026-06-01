import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConsentStatus } from '../hooks/useConsentStatus';
import { useFoodStore } from '../store/foodStore';
import { analyzeMealPhoto } from '../services/foodApi';

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
      navigate('../consent', { replace: true, state: { nextMealType: mealType } });
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
      navigate('../portion-select', {
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
      }    } finally {
      setAnalyzing(false);
    }
  };

  // Loading / consent gate
  if (consentLoading || hasConsent === null) {
    return (
      <div className="app-shell flex justify-center p-12">
        <span className="text-[#666666]">Loading…</span>
      </div>
    );
  }

  return (
    <div className="app-shell flex flex-col items-center p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-text-app text-center capitalize m-0">
        Log a {mealType}
      </h1>
      <p className="text-sm text-text-light text-center my-2 mb-6">
        {capturedImage ? 'Review your photo' : 'Position your meal in the viewfinder'}      </p>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Error */}
      {cameraError && !capturedImage && (
        <div className="bg-danger/10 border border-danger rounded-xl py-4 px-5 mb-5 text-danger text-sm text-center w-full max-w-[480px]">
          {cameraError}
          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={startCamera}
          >
            🔄 Try Again
          </button>        </div>
      )}

      {/* Live Camera Viewfinder */}
      {!capturedImage && !cameraError && (
        <div className="relative w-full max-w-[480px] aspect-[4/3] rounded-2xl overflow-hidden bg-black mb-6 shadow-xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />
          {/* Viewfinder overlay corners */}
          {cameraReady && (
            <div className="absolute inset-4 border-2 border-white/30 rounded-xl pointer-events-none" />
          )}
          {/* Camera loading indicator */}
          {!cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
              <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Captured Image Preview */}
      {capturedImage && (
        <div className="relative w-full max-w-[480px] aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-xl">
          <img
            src={capturedImage}
            alt="Captured meal"
            className="w-full h-full object-cover"
          />
          {analyzing && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-white text-sm font-semibold">
                Analyzing your meal…
              </span>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col items-center gap-3 w-full max-w-[480px]">
        {!capturedImage && cameraReady && (
          <button
            id="capture-button"
            type="button"
            onClick={handleCapture}
            aria-label="Capture photo"
            className="capture-btn"          >
            {/* Camera SVG Icon */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
        )}

        {/* Retake & Use Photo — visible after capture */}
        {capturedImage && !analyzing && (
          <div className="flex gap-3 w-full">
            <button
              id="retake-button"
              type="button"
              onClick={handleRetake}
              className="btn btn-secondary flex-1"
              aria-label="Retake photo"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Retake
            </button>
            <button
              id="use-photo-button"
              type="button"
              onClick={handleUsePhoto}
              className="btn btn-primary flex-1"
              aria-label="Use this photo"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
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
          className="link-button mt-6 self-center"
        >
          Or search foods manually
        </button>      )}
    </div>
  );
}
