import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConsentStatus } from '../hooks/useConsentStatus';
import { useFoodStore } from '../store/foodStore';
import { analyzeMealPhoto } from '../services/foodApi';
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
        return (_jsx("div", { className: "app-shell flex justify-center p-12", children: _jsx("span", { className: "text-[#666666]", children: "Loading\u2026" }) }));
    }
    return (_jsxs("div", { className: "app-shell flex flex-col justify-center p-6", children: [_jsxs("h1", { className: "text-[24px] font-bold text-[#333333] text-center capitalize m-0", children: ["Log a ", mealType] }), _jsx("p", { className: "text-[14px] text-[#666666] text-center my-2 mb-8", children: "Upload a photo of your meal to get started." }), _jsx("input", { ref: cameraInputRef, type: "file", accept: "image/*", capture: "environment", hidden: true, onChange: (e) => handleFile(e.target.files?.[0]) }), _jsx("input", { ref: galleryInputRef, type: "file", accept: "image/*", hidden: true, onChange: (e) => handleFile(e.target.files?.[0]) }), analyzing ? (_jsx("div", { className: "text-center text-[#666666] text-[14px]", children: "Analyzing your meal\u2026" })) : (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", onClick: () => cameraInputRef.current?.click(), className: "btn btn-primary mb-3", "aria-label": "Take photo with camera", children: "\uD83D\uDCF7 Take Photo" }), _jsx("button", { type: "button", onClick: () => galleryInputRef.current?.click(), className: "btn btn-secondary mb-3", "aria-label": "Choose photo from device", children: "\uD83D\uDDBC Choose from Device" }), _jsx("button", { type: "button", onClick: () => navigate('/manual-search', { replace: true, state: { mealType } }), className: "link-button mt-6 self-center", children: "Or search foods manually" })] }))] }));
}
