import { useState, useEffect } from 'react';
import { isNative } from '@pwa-kit/sdk';
function detectMode() {
    if (isNative)
        return 'native';
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const minimalUi = window.matchMedia('(display-mode: minimal-ui)').matches;
    if (standalone || minimalUi)
        return 'pwa';
    return 'browser';
}
export function usePwaMode() {
    const [mode, setMode] = useState(detectMode);
    useEffect(() => {
        // Re-evaluate when display-mode changes (e.g. user installs the PWA)
        const mql = window.matchMedia('(display-mode: standalone), (display-mode: minimal-ui)');
        const handler = () => setMode(detectMode());
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);
    return mode;
}
