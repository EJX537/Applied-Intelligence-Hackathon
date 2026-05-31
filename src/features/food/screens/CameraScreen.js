import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConsentStatus } from '../hooks/useConsentStatus';
import { useFoodStore } from '../store/foodStore';
import { analyzeMealPhoto } from '../services/foodApi';
import { colors } from '../constants/colors';
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
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
    const state = (location.state ?? {});
    const mealType = state.mealType ?? 'lunch';
    const { hasConsent, loading: consentLoading } = useConsentStatus();
    const setCurrentAnalysis = useFoodStore((s) => s.setCurrentAnalysis);
    const [analyzing, setAnalyzing] = useState(false);
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    useEffect(() => {
        if (!consentLoading && hasConsent === false) {
            navigate('/consent', { replace: true, state: { nextMealType: mealType } });
        }
    }, [consentLoading, hasConsent, navigate, mealType]);
    const handleFile = async (file) => {
        if (!file)
            return;
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
        }
        catch {
            const retake = window.confirm('Analysis failed. Click OK to choose another photo, or Cancel to enter manually.');
            if (!retake)
                navigate('/manual-search', { replace: true, state: { mealType } });
        }
        finally {
            setAnalyzing(false);
        }
    };
    if (consentLoading || hasConsent === null) {
        return (_jsx("div", { className: "app-shell", style: { display: 'flex', justifyContent: 'center', padding: 48 }, children: _jsx("span", { style: { color: colors.textLight }, children: "Loading\u2026" }) }));
    }
    return (_jsxs("div", { className: "app-shell", style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24 }, children: [_jsxs("h1", { style: {
                    fontSize: 24,
                    fontWeight: 700,
                    color: colors.text,
                    textAlign: 'center',
                    textTransform: 'capitalize',
                    margin: 0,
                }, children: ["Log a ", mealType] }), _jsx("p", { style: {
                    fontSize: 14,
                    color: colors.textLight,
                    textAlign: 'center',
                    margin: '8px 0 32px',
                }, children: "Upload a photo of your meal to get started." }), _jsx("input", { ref: cameraInputRef, type: "file", accept: "image/*", capture: "environment", hidden: true, onChange: (e) => handleFile(e.target.files?.[0]) }), _jsx("input", { ref: galleryInputRef, type: "file", accept: "image/*", hidden: true, onChange: (e) => handleFile(e.target.files?.[0]) }), analyzing ? (_jsx("div", { style: { textAlign: 'center', color: colors.textLight, fontSize: 14 }, children: "Analyzing your meal\u2026" })) : (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", onClick: () => cameraInputRef.current?.click(), className: "btn btn-primary", style: { marginBottom: 12 }, "aria-label": "Take photo with camera", children: "\uD83D\uDCF7 Take Photo" }), _jsx("button", { type: "button", onClick: () => galleryInputRef.current?.click(), className: "btn btn-secondary", style: { marginBottom: 12 }, "aria-label": "Choose photo from device", children: "\uD83D\uDDBC Choose from Device" }), _jsx("button", { type: "button", onClick: () => navigate('/manual-search', { replace: true, state: { mealType } }), className: "link-button", style: { marginTop: 24, alignSelf: 'center' }, children: "Or search foods manually" })] }))] }));
}
