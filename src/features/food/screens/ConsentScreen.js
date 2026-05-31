import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConsentStatus } from '../hooks/useConsentStatus';
import { colors } from '../constants/colors';
export function ConsentScreen() {
    const { grantConsent } = useConsentStatus();
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state ?? {});
    const [submitting, setSubmitting] = useState(false);
    const handleAccept = async () => {
        if (submitting)
            return;
        setSubmitting(true);
        try {
            await grantConsent();
            const mealType = state.nextMealType ?? 'lunch';
            navigate('/camera', { replace: true, state: { mealType } });
        }
        catch {
            window.alert('Could not save consent. Please try again.');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "app-shell", style: { padding: 24, textAlign: 'center' }, children: [_jsx("div", { style: {
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    background: colors.card,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '24px auto 16px',
                    fontSize: 48,
                }, children: "\uD83C\uDF7D" }), _jsx("h1", { style: {
                    fontSize: 22,
                    fontWeight: 700,
                    color: colors.text,
                    marginBottom: 16,
                }, children: "How we use your meal photos" }), _jsxs("div", { style: {
                    background: colors.card,
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 24,
                    textAlign: 'left',
                    lineHeight: 1.5,
                }, children: [_jsx("p", { style: { margin: '0 0 8px', fontSize: 14, color: colors.text }, children: "\u2022 Photos are sent to an AI service to identify food items." }), _jsx("p", { style: { margin: '0 0 8px', fontSize: 14, color: colors.text }, children: "\u2022 Photos are stored privately in your browser and our servers." }), _jsx("p", { style: { margin: '0 0 8px', fontSize: 14, color: colors.text }, children: "\u2022 Photos are never shared with third parties." }), _jsx("p", { style: { margin: 0, fontSize: 14, color: colors.text }, children: "\u2022 You can delete any photo from your meal log at any time." })] }), _jsx("button", { type: "button", onClick: handleAccept, disabled: submitting, "aria-label": "I understand, continue", className: `btn btn-primary${submitting ? ' btn-disabled' : ''}`, children: submitting ? 'Saving…' : 'I Understand — Continue' })] }));
}
